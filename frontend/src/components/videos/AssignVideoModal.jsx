import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
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
        // Pre-select already assigned users
        if (video.assignedTo && video.assignedTo.length > 0) {
          // Handle both populated (object with _id) and non-populated (just _id) cases
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Assign Video: {video.title}
        </h2>
        
        {loading ? (
          <p className="text-center py-4">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No viewers found in your organization.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Select viewers who can access this video:
            </p>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-2 mb-4">
              {users.map(user => (
                <label
                  key={user._id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleToggleUser(user._id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Selected: {selectedUsers.length} viewer(s)
            </p>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Assignment'}
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
  );
};

export default AssignVideoModal;

