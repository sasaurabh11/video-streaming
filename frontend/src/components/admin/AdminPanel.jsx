import React, { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiUser, FiMail, FiBriefcase, FiShield, FiPower } from 'react-icons/fi';
import api from '../../api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      const res = await api.users.list({ search: searchTerm });
      setUsers(res.data.users || []);
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
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    try {
      await api.users.updateRole(userId, newRole);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u._id === userId);
    const action = user?.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this user?`)) return;
    try {
      await api.users.toggleStatus(userId);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    loadUsers();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setLoading(true);
    loadUsers();
  };

  return (
    <div className="glass rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="text-gray-400 text-sm">Manage user roles and permissions</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <span className="font-medium text-purple-400">{users.length}</span> users total
        </div>
      </div>

      {/* Search Section */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2.5 border border-gray-700 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-gray-800"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm ? 'No users match your search.' : 'No users in the system.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4" />
                      <span>User</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center space-x-2">
                      <FiBriefcase className="w-4 h-4" />
                      <span>Organization</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center space-x-2">
                      <FiShield className="w-4 h-4" />
                      <span>Role</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-gray-400">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {user.organization || <span className="text-gray-500 italic">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="appearance-none w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm cursor-pointer"
                        >
                          <option value="viewer" className="bg-gray-900">Viewer</option>
                          <option value="editor" className="bg-gray-900">Editor</option>
                          <option value="admin" className="bg-gray-900">Admin</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/30' 
                          : 'bg-red-900/30 text-red-400 border border-red-700/30'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          user.isActive
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/30'
                            : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/30'
                        }`}
                      >
                        <FiPower className="w-4 h-4" />
                        <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;