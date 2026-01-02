import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import api from '../../api';

const VideoUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title || file.name);
    formData.append('description', description);

    setUploading(true);
    setUploadProgress(0);
    try {
      await api.videos.upload(formData, (progress) => {
        setUploadProgress(progress);
      });
      setFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);
      onUploadSuccess?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload Video
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded-lg p-2"
          />
          {file && <p className="text-sm text-gray-500 mt-1">{file.name}</p>}
        </div>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          rows={3}
        />
        {uploading && (
          <div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-sm text-center mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={uploading || !file}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? `Uploading ${uploadProgress}%...` : 'Upload Video'}
        </button>
      </div>
    </div>
  );
};

export default VideoUpload;