import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthContent from './components/auth/AuthContent';
import Dashboard from './components/layout/Dashboard';
import {
  FiMoon,
  FiSun,
  FiMenu,
  FiX
} from 'react-icons/fi';

export default function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          darkMode
            ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-white'
            : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-gray-900'
        }`}
      >
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-10" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur border-b border-gray-800">
          <div className="w-full px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-800 lg:hidden"
              >
                {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                  V
                </div>
                <span className="text-lg font-semibold">
                  Video<span className="font-light">Stream</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-800"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="relative z-10 flex-1 flex items-center">
          <div className="w-full px-6">
            {/* Welcome */}
            <div className="mb-6">
              <div className="glass rounded-2xl p-6 border border-gray-800">
                <h2 className="text-3xl font-bold">
                  Welcome to <span className="text-indigo-400">Video Stream</span>
                </h2>
              </div>
            </div>

            {/* CONTENT — FULL WIDTH */}
            <div className="flex flex-col gap-8 w-full">
              {/* Auth */}
              <div className="glass rounded-2xl p-8 border border-gray-800 w-full">
                <AuthContent
                  showRegister={showRegister}
                  setShowRegister={setShowRegister}
                />
              </div>

              {/* Dashboard */}
              <div className="glass rounded-2xl p-8 border border-gray-800 w-full">
                <Dashboard />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800">
          <div className="w-full px-6 py-6 flex flex-col md:flex-row justify-between items-center">
            <span className="text-sm text-gray-400">
              © Video Stream System
            </span>

            <div className="flex gap-6 text-sm">
              {['Privacy', 'Terms', 'Contact', 'About'].map(link => (
                <a key={link} href="#" className="hover:text-white">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
