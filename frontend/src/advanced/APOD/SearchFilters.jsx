import React, { useState } from 'react';

const SearchFilters = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    mediaType: 'all',
    dateRange: 'all',
    hasHD: false
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const getRandomDate = () => {
    const start = new Date('1995-06-16');
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by keywords, objects, or themes..."
            className="w-full px-4 py-3 pr-12 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            🔍
          </button>
        </div>
      </form>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onSearch(getRandomDate())}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
        >
          🎲 Random Date
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-300"
        >
          {isExpanded ? '🔼' : '🔽'} Filters
        </button>
      </div>
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Media Type</label>
            <select
              value={filters.mediaType}
              onChange={(e) => handleFilterChange('mediaType', e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">All Types</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="decade">Last Decade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">HD Available</label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasHD}
                onChange={(e) => handleFilterChange('hasHD', e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${filters.hasHD ? 'bg-purple-600' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-300 ${filters.hasHD ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
              </div>
              <span className="ml-3 text-white/90">HD Images Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;