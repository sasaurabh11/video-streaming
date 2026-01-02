import Video from '../models/Video.js';
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
    const { status, sensitivityStatus, page = 1, limit = 20 } = req.query;

    const query = {
      uploadedBy: req.user._id,
      organization: req.user.organization
    };

    if (status) query.status = status;
    if (sensitivityStatus) query.sensitivityStatus = sensitivityStatus;

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'username email');

    const count = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        videos,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
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

    // Check for token in Authorization header OR query params
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
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Authorization check
    if (video.uploadedBy.toString() !== userId.toString()) {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const { statSync, createReadStream } = await import('fs');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const videoPath = video.processedPath 
      ? join(__dirname, '../..', video.processedPath)
      : video.filePath;

    const stat = statSync(videoPath);
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
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
      };
      res.writeHead(200, head);
      createReadStream(videoPath).pipe(res);
    }

    await video.incrementViews();
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming video',
      error: error.message
    });
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