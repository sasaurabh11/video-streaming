import React, { useState } from 'react';
import { FiFilter, FiSearch, FiCalendar, FiHardDrive, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const AdvancedFilters = ({ filters, onFilterChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="glass rounded-xl border border-gray-800 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <FiFilter className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-3 py-1.5 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          {showAdvanced ? (
            <>
              <FiChevronUp className="w-4 h-4" />
              <span>Hide Advanced</span>
            </>
          ) : (
            <>
              <FiChevronDown className="w-4 h-4" />
              <span>Show Advanced</span>
            </>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search videos by title, description, or tags..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm placeholder-gray-500"
        />
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm appearance-none"
          >
            <option value="" className="bg-gray-900">All Status</option>
            <option value="processing" className="bg-gray-900">Processing</option>
            <option value="completed" className="bg-gray-900">Completed</option>
            <option value="failed" className="bg-gray-900">Failed</option>
          </select>
        </div>

        <div>
          <select
            value={filters.sensitivityStatus || ''}
            onChange={(e) => onFilterChange('sensitivityStatus', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
          >
            <option value="">All Content</option>
            <option value="safe">Safe</option>
            <option value="flagged">Flagged</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
          >
            <option value="createdAt">Upload Date</option>
            <option value="title">Title</option>
            <option value="views">Views</option>
            <option value="duration">Duration</option>
          </select>
        </div>

        <div>
          <select
            value={filters.order || 'desc'}
            onChange={(e) => onFilterChange('order', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-800">
          {/* Date Range */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => onFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => onFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* File Size */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <FiHardDrive className="w-4 h-4 mr-2" />
              File Size (MB)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  value={filters.minSize ? filters.minSize / (1024 * 1024) : ''}
                  onChange={(e) => onFilterChange('minSize', e.target.value ? parseInt(e.target.value) * 1024 * 1024 : '')}
                  className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm placeholder-gray-500"
                  placeholder="Min size"
                  min="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.maxSize ? filters.maxSize / (1024 * 1024) : ''}
                  onChange={(e) => onFilterChange('maxSize', e.target.value ? parseInt(e.target.value) * 1024 * 1024 : '')}
                  className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm placeholder-gray-500"
                  placeholder="Max size"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <FiClock className="w-4 h-4 mr-2" />
              Duration (seconds)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  value={filters.minDuration || ''}
                  onChange={(e) => onFilterChange('minDuration', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm placeholder-gray-500"
                  placeholder="Min duration"
                  min="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.maxDuration || ''}
                  onChange={(e) => onFilterChange('maxDuration', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm placeholder-gray-500"
                  placeholder="Max duration"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onFilterChange('status', '');
                onFilterChange('sensitivityStatus', '');
                onFilterChange('search', '');
                onFilterChange('startDate', '');
                onFilterChange('endDate', '');
                onFilterChange('minSize', '');
                onFilterChange('maxSize', '');
                onFilterChange('minDuration', '');
                onFilterChange('maxDuration', '');
                onFilterChange('sortBy', 'createdAt');
                onFilterChange('order', 'desc');
              }}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;