import React from 'react';
import { Video, Eye, Play, Edit2, Trash2, Clock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

const VideoCard = ({ video, onDelete, onView, onEdit, onAssign, processingProgress, userRole }) => {
  const getStatusBadge = () => {
    const badges = {
      uploading: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Uploading' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Ready' },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Failed' },
    };
    const badge = badges[video.status] || badges.completed;
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getSensitivityBadge = () => {
    if (video.sensitivityStatus === 'safe') {
      return <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Safe</span>;
    }
    if (video.sensitivityStatus === 'flagged') {
      return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Flagged</span>;
    }
    return null;
  };

  const progress = processingProgress?.[video._id] || video.processingProgress || 0;
  const canEdit = userRole !== 'viewer';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="aspect-video bg-gray-200 relative">
        {video.thumbnailPath ? (
          <img src={`${import.meta.env.VITE_BACKEND_URL}${video.thumbnailPath}`} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Video className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {video.status === 'processing' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white text-xs mt-1">{progress}% Complete</p>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg flex-1 truncate">{video.title}</h3>
          <div className="flex gap-1 flex-wrap">
            {getStatusBadge()}
            {getSensitivityBadge()}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description || 'No description'}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {video.views} views
          </span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(video)}
            disabled={video.status !== 'completed'}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => onEdit(video)}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
                title="Edit video"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAssign && onAssign(video)}
                className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                title="Assign to viewers"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(video._id)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                title="Delete video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;