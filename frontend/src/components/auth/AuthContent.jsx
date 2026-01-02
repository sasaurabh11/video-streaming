import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from './Login';
import Register from './Register';
import { FiVideo } from 'react-icons/fi';

const AuthContent = ({ showRegister, setShowRegister }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gray-800" />
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="animate-fadeIn w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
            <FiVideo className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold mb-2 gradient-text">
            Welcome Back
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto">
            Sign in to access your dashboard and manage your video content
          </p>
        </div>

        {/* Auth Box*/}
        <div className="flex justify-center w-full">
          <div className="glass rounded-2xl p-10 border border-gray-800 shadow-2xl w-full max-w-3xl">
            {/* Tabs */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setShowRegister(false)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  !showRegister
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setShowRegister(true)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  showRegister
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            {showRegister ? (
              <Register onToggle={() => setShowRegister(false)} />
            ) : (
              <Login onToggle={() => setShowRegister(true)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthContent;
