import { useState, useEffect, useCallback } from 'react';
import { fetchMediaLibrary, fetchAssetManifest, fetchMetadata } from '../api/nasaAPI';
import Loader from './common/Loader';

export default function ImageSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [metadataDetails, setMetadataDetails] = useState(null);
  
  const [mediaType, setMediaType] = useState('image');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [center, setCenter] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [keywords, setKeywords] = useState('');

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const [favorites, setFavorites] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const pageSize = 24;

  const nasaCenters = [
    'ARC', 'AFRC', 'GRC', 'GSFC', 'HQ', 'JPL', 'JSC', 'KSC', 
    'LARC', 'MSFC', 'SSC', 'WSMR'
  ];

  const generateSuggestions = useCallback((input) => {
    const spaceTerms = [
      'apollo mission', 'mars rover', 'hubble telescope', 'international space station',
      'saturn rings', 'jupiter moons', 'nebula colors', 'galaxy spiral',
      'astronaut spacewalk', 'rocket launch', 'earth from space', 'aurora borealis',
      'solar eclipse', 'lunar surface', 'asteroid belt', 'comet tail',
      'space shuttle', 'satellite deployment', 'planetary alignment', 'meteor shower'
    ];

    if (input.length > 2) {
      const filtered = spaceTerms.filter(term => 
        term.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  const handleSearch = useCallback(async (page = 1, newSearchTerm = null) => {
    const term = newSearchTerm !== null ? newSearchTerm : searchTerm;
    if (!term.trim() && !center && !photographer && !keywords) {
      setError('Please enter a search term or apply filters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setShowSuggestions(false);

      const searchParams = {
        q: term.trim(),
        media_type: mediaType,
        page: page,
        page_size: pageSize
      };

      if (yearStart) searchParams.year_start = yearStart;
      if (yearEnd) searchParams.year_end = yearEnd;
      if (center) searchParams.center = center;
      if (photographer) searchParams.photographer = photographer;
      if (keywords) searchParams.keywords = keywords;

      console.log('🔍 Searching with params:', searchParams);

      const response = await fetchMediaLibrary(searchParams);
      const items = response?.data?.collection?.items || [];
      
      setResults(items);
      setTotalResults(response?.data?.collection?.metadata?.total_hits || 0);
      setCurrentPage(page);

      if (sortBy !== 'relevance' && items.length > 0) {
        const sorted = [...items].sort((a, b) => {
          if (sortBy === 'date') {
            const dateA = new Date(a.data[0]?.date_created || 0);
            const dateB = new Date(b.data[0]?.date_created || 0);
            return dateB - dateA;
          } else if (sortBy === 'title') {
            const titleA = a.data[0]?.title || '';
            const titleB = b.data[0]?.title || '';
            return titleA.localeCompare(titleB);
          }
          return 0;
        });
        setResults(sorted);
      }

    } catch (err) {
      console.error('❌ Search Error:', err);
      setError(`Search failed: ${err.message}`);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, mediaType, yearStart, yearEnd, center, photographer, keywords, sortBy]);

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setLoadingAsset(true);
    setAssetDetails(null);
    setMetadataDetails(null);
    
    try {
      const nasaId = item.data[0]?.nasa_id;
      if (nasaId) {
        const [assetResponse, metadataResponse] = await Promise.all([
          fetchAssetManifest(nasaId).catch(err => {
            console.warn('Asset manifest failed:', err);
            return null;
          }),
          fetchMetadata(nasaId).catch(err => {
            console.warn('Metadata failed:', err);
            return null;
          })
        ]);
        
        if (assetResponse) {
          setAssetDetails(assetResponse.data);
        }
        if (metadataResponse) {
          setMetadataDetails(metadataResponse.data);
        }
      }
    } catch (err) {
      console.error('Error loading asset details:', err);
    } finally {
      setLoadingAsset(false);
    }
  };

  const toggleFavorite = (item) => {
    const nasaId = item.data[0]?.nasa_id;
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.data[0]?.nasa_id === nasaId);
      if (isFavorite) {
        return prev.filter(fav => fav.data[0]?.nasa_id !== nasaId);
      } else {
        return [...prev, item];
      }
    });
  };

  const isFavorite = (item) => {
    return favorites.some(fav => fav.data[0]?.nasa_id === item.data[0]?.nasa_id);
  };

  const clearFilters = () => {
    setMediaType('image');
    setYearStart('');
    setYearEnd('');
    setCenter('');
    setPhotographer('');
    setKeywords('');
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        generateSuggestions(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, generateSuggestions]);

  const renderImageCard = (item, index) => {
    const data = item.data[0];
    const imageUrl = item.links?.[0]?.href;
    const isVideo = item.data[0]?.media_type === 'video';
    
    return (
      <div 
        key={`${data.nasa_id}-${index}`} 
        className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
        onClick={() => handleItemClick(item)}
      >
        <div className="relative aspect-video overflow-hidden">
          {imageUrl && (
            <>
              <img
                src={imageUrl}
                alt={data.title || 'NASA Image'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/300';
                }}
              />
              {isVideo && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </div>
              )}
            </>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between items-end">
                <div className="text-white">
                  <p className="text-sm font-medium truncate">{data.title}</p>
                  <p className="text-xs opacity-90">{new Date(data.date_created).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite(item) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
            {data.title}
          </h3>
          {data.description && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-2">
              {data.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{data.center || 'NASA'}</span>
            <span className={`px-2 py-1 rounded-full ${
              isVideo ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {data.media_type}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="relative">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
                placeholder="Search NASA images and videos..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <button
                onClick={() => handleSearch(1)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setShowSuggestions(false);
                        handleSearch(1, suggestion);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg font-medium transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NASA Center</label>
                <select
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Centers</option>
                  {nasaCenters.map(centerCode => (
                    <option key={centerCode} value={centerCode}>{centerCode}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Start</label>
                <input
                  type="number"
                  value={yearStart}
                  onChange={(e) => setYearStart(e.target.value)}
                  placeholder="e.g. 2020"
                  min="1958"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year End</label>
                <input
                  type="number"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  placeholder="e.g. 2024"
                  min="1958"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. apollo, mars"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photographer</label>
                <input
                  type="text"
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  placeholder="Photographer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleSearch(1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && results.length > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalResults)} of {totalResults} results
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {loading && <Loader />}

      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800">Search Error</h3>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => handleSearch(currentPage)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-4">
              No images or videos found for "{searchTerm}". Try different keywords or adjust your filters.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['apollo 11', 'mars rover', 'hubble telescope', 'earth from space'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      handleSearch(1, suggestion);
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((item, index) => renderImageCard(item, index))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {results.map((item, index) => {
                const data = item.data[0];
                const imageUrl = item.links?.[0]?.href;
                const isVideo = data.media_type === 'video';
                
                return (
                  <div 
                    key={`${data.nasa_id}-${index}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={data.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/128/96';
                          }}
                        />
                        {isVideo && (
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                            {data.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item);
                            }}
                            className={`ml-2 p-1 rounded-full transition-colors ${
                              isFavorite(item) 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                          </button>
                        </div>
                        
                        {data.description && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                            {data.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{data.center || 'NASA'}</span>
                            <span>{new Date(data.date_created).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              isVideo ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {data.media_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 5 + i));
                return (
                  <button
                    key={pageNum}
                    onClick={() => handleSearch(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              </div>
              
              <button
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
              
              <span className="text-sm text-gray-600 ml-4">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-6">
              {loadingAsset ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {selectedItem.links?.[0]?.href && (
                      <div className="relative">
                        {selectedItem.data[0]?.media_type === 'video' ? (
                          <video
                            controls
                            className="w-full rounded-lg"
                            poster={selectedItem.links[0].href}
                          >
                            {assetDetails?.collection?.items?.map((asset, index) => {
                              if (asset.href?.includes('.mp4')) {
                                return (
                                  <source key={index} src={asset.href} type="video/mp4" />
                                );
                              }
                              return null;
                            })}
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={selectedItem.links[0].href}
                            alt={selectedItem.data[0]?.title}
                            className="w-full rounded-lg"
                          />
                        )}
                      </div>
                    )}
                    
                    {assetDetails?.collection?.items && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800">Download Options</h4>
                        <div className="flex flex-wrap gap-2">
                          {assetDetails.collection.items.map((asset, index) => {
                            const fileName = asset.href?.split('/').pop() || 'file';
                            const fileType = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
                            
                            return (
                              <a
                                key={index}
                                href={asset.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                              >
                                {fileType}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {selectedItem.data[0]?.title}
                      </h2>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedItem.data[0]?.media_type === 'video' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedItem.data[0]?.media_type}
                        </span>
                        <button
                          onClick={() => toggleFavorite(selectedItem)}
                          className={`p-1 rounded-full transition-colors ${
                            isFavorite(selectedItem) 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {selectedItem.data[0]?.description && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedItem.data[0].description}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">NASA ID</h4>
                        <p className="text-gray-600 text-sm font-mono">
                          {selectedItem.data[0]?.nasa_id}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Date Created</h4>
                        <p className="text-gray-600 text-sm">
                          {new Date(selectedItem.data[0]?.date_created).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {selectedItem.data[0]?.center && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">NASA Center</h4>
                          <p className="text-gray-600 text-sm">
                            {selectedItem.data[0].center}
                          </p>
                        </div>
                      )}
                      
                      {selectedItem.data[0]?.photographer && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Photographer</h4>
                          <p className="text-gray-600 text-sm">
                            {selectedItem.data[0].photographer}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {selectedItem.data[0]?.keywords && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.data[0].keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {metadataDetails && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Technical Details</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {Object.entries(metadataDetails).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {favorites.length} favorites
            </span>
          </div>
        </div>
      )}
    </div>
  );
}