import React, { useState, useEffect, createContext, useContext } from 'react';
import { Upload, Video, LogOut, User, Home, Filter, Play, Trash2, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';

// ============ Context ============
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// ============ API Service ============
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  auth: {
    register: (data) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => api.request('/auth/me'),
  },

  videos: {
    upload: async (formData) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/videos/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    },
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/videos?${query}`);
    },
    get: (id) => api.request(`/videos/${id}`),
    delete: (id) => api.request(`/videos/${id}`, { method: 'DELETE' }),
    getStreamUrl: (id) => `${API_URL}/videos/${id}/stream`,
  },
};

// ============ Socket Service ============
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    import('socket.io-client').then(({ io }) => {
      const newSocket = io(SOCKET_URL);
      newSocket.on('connect', () => {
        newSocket.emit('join', user.id);
      });
      setSocket(newSocket);
      return () => newSocket.close();
    });
  }, [user]);

  return socket;
};

// ============ Auth Provider ============
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.auth.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await api.auth.login(credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============ Components ============
const Login = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Video className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Login to VideoStream</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <button onClick={onToggle} className="text-blue-600 hover:underline">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

const Register = ({ onToggle }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </div>
        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <button onClick={onToggle} className="text-purple-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

const VideoUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

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
    try {
      await api.videos.upload(formData);
      setFile(null);
      setTitle('');
      setDescription('');
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
        <button
          onClick={handleSubmit}
          disabled={uploading || !file}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </div>
  );
};

const VideoCard = ({ video, onDelete, onView, processingProgress }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="aspect-video bg-gray-200 relative">
        {video.thumbnailPath ? (
          <img src={`http://localhost:5000${video.thumbnailPath}`} alt={video.title} className="w-full h-full object-cover" />
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
          <div className="flex gap-1">
            {getStatusBadge()}
            {getSensitivityBadge()}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description || 'No description'}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {video.views} views
          </span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onView(video)}
            disabled={video.status !== 'completed'}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
          <button
            onClick={() => onDelete(video._id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = React.useRef(null);
  const mediaSourceRef = React.useRef(null);
  
  React.useEffect(() => {
    if (!video || !videoRef.current) return;

    let sourceBuffer;
    const token = localStorage.getItem('token');
    
    // Simple approach: Use video element with custom fetch
    const videoElement = videoRef.current;
    
    // Create a custom video source handler
    const loadVideo = async () => {
      try {
        // Fetch the video with authentication
        const response = await fetch(api.videos.getStreamUrl(video._id), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load video');
        }

        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        videoElement.src = videoUrl;

        // Cleanup on unmount
        return () => {
          URL.revokeObjectURL(videoUrl);
        };
      } catch (error) {
        console.error('Error loading video:', error);
      }
    };

    loadVideo();
  }, [video]);
  
  if (!video) return null;

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
            ref={videoRef}
            controls
            className="w-full h-full"
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

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [processingProgress, setProcessingProgress] = useState({});
  const { user, logout } = useAuth();
  const socket = useSocket();

  const loadVideos = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await api.videos.list(params);
      setVideos(res.data.videos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [filter]);

  useEffect(() => {
    if (!socket) return;

    socket.on('processing:progress', (data) => {
      setProcessingProgress(prev => ({ ...prev, [data.videoId]: data.progress }));
      if (data.progress === 100) {
        setTimeout(loadVideos, 1000);
      }
    });

    socket.on('processing:error', (data) => {
      alert(`Processing failed: ${data.error}`);
      loadVideos();
    });

    return () => {
      socket.off('processing:progress');
      socket.off('processing:error');
    };
  }, [socket]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.videos.delete(id);
      loadVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">VideoStream</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <User className="w-4 h-4 inline mr-1" />
              {user?.username} ({user?.role})
            </span>
            <button onClick={logout} className="text-red-600 hover:text-red-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <VideoUpload onUploadSuccess={loadVideos} />
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  My Videos
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded px-3 py-1"
                  >
                    <option value="all">All</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Loading...</p>
              ) : videos.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No videos yet. Upload your first video!</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {videos.map(video => (
                    <VideoCard
                      key={video._id}
                      video={video}
                      onDelete={handleDelete}
                      onView={setSelectedVideo}
                      processingProgress={processingProgress}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
};

// ============ Main App ============
export default function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthProvider>
      <AuthContent showRegister={showRegister} setShowRegister={setShowRegister} />
    </AuthProvider>
  );
}

function AuthContent({ showRegister, setShowRegister }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onToggle={() => setShowRegister(false)} />
    ) : (
      <Login onToggle={() => setShowRegister(true)} />
    );
  }

  return <Dashboard />;
}