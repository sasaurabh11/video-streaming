import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiBriefcase, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Register = ({ onToggle }) => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    organization: '', 
    role: 'viewer' 
  });
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Create New Account</h3>
        <p className="text-gray-400 text-sm">Join our community and start exploring</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 p-4 rounded-lg text-sm backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiUser size={18} />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiMail size={18} />
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiBriefcase size={18} />
            </div>
            <input
              type="text"
              placeholder="Organization (optional)"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full appearance-none px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
              >
                <option value="viewer" className="bg-gray-900">👀 Viewer (View only)</option>
                <option value="editor" className="bg-gray-900">✏️ Editor (Upload & Manage)</option>
                <option value="admin" className="bg-gray-900">⚡ Admin (Full Access)</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {formData.role === 'viewer' && 'Can view and browse content only'}
              {formData.role === 'editor' && 'Can upload, edit, and manage content'}
              {formData.role === 'admin' && 'Full access to all features and settings'}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiLock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Password strength</span>
              <span className={`text-xs font-medium ${
                formData.password.length < 6 ? 'text-red-400' : 
                formData.password.length < 10 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {formData.password.length < 6 ? 'Weak' : 
                 formData.password.length < 10 ? 'Medium' : 'Strong'}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  formData.password.length < 6 ? 'bg-red-500 w-1/3' : 
                  formData.password.length < 10 ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <FiUserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button onClick={onToggle} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Sign in here
        </button>
      </div>
    </div>
  );
};

export default Register;