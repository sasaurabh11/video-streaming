import Video from '../models/Video.js';
import User from '../models/User.js';
import { processVideo } from '../services/videoProcessor.js';
import { unlink } from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title, description, tags } = req.body;

    const video = await Video.create({
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      organization: req.user.organization,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: 'uploading'
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video }
    });

    video.status = 'processing';
    await video.save();

    const io = req.app.get('io');
    processVideo(video._id.toString(), io).catch(err => {
      console.error('Background processing error:', err);
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      await unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
};

export const getVideos = async (req, res) => {
  try {
    const { 
      status, 
      sensitivityStatus, 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      startDate,
      endDate,
      minSize,
      maxSize,
      minDuration,
      maxDuration
    } = req.query;

    const query = { organization: req.user.organization };

    if (req.user.role === 'viewer') {
      // Viewers only see videos assigned to them OR public videos
      query.$or = [
        { assignedTo: req.user._id },
        { isPublic: true }
      ];
    } else if (req.user.role === 'editor') {
      query.uploadedBy = req.user._id;
    }

    if (status) query.status = status;
    if (sensitivityStatus) query.sensitivityStatus = sensitivityStatus;

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (minSize || maxSize) {
      query.fileSize = {};
      if (minSize) query.fileSize.$gte = parseInt(minSize);
      if (maxSize) query.fileSize.$lte = parseInt(maxSize);
    }

    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const videos = await Video.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'username email')
      .populate('assignedTo', 'username email');

    const count = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        videos,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message
    });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'username email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.uploadedBy._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }

    res.json({
      success: true,
      data: { video }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message
    });
  }
};

export const streamVideo = async (req, res) => {
  try {
    let userId;
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check authorization based on role
    const isOwner = video.uploadedBy.toString() === userId.toString();
    const isAdmin = user.role === 'admin';
    const isAssigned = video.assignedTo && video.assignedTo.some(id => id.toString() === userId.toString());
    const isPublic = video.isPublic;
    const sameOrg = video.organization === user.organization;

    if (!sameOrg) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video - different organization'
      });
    }

    if (user.role === 'viewer') {
      if (!isAssigned && !isPublic) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this video - not assigned to you'
        });
      }
    } else if (user.role === 'editor') {
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this video - not your video'
        });
      }
    }
    const videoPath = video.processedPath 
      ? join(__dirname, '../..', video.processedPath)
      : video.filePath;

    let stat;
    try {
      stat = statSync(videoPath);
    } catch (error) {
      console.error('Video file not found:', videoPath);
      return res.status(404).json({
        success: false,
        message: 'Video file not found on server'
      });
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = createReadStream(videoPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimeType,
        'Cache-Control': 'no-cache'
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      };
      
      res.writeHead(200, head);
      createReadStream(videoPath).pipe(res);
    }

    video.incrementViews().catch(err => console.error('Error incrementing views:', err));

  } catch (error) {
    console.error('Streaming error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error streaming video',
        error: error.message
      });
    }
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    await unlink(video.filePath).catch(console.error);
    if (video.processedPath) {
      await unlink(join(__dirname, '../..', video.processedPath)).catch(console.error);
    }
    if (video.thumbnailPath) {
      await unlink(join(__dirname, '../..', video.thumbnailPath)).catch(console.error);
    }

    await video.deleteOne();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message
    });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (tags) video.tags = tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) video.isPublic = isPublic;

    await video.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: { video }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message
    });
  }
};

export const assignVideo = async (req, res) => {
  try {
    const { userIds } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign this video'
      });
    }

    video.assignedTo = userIds;
    await video.save();

    res.json({
      success: true,
      message: 'Video assigned successfully',
      data: { video }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning video',
      error: error.message
    });
  }
};