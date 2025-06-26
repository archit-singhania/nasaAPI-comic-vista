import { useEffect, useState, useCallback } from 'react';
import { 
  fetchTechTransferPatents, 
  fetchTechTransferSoftware, 
  fetchTechTransferSpinoffs,
  searchTechTransfer 
} from '../api/nasaAPI';
import TechTransferList from '../components/TechTransferList';
import Loader from '../components/common/Loader';

export default function TechTransfer() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('patents');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (searchMode && searchQuery.trim()) {
        console.log('🔍 Searching:', searchQuery, 'in category:', category);
        response = await searchTechTransfer(searchQuery.trim(), category);
      } else {
        console.log('📋 Loading all items for category:', category);
        switch (category) {
          case 'patents':
            response = await fetchTechTransferPatents();
            break;
          case 'software':
            response = await fetchTechTransferSoftware();
            break;
          case 'spinoffs':
            response = await fetchTechTransferSpinoffs();
            break;
          default:
            response = await fetchTechTransferPatents();
        }
      }
      
      let data = [];
      if (response?.results) {
        data = response.results;
      } else if (response?.data?.results) {
        data = response.data.results;
      } else if (response?.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      
      console.log('📊 Loaded items:', data?.length || 0);
      setItems(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error('❌ Error loading tech transfer data:', err);
      
      let errorMessage = `Failed to load ${category}`;
      
      if (err.message.includes('404')) {
        errorMessage = `The ${category} endpoint is not available on the server. Please check if the backend service is properly configured.`;
      } else if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = `Unable to connect to the server. Please check if the backend service is running on localhost:5050.`;
      } else {
        errorMessage = `${errorMessage}: ${err.message}`;
      }
      
      setError(errorMessage);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, searchMode, retryCount]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSearchMode(false);
    setSearchQuery('');
    setError('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchMode(true);
      setError('');
      loadItems();
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchMode(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchMode(false);
    setError(''); 
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadItems();
  };

  const getCategoryDescription = (cat) => {
    switch (cat) {
      case 'patents':
        return 'Explore NASA\'s patent portfolio - innovations available for licensing and technology transfer.';
      case 'software':
        return 'Discover NASA software packages available for download and use.';
      case 'spinoffs':
        return 'Learn about NASA technologies that have been successfully commercialized.';
      default:
        return 'Explore NASA\'s technology transfer opportunities.';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-red-800">Connection Error</h3>
            </div>
            <p className="text-red-700 mb-6 text-left bg-red-100 p-3 rounded border text-sm font-mono">
              {error}
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Try Again {retryCount > 0 && `(Attempt ${retryCount + 1})`}
              </button>
              
              <div className="text-sm text-gray-600 mt-4 text-left">
                <p className="font-semibold mb-2">Troubleshooting steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verify your backend server is running on <code className="bg-gray-200 px-1 rounded">localhost:5050</code></li>
                  <li>Check that the tech-transfer routes are implemented in your backend</li>
                  <li>Ensure CORS is properly configured for cross-origin requests</li>
                  <li>Check the browser's Network tab for detailed error information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NASA Technology Transfer
            </h1>
            <p className="text-gray-600">
              {getCategoryDescription(category)}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {['patents', 'software', 'spinoffs'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder={`Search ${category}...`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Search
                </button>
              </form>

              {searchMode && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-blue-800 text-sm">
                      Searching for "{searchQuery}" in {category}
                    </span>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <TechTransferList
              items={items}
              category={category}
              loading={loading}
              onItemSelect={(item) => {
                console.log('Selected item:', item);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}