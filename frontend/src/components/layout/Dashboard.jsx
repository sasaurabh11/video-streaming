import React, { useState, useEffect } from 'react';
import { Video, User, Home, LogOut, Users, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../api/socket';
import api from '../../api';
import VideoUpload from '../videos/VideoUpload';
import AdvancedFilters from '../videos/AdvancedFilters';
import VideoCard from '../videos/VideoCard';
import VideoPlayer from '../videos/VideoPlayer';
import EditVideoModal from '../videos/EditVideoModal';
import AdminPanel from '../admin/AdminPanel';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [processingProgress, setProcessingProgress] = useState({});
  const [currentView, setCurrentView] = useState('videos');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const { user, logout } = useAuth();
  const socket = useSocket();

  const loadVideos = async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 10 };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const res = await api.videos.list(params);
      setVideos(res.data.videos);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'videos') {
      loadVideos();
    }
  }, [filters, currentView]);

  useEffect(() => {
    if (!socket) return;

    socket.on('processing:progress', (data) => {
      setProcessingProgress(prev => ({ ...prev, [data.videoId]: data.progress }));
      if (data.progress === 100) {
        setTimeout(() => loadVideos(pagination.currentPage), 1000);
      }
    });

    socket.on('processing:error', (data) => {
      alert(`Processing failed: ${data.error}`);
      loadVideos(pagination.currentPage);
    });

    return () => {
      socket.off('processing:progress');
      socket.off('processing:error');
    };
  }, [socket]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.videos.delete(id);
      loadVideos(pagination.currentPage);
    } catch (err) {
      alert(err.message);
    }
  };

  const canUpload = user?.role === 'editor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">VideoStream</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              {user?.username}
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                {user?.role}
              </span>
            </span>
            {isAdmin && (
              <button
                onClick={() => setCurrentView(currentView === 'videos' ? 'admin' : 'videos')}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {currentView === 'videos' ? <Users className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                {currentView === 'videos' ? 'Admin Panel' : 'Videos'}
              </button>
            )}
            <button onClick={logout} className="text-red-600 hover:text-red-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        {currentView === 'admin' ? (
          <AdminPanel />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {canUpload ? (
                <VideoUpload onUploadSuccess={() => loadVideos(1)} />
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-center text-gray-600">
                    You have view-only access. Contact an admin to upload videos.
                  </p>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} />
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  {user?.role === 'viewer' ? 'Assigned Videos' : 'My Videos'}
                </h2>
                
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading...</p>
                ) : videos.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    {canUpload ? 'No videos yet. Upload your first video!' : 'No videos assigned to you yet.'}
                  </p>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {videos.map(video => (
                        <VideoCard
                          key={video._id}
                          video={video}
                          onDelete={handleDelete}
                          onView={setSelectedVideo}
                          onEdit={setEditingVideo}
                          processingProgress={processingProgress}
                          userRole={user?.role}
                        />
                      ))}
                    </div>
                    
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                          onClick={() => loadVideos(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                          className="p-2 border rounded disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm">
                          Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => loadVideos(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className="p-2 border rounded disabled:opacity-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
      
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSave={() => loadVideos(pagination.currentPage)}
        />
      )}
    </div>
  );
};

export default Dashboard;