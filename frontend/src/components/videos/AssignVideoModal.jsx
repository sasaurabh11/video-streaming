import React, { useState, useEffect } from 'react';
import { FiUsers, FiX, FiSave, FiUser, FiMail } from 'react-icons/fi';
import api from '../../api';

const AssignVideoModal = ({ video, onClose, onSave }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.users.list({ role: 'viewer' });
        setUsers(res.data.users || []);
        if (video.assignedTo && video.assignedTo.length > 0) {
          const assignedIds = video.assignedTo.map(u => {
            if (typeof u === 'string') return u;
            return u._id || u;
          });
          setSelectedUsers(assignedIds);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [video]);

  const handleToggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.videos.assign(video._id, selectedUsers);
      onSave();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to assign video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl border border-gray-800 max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assign Video</h2>
                <p className="text-sm text-gray-400 truncate max-w-[200px]">{video.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-full border-4 border-gray-800 mb-4 relative">
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="font-semibold mb-2">No Viewers Found</h3>
              <p className="text-gray-400 text-sm">
                No viewers found in your organization.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Select viewers who can access this video:
              </p>
              
              <div className="max-h-64 overflow-y-auto rounded-lg mb-4">
                {users.map(user => (
                  <label
                    key={user._id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedUsers.includes(user._id)
                        ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/30'
                        : 'hover:bg-gray-800/50 border border-transparent'
                    } rounded-lg mb-2`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleToggleUser(user._id)}
                        className="absolute opacity-0"
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedUsers.includes(user._id)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500'
                          : 'border-gray-600'
                      }`}>
                        {selectedUsers.includes(user._id) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <FiUser className="w-3.5 h-3.5 text-gray-400" />
                        <p className="font-medium">{user.username}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiMail className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="px-4 py-3 bg-gray-900/50 rounded-lg mb-6">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-purple-400">{selectedUsers.length}</span> viewer(s) selected
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || loading || users.length === 0}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Save Assignment</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-700 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignVideoModal;