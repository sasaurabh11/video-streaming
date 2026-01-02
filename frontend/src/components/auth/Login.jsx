import React, { useState } from 'react';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiVideo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Login = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Login to Your Account</h3>
        <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 p-4 rounded-lg text-sm backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FiMail size={18} />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder-gray-500"
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FiLock size={18} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <FiLogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button onClick={onToggle} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one now
        </button>
      </div>
    </div>
  );
};

export default Login;