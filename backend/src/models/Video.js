import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  processedPath: {
    type: String
  },
  thumbnailPath: {
    type: String
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number // in seconds
  },
  mimeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading'
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sensitivityStatus: {
    type: String,
    enum: ['pending', 'safe', 'flagged'],
    default: 'pending'
  },
  sensitivityScore: {
    type: Number,
    min: 0,
    max: 1
  },
  sensitivityDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ uploadedBy: 1, organization: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ sensitivityStatus: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ assignedTo: 1 }); // NEW INDEX

// Virtual for formatted file size
videoSchema.virtual('formattedSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.fileSize === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to increment views
videoSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

const Video = mongoose.model('Video', videoSchema);

export default Video;