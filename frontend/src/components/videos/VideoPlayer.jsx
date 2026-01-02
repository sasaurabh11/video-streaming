import React from 'react';
import api from '../../api';

const VideoPlayer = ({ video, onClose }) => {
  if (!video) return null;

  const token = localStorage.getItem('token');
  const videoSrc = `${api.videos.getStreamUrl(video._id)}?token=${token}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">{video.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>
        <div className="aspect-video bg-black flex items-center justify-center">
          <video
            controls
            className="w-full h-full"
            src={videoSrc}
            key={video._id}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-4">
          <p className="text-gray-600">{video.description}</p>
          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <span>{video.views} views</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            {video.duration && <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;