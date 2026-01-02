import React, { useState, useRef } from 'react';
import { 
  FiUpload, FiVideo, FiFileText, FiX, FiCheck, 
  FiAlertCircle, FiFile, FiClock, FiLink, FiTag,
  FiGlobe, FiLock, FiEye
} from 'react-icons/fi';
import api from '../../api';

const VideoUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
        setUploadError('');
      } else {
        setUploadError('Please select a valid video file');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
        setUploadError('');
      } else {
        setUploadError('Please select a valid video file');
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setUploadError('Please select a video file to upload');
      return;
    }

    // File size validation (max 2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadError('File size must be less than 2GB');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title || file.name.replace(/\.[^/.]+$/, ""));
    formData.append('description', description);
    formData.append('privacy', privacy);
    if (tags.trim()) {
      formData.append('tags', tags);
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    try {
      await api.videos.upload(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      setFile(null);
      setTitle('');
      setDescription('');
      setTags('');
      setPrivacy('public');
      setUploadProgress(0);
      onUploadSuccess?.();
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass rounded-2xl p-6 border border-gray-800 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center space-x-2">
            <FiUpload className="text-indigo-400" />
            <span>Upload Video</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Upload your video content to share with others
          </p>
        </div>
        <div className="px-3 py-1 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 rounded-lg text-sm">
          {uploading ? 'Uploading...' : 'Ready'}
        </div>
      </div>

      <div className="space-y-6">
        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-indigo-500 bg-indigo-900/10'
              : file
              ? 'border-emerald-500 bg-emerald-900/10'
              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
          } ${uploading && 'pointer-events-none opacity-80'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center mx-auto">
                <FiCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <FiFile size={14} />
                    <span>{formatFileSize(file.size)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiClock size={14} />
                    <span>{file.type.split('/')[1].toUpperCase()}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-red-400 hover:text-red-300 text-sm flex items-center justify-center space-x-1 mx-auto"
              >
                <FiX size={16} />
                <span>Remove file</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto">
                <FiVideo className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-medium">Drop your video here or click to browse</p>
                <p className="text-sm text-gray-400 mt-2">
                  Supports MP4, AVI, MOV, WMV up to 2GB
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
                <FiUpload size={16} />
                <span>Browse Files</span>
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Uploading...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <FiClock className="mr-2" />
              <span>Please don't close this window</span>
            </div>
          </div>
        )}

        {/* Video Details Form */}
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Title
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <FiFileText size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500"
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacy Settings
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {privacy === 'public' ? <FiGlobe size={18} /> : <FiLock size={18} />}
                </div>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
                  disabled={uploading}
                >
                  <option value="public" className="bg-gray-900">
                    <FiGlobe className="inline mr-2" />
                    Public (Everyone can view)
                  </option>
                  <option value="private" className="bg-gray-900">
                    <FiLock className="inline mr-2" />
                    Private (Only specific users)
                  </option>
                  <option value="unlisted" className="bg-gray-900">
                    <FiLink className="inline mr-2" />
                    Unlisted (Anyone with link)
                  </option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute left-4 top-4 text-gray-500">
                <FiFileText size={18} />
              </div>
              <textarea
                placeholder="Describe your video content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500 min-h-[100px] resize-y"
                disabled={uploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FiTag className="inline mr-2" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g., tutorial, marketing, conference"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Add relevant tags to help others discover your video
            </p>
          </div>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-200 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <FiAlertCircle size={18} />
              <span>{uploadError}</span>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleSubmit}
          disabled={uploading || !file}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Uploading... {uploadProgress}%</span>
            </>
          ) : (
            <>
              <FiUpload size={20} />
              <span className="font-medium">Upload Video</span>
            </>
          )}
        </button>

        {/* Quick Tips */}
        <div className="border-t border-gray-800 pt-4">
          <p className="text-sm text-gray-500 mb-2">💡 Quick Tips:</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li className="flex items-center space-x-2">
              <FiCheck className="text-green-400" size={12} />
              <span>Keep titles descriptive but concise</span>
            </li>
            <li className="flex items-center space-x-2">
              <FiCheck className="text-green-400" size={12} />
              <span>Choose appropriate privacy settings for your content</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;