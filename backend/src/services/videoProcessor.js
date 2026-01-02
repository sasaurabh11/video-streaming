import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import Video from '../models/Video.js';
import { analyzeSensitivity } from './sensitivityAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

ffmpeg.setFfmpegPath(
  typeof ffmpegStatic === 'string'
    ? ffmpegStatic
    : ffmpegStatic.path
);

ffmpeg.setFfprobePath(
  typeof ffprobeStatic === 'string'
    ? ffprobeStatic
    : ffprobeStatic.path
);

const processedDir = join(__dirname, '../../processed');
if (!existsSync(processedDir)) {
  mkdirSync(processedDir, { recursive: true });
}

export const processVideo = async (videoId, io) => {
  try {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    video.status = 'processing';
    video.processingProgress = 0;
    await video.save();

    emitProgress(io, video, 0, 'Starting video processing...');

    const metadata = await getVideoMetadata(video.filePath);
    video.duration = metadata.duration;
    await video.save();
    emitProgress(io, video, 10, 'Retrieved video metadata');

    const thumbnailPath = await generateThumbnail(video.filePath, video.filename);
    video.thumbnailPath = thumbnailPath;
    await video.save();
    emitProgress(io, video, 30, 'Generated thumbnail');

    const processedPath = await compressVideo(video.filePath, video.filename, (progress) => {
      const currentProgress = 30 + (progress * 0.4); // 30% to 70%
      emitProgress(io, video, currentProgress, 'Compressing video...');
    });
    video.processedPath = processedPath;
    await video.save();
    emitProgress(io, video, 70, 'Video compressed');

    const sensitivityResult = await analyzeSensitivity(video.filePath);
    video.sensitivityStatus = sensitivityResult.status;
    video.sensitivityScore = sensitivityResult.score;
    video.sensitivityDetails = sensitivityResult.details;
    await video.save();
    emitProgress(io, video, 90, 'Analyzed content sensitivity');

    video.status = 'completed';
    video.processingProgress = 100;
    await video.save();
    emitProgress(io, video, 100, 'Processing completed');

    console.log(`✅ Video processing completed: ${videoId}`);
    return video;

  } catch (error) {
    console.error(`❌ Error processing video ${videoId}:`, error);
    
    await Video.findByIdAndUpdate(videoId, {
      status: 'failed',
      processingProgress: 0
    });

    if (io) {
      const video = await Video.findById(videoId);
      io.to(video.uploadedBy.toString()).emit('processing:error', {
        videoId,
        error: error.message
      });
    }

    throw error;
  }
};


const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const duration = metadata.format.duration || 0;
      const size = metadata.format.size || 0;

      resolve({
        duration: Math.round(duration),
        size
      });
    });
  });
};

const generateThumbnail = (filePath, filename) => {
  return new Promise((resolve, reject) => {
    const thumbnailFilename = `thumb-${filename.replace(/\.[^/.]+$/, '')}.jpg`;
    const thumbnailPath = join(processedDir, thumbnailFilename);

    ffmpeg(filePath)
      .screenshots({
        timestamps: ['10%'],
        filename: thumbnailFilename,
        folder: processedDir,
        size: '320x240'
      })
      .on('end', () => {
        resolve(`/processed/${thumbnailFilename}`);
      })
      .on('error', (err) => {
        console.error('Thumbnail generation error:', err);
        reject(err);
      });
  });
};

const compressVideo = (inputPath, filename, onProgress) => {
  return new Promise((resolve, reject) => {
    const outputFilename = `processed-${filename}`;
    const outputPath = join(processedDir, outputFilename);

    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-crf 23',
        '-movflags +faststart'
      ])
      .on('progress', (progress) => {
        const percent = progress.percent || 0;
        if (onProgress) {
          onProgress(percent / 100);
        }
      })
      .on('end', () => {
        resolve(`/processed/${outputFilename}`);
      })
      .on('error', (err) => {
        console.error('Video compression error:', err);
        reject(err);
      })
      .save(outputPath);
  });
};

const emitProgress = (io, video, progress, message) => {
  if (!io) return;

  io.to(video.uploadedBy.toString()).emit('processing:progress', {
    videoId: video._id,
    progress: Math.round(progress),
    message,
    status: video.status
  });
};