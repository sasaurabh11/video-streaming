import React from 'react';
import { 
  FiVideo, FiEye, FiPlay, FiEdit2, FiTrash2, FiClock, 
  FiCheckCircle, FiAlertCircle, FiUserPlus, FiLock,
  FiHeart, FiDownload, FiShare, FiTag, FiCalendar,
  FiBarChart2, FiFlag, FiShield
} from 'react-icons/fi';

const VideoCard = ({ video, onDelete, onView, onEdit, onAssign, processingProgress, userRole, viewMode = 'grid' }) => {
  const getStatusConfig = () => {
    const statuses = {
      uploading: { 
        color: 'from-yellow-500 to-amber-500', 
        bg: 'bg-yellow-900/20',
        text: 'Uploading',
        icon: FiClock
      },
      processing: { 
        color: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-900/20',
        text: 'Processing',
        icon: FiClock
      },
      completed: { 
        color: 'from-emerald-500 to-teal-500', 
        bg: 'bg-emerald-900/20',
        text: 'Ready',
        icon: FiCheckCircle
      },
      failed: { 
        color: 'from-red-500 to-pink-500', 
        bg: 'bg-red-900/20',
        text: 'Failed',
        icon: FiAlertCircle
      },
    };
    return statuses[video.status] || statuses.completed;
  };

  const getSensitivityConfig = () => {
    if (video.sensitivityStatus === 'safe') {
      return { 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-900/30',
        border: 'border-emerald-700/30',
        icon: FiShield,
        text: 'Safe'
      };
    }
    if (video.sensitivityStatus === 'flagged') {
      return { 
        color: 'text-red-400', 
        bg: 'bg-red-900/30',
        border: 'border-red-700/30',
        icon: FiFlag,
        text: 'Flagged'
      };
    }
    return null;
  };

  const getPrivacyConfig = () => {
    const privacy = video.privacy || 'public';
    const configs = {
      public: { icon: FiEye, color: 'text-blue-400', text: 'Public' },
      private: { icon: FiLock, color: 'text-purple-400', text: 'Private' },
      unlisted: { icon: FiEye, color: 'text-amber-400', text: 'Unlisted' }
    };
    return configs[privacy];
  };

  const progress = processingProgress?.[video._id] || video.processingProgress || 0;
  const canEdit = userRole !== 'viewer';
  const statusConfig = getStatusConfig();
  const sensitivityConfig = getSensitivityConfig();
  const privacyConfig = getPrivacyConfig();
  const StatusIcon = statusConfig.icon;
  const PrivacyIcon = privacyConfig?.icon;

  // Grid view (default)
  if (viewMode === 'grid') {
    return (
      <div className="group glass rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] animate-fadeIn">
        {/* Thumbnail Container */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
          {video.thumbnailPath ? (
            <img 
              src={`${import.meta.env.VITE_BACKEND_URL}${video.thumbnailPath}`} 
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
                <FiVideo className="w-10 h-10 text-gray-500" />
              </div>
            </div>
          )}
          
          {/* Status Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <div className={`px-3 py-1.5 rounded-lg backdrop-blur-sm border ${statusConfig.bg} border-gray-700/50`}>
              <div className="flex items-center space-x-1.5">
                <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color.split(' ')[0]}`} />
                <span className="text-xs font-medium text-gray-200">{statusConfig.text}</span>
              </div>
            </div>
            
            {sensitivityConfig && (
              <div className={`px-3 py-1.5 rounded-lg backdrop-blur-sm border ${sensitivityConfig.bg} ${sensitivityConfig.border}`}>
                <div className="flex items-center space-x-1.5">
                  <sensitivityConfig.icon className={`w-3.5 h-3.5 ${sensitivityConfig.color}`} />
                  <span className="text-xs font-medium text-gray-200">{sensitivityConfig.text}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Privacy Badge */}
          {privacyConfig && (
            <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg backdrop-blur-sm bg-gray-900/70 border border-gray-700/50">
              <PrivacyIcon className={`w-3.5 h-3.5 ${privacyConfig.color}`} />
            </div>
          )}
          
          {/* Progress Bar for Processing */}
          {video.status === 'processing' && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Processing video...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${statusConfig.color} transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <button
            onClick={() => video.status === 'completed' && onView(video)}
            disabled={video.status !== 'completed'}
            className={`absolute inset-0 flex items-center justify-center transition-all ${
              video.status === 'completed' 
                ? 'group-hover:bg-black/30 cursor-pointer' 
                : 'cursor-not-allowed'
            }`}
          >
            {video.status === 'completed' && (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl">
                <FiPlay className="w-8 h-8 text-white ml-1" />
              </div>
            )}
          </button>
        </div>
        
        {/* Content Section */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-white transition-colors">
              {video.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
              {video.description || 'No description provided'}
            </p>
          </div>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm mb-5">
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="flex items-center space-x-1.5">
                <FiEye className="w-3.5 h-3.5" />
                <span>{video.views || 0}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>{new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                <FiHeart className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                <FiShare className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => video.status === 'completed' && onView(video)}
              disabled={video.status !== 'completed'}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                video.status === 'completed'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  : 'bg-gray-800 cursor-not-allowed'
              }`}
            >
              <FiPlay className="w-4 h-4" />
              <span>Play Video</span>
            </button>
            
            {canEdit && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(video)}
                  className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group relative"
                  title="Edit video"
                >
                  <FiEdit2 className="w-4 h-4 text-gray-300" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Edit
                  </span>
                </button>
                
                {onAssign && (
                  <button
                    onClick={() => onAssign(video)}
                    className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group relative"
                    title="Assign to viewers"
                  >
                    <FiUserPlus className="w-4 h-4 text-gray-300" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2">
                      Assign
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(video._id)}
                  className="p-2.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-800/30 transition-colors group relative"
                  title="Delete video"
                >
                  <FiTrash2 className="w-4 h-4 text-red-400" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-900 text-white text-xs rounded py-1 px-2">
                    Delete
                  </span>
                </button>
              </div>
            )}
          </div>
          
          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 rounded-full text-xs border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
                  +{video.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="group glass rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 animate-fadeIn">
      <div className="flex">
        {/* Thumbnail for list view */}
        <div className="w-48 relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
          {video.thumbnailPath ? (
            <img 
              src={`${import.meta.env.VITE_BACKEND_URL}${video.thumbnailPath}`} 
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FiVideo className="w-8 h-8 text-gray-500" />
            </div>
          )}
          {video.status === 'processing' && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${statusConfig.color}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Content for list view */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{video.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {video.description || 'No description provided'}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {getStatusConfig() && (
                <div className={`px-3 py-1 rounded-lg ${statusConfig.bg} border border-gray-700/50`}>
                  <span className="text-xs font-medium text-gray-200">{statusConfig.text}</span>
                </div>
              )}
              {sensitivityConfig && (
                <div className={`px-3 py-1 rounded-lg ${sensitivityConfig.bg} ${sensitivityConfig.border}`}>
                  <span className="text-xs font-medium text-gray-200">{sensitivityConfig.text}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center space-x-1.5">
                <FiEye className="w-3.5 h-3.5" />
                <span>{video.views || 0} views</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </span>
              {privacyConfig && (
                <span className="flex items-center space-x-1.5">
                  <PrivacyIcon className={`w-3.5 h-3.5 ${privacyConfig.color}`} />
                  <span>{privacyConfig.text}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => video.status === 'completed' && onView(video)}
                disabled={video.status !== 'completed'}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                <FiPlay className="inline mr-2" />
                Play
              </button>
              
              {canEdit && (
                <>
                  <button
                    onClick={() => onEdit(video)}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(video._id)}
                    className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-800/30"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;