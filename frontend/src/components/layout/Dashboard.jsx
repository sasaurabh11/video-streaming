import React, { useState, useEffect } from 'react';
import {
  FiVideo,
  FiUser,
  FiHome,
  FiLogOut,
  FiUsers,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiUpload,
  FiSearch,
  FiGrid,
  FiList,
  FiSettings
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../api/socket';
import api from '../../api';

import VideoUpload from '../videos/VideoUpload';
import AdvancedFilters from '../videos/AdvancedFilters';
import VideoCard from '../videos/VideoCard';
import VideoPlayer from '../videos/VideoPlayer';
import EditVideoModal from '../videos/EditVideoModal';
import AssignVideoModal from '../videos/AssignVideoModal';
import AdminPanel from '../admin/AdminPanel';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [assigningVideo, setAssigningVideo] = useState(null);
  const [processingProgress, setProcessingProgress] = useState({});
  const [currentView, setCurrentView] = useState('videos');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const canUpload = user?.role === 'editor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const loadVideos = async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      if (searchQuery) params.search = searchQuery;
      Object.keys(params).forEach(k => !params[k] && delete params[k]);

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
    if (currentView === 'videos') loadVideos(1);
  }, [filters, currentView, searchQuery]);

  useEffect(() => {
    if (!socket) return;

    socket.on('processing:progress', data => {
      setProcessingProgress(p => ({ ...p, [data.videoId]: data.progress }));
      if (data.progress === 100) {
        setTimeout(() => loadVideos(pagination.currentPage), 1000);
      }
    });

    socket.on('processing:error', () => {
      loadVideos(pagination.currentPage);
    });

    return () => {
      socket.off('processing:progress');
      socket.off('processing:error');
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950">

      {/* HEADER */}
      <header className="sticky top-0 z-50 glass border-b border-gray-800">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <FiVideo className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">VideoStream</h1>
              <p className="text-xs text-gray-400">Video Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => setCurrentView(currentView === 'videos' ? 'admin' : 'videos')}
                className="px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                {currentView === 'videos' ? <FiUsers /> : <FiHome />}
                {currentView === 'videos' ? 'Admin' : 'Videos'}
              </button>
            )}

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg hover:bg-red-900/30 text-red-400 flex items-center gap-2"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-6">
        {currentView === 'admin' ? (
          <AdminPanel />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">

            {/* LEFT — UPLOAD */}
            <div className="lg:col-span-3">
              {canUpload ? (
                <VideoUpload onUploadSuccess={() => loadVideos(1)} />
              ) : (
                <div className="glass rounded-2xl p-8 border border-gray-800 text-center">
                  <FiShield className="mx-auto mb-4 text-gray-400" size={32} />
                  <h3 className="text-lg font-semibold mb-2">View Only</h3>
                  <p className="text-gray-400">
                    You don’t have permission to upload videos.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — VIDEOS */}
            <div className="lg:col-span-9 space-y-6">

              {/* FILTERS */}
              <div className="glass rounded-2xl p-6 border border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user?.role === 'viewer' ? 'Assigned Videos' : 'My Videos'}
                    </h2>
                    <p className="text-gray-400">{videos.length} videos</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex bg-gray-900 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' && 'bg-gray-800'}`}
                      >
                        <FiGrid />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' && 'bg-gray-800'}`}
                      >
                        <FiList />
                      </button>
                    </div>

                    <AdvancedFilters
                      filters={filters}
                      onFilterChange={(k, v) =>
                        setFilters(prev => ({ ...prev, [k]: v }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* VIDEO GRID */}
              <div className="glass rounded-2xl p-6 border border-gray-800">
                {loading ? (
                  <p className="text-center text-gray-400 py-16">Loading…</p>
                ) : videos.length === 0 ? (
                  <p className="text-center text-gray-400 py-16">
                    No videos found
                  </p>
                ) : (
                  <div
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                        : 'grid-cols-1'
                    }`}
                  >
                    {videos.map(video => (
                      <VideoCard
                        key={video._id}
                        video={video}
                        onView={setSelectedVideo}
                        onEdit={setEditingVideo}
                        onAssign={setAssigningVideo}
                        processingProgress={processingProgress}
                        userRole={user?.role}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
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
      {assigningVideo && (
        <AssignVideoModal
          video={assigningVideo}
          onClose={() => setAssigningVideo(null)}
          onSave={() => loadVideos(pagination.currentPage)}
        />
      )}
    </div>
  );
};

export default Dashboard;
