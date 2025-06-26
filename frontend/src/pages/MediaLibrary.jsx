import { useState, useEffect } from 'react';
import ImageSearch from '../components/ImageSearch';
import { fetchTrendingTopics, fetchPopularSearch, fetchFeaturedCollections, fetchSearchSuggestions, fetchRealTimeTrending } from '../api/nasaAPI';

export default function MediaLibrary() {
  const [popularContent, setPopularContent] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [realTimeTrending, setRealTimeTrending] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [popularResponse, trendingResponse, featuredResponse, realTimeResponse] = await Promise.allSettled([
          fetchPopularSearch(),
          fetchTrendingTopics(),
          fetchFeaturedCollections(),
          fetchRealTimeTrending()
        ]);
        
        if (popularResponse.status === 'fulfilled') {
          setPopularContent(popularResponse.value || []);
        } else {
          console.error('Popular search failed:', popularResponse.reason);
        }
        
        if (trendingResponse.status === 'fulfilled') {
          setTrendingTopics(trendingResponse.value?.trending || []);
        } else {
          console.error('Trending topics failed:', trendingResponse.reason);
        }
        
        if (featuredResponse.status === 'fulfilled') {
          setFeaturedCollections(featuredResponse.value?.collections || []);
        } else {
          console.error('Featured collections failed:', featuredResponse.reason);
        }
        
        if (realTimeResponse.status === 'fulfilled') {
          setRealTimeTrending(realTimeResponse.value || []);
        } else {
          console.error('Real-time trending failed:', realTimeResponse.reason);
        }
        
      } catch (error) {
        console.error('Error loading initial content:', error);
        setError('Failed to load content. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialContent();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 2) {
        try {
          const suggestions = await fetchSearchSuggestions(searchQuery);
          setSearchSuggestions(suggestions || []);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSearchSuggestions([]);
        }
      } else {
        setSearchSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleQuickSearch = (searchTerm) => {
    setActiveTab('search');
    setSearchQuery(searchTerm);
    window.dispatchEvent(new CustomEvent('quickSearch', { detail: searchTerm }));
  };

  const refreshRealTimeTrending = async () => {
    try {
      const response = await fetchRealTimeTrending();
      setRealTimeTrending(response || []);
    } catch (error) {
      console.error('Error refreshing real-time trending:', error);
    }
  };

  const getThumbnailUrl = (item) => {
    if (item?.links?.[0]?.href) {
      return item.links[0].href;
    }
    return null;
  };

  const renderImagePreview = (previewImages, maxImages = 4) => {
    if (!previewImages || previewImages.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {previewImages.slice(0, maxImages).map((item, index) => {
          const thumbnailUrl = getThumbnailUrl(item);
          if (!thumbnailUrl) return null;
          
          return (
            <div key={index} className="aspect-square bg-gray-200 rounded overflow-hidden">
              <img
                src={thumbnailUrl}
                alt={item?.data?.[0]?.title || 'NASA Image'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderLoadingSpinner = () => (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const renderError = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-800 mb-2">⚠️ {error}</div>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              NASA Image & Video Library
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              Explore the universe through NASA's incredible collection of images, videos, and audio files. 
              From historic missions to cutting-edge discoveries, discover the wonders of space exploration.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>Millions of Images</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span>HD Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.829 1 1 0 11-1.415-1.415A3.987 3.987 0 0013 12a3.987 3.987 0 00-.172-1.414 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                <span>Audio Collections</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Free Downloads</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'search', label: 'Search Library', icon: '🔍' },
              { id: 'trending', label: 'Trending Now', icon: '📈' },
              { id: 'popular', label: 'Popular Searches', icon: '⭐' },
              { id: 'collections', label: 'Featured Collections', icon: '🎯' },
              { id: 'realtime', label: 'Real-time Trends', icon: '⚡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && renderError()}
        
        {activeTab === 'search' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Search NASA's Image Library</h2>
              <ImageSearch 
                initialQuery={searchQuery}
                suggestions={searchSuggestions}
                onQueryChange={setSearchQuery}
              />
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Trending Topics</h2>
              <div className="text-sm text-gray-500">Updated hourly</div>
            </div>
            
            {loading ? renderLoadingSpinner() : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleQuickSearch(topic.term)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {topic.term}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {topic.searches} searches
                        </span>
                      </div>
                      {renderImagePreview(topic.sampleData, 4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'popular' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Popular Searches</h2>
              <div className="text-sm text-gray-500">Most searched this week</div>
            </div>
            
            {loading ? renderLoadingSpinner() : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {popularContent.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => handleQuickSearch(item.searchTerm)}
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {item.description}
                      </p>
                      {renderImagePreview(item.previewImages, 4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'collections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Collections</h2>
              <div className="text-sm text-gray-500">Curated by NASA</div>
            </div>
            
            {loading ? renderLoadingSpinner() : (
              <div className="grid gap-8">
                {featuredCollections.map((collection, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => handleQuickSearch(collection.searchTerm)}
                  >
                    <div className={`h-32 bg-gradient-to-r ${collection.color} flex items-center justify-center`}>
                      <h3 className="text-2xl font-bold text-white">{collection.title}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{collection.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">
                          {collection.itemCount.toLocaleString()} items
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          Explore Collection →
                        </button>
                      </div>
                      {renderImagePreview(collection.previewImages, 6)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'realtime' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Real-time Trends</h2>
              <button
                onClick={refreshRealTimeTrending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            {loading ? renderLoadingSpinner() : (
              <div className="space-y-4">
                {realTimeTrending.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleQuickSearch(item.term)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                              {item.term}
                            </h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {item.recentSearches}
                          </div>
                          <div className="text-xs text-gray-500">recent searches</div>
                        </div>
                      </div>
                      {item.sampleImages && renderImagePreview(item.sampleImages, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">NASA Image Library</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Explore the universe through NASA's vast collection of images, videos, and audio files. 
                All content is in the public domain and free to use.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Advanced Search</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                This library provides access to NASA's collection of images, videos, and audio files. 
                Content is updated regularly from various NASA missions and programs.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 NASA Image Library. All content is in the public domain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}