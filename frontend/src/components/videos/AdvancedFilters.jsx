import React, { useState } from 'react';
import { Filter, Search, Calendar, HardDrive, Timer } from 'lucide-react';

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

export default AdvancedFilters;