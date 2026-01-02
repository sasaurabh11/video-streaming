import React, { useState, useEffect, createContext, useContext } from 'react';
import { Upload, Video, LogOut, User, Home, Filter, Play, Trash2, AlertCircle, CheckCircle, Clock, Eye, Edit2, Users, Settings, Shield, Search, Calendar, HardDrive, Timer, ChevronLeft, ChevronRight } from 'lucide-react';

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
    upload: async (formData, onProgress) => {
      const token = localStorage.getItem('token');
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress?.(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(JSON.parse(xhr.responseText).message || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        xhr.open('POST', `${API_URL}/videos/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    },
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/videos?${query}`);
    },
    get: (id) => api.request(`/videos/${id}`),
    update: (id, data) => api.request(`/videos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => api.request(`/videos/${id}`, { method: 'DELETE' }),
    assign: (id, userIds) => api.request(`/videos/${id}/assign`, { method: 'POST', body: JSON.stringify({ userIds }) }),
    getStreamUrl: (id) => `${API_URL}/videos/${id}/stream`,
  },

  users: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/users?${query}`);
    },
    updateRole: (id, role) => api.request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    toggleStatus: (id) => api.request(`/users/${id}/status`, { method: 'PATCH' }),
  }
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
  const [formData, setFormData] = useState({ username: '', email: '', password: '', organization: '', role: 'viewer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
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
            type="text"
            placeholder="Organization (optional)"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="viewer">Viewer (View only)</option>
              <option value="editor">Editor (Upload & Manage)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>
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

const AdvancedFilters = ({ filters, onFilterChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={filters.sensitivityStatus || ''}
          onChange={(e) => onFilterChange('sensitivityStatus', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Content</option>
          <option value="safe">Safe</option>
          <option value="flagged">Flagged</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="createdAt">Upload Date</option>
          <option value="title">Title</option>
          <option value="views">Views</option>
          <option value="duration">Duration</option>
        </select>

        <select
          value={filters.order || 'desc'}
          onChange={(e) => onFilterChange('order', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search videos..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {showAdvanced && (
        <div className="space-y-3 pt-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <HardDrive className="w-3 h-3" />
                Min Size (MB)
              </label>
              <input
                type="number"
                value={filters.minSize || ''}
                onChange={(e) => onFilterChange('minSize', e.target.value ? parseInt(e.target.value) * 1024 * 1024 : '')}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <HardDrive className="w-3 h-3" />
                Max Size (MB)
              </label>
              <input
                type="number"
                value={filters.maxSize || ''}
                onChange={(e) => onFilterChange('maxSize', e.target.value ? parseInt(e.target.value) * 1024 * 1024 : '')}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <Timer className="w-3 h-3" />
                Min Duration (sec)
              </label>
              <input
                type="number"
                value={filters.minDuration || ''}
                onChange={(e) => onFilterChange('minDuration', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <Timer className="w-3 h-3" />
                Max Duration (sec)
              </label>
              <input
                type="number"
                value={filters.maxDuration || ''}
                onChange={(e) => onFilterChange('maxDuration', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="3600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoCard = ({ video, onDelete, onView, onEdit, processingProgress, userRole }) => {
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
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(video._id)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
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

const EditVideoModal = ({ video, onClose, onSave }) => {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.videos.update(video._id, { title, description });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Video</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      const res = await api.users.list({ search: searchTerm });
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    try {
      await api.users.updateRole(userId, newRole);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    if (!confirm('Toggle user status?')) return;
    try {
      await api.users.toggleStatus(userId);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    loadUsers();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        User Management
      </h2>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Organization</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-3 text-sm">{user.username}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">{user.organization}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

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