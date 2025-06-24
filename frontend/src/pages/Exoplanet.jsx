import { useEffect, useState } from 'react';
import { fetchExoplanet } from '../api/nasaAPI';
import ExoplanetTable from '../components/ExoplanetTable';
import Loader from '../components/common/Loader';

export default function Exoplanet() {
  const [exoplanets, setExoplanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    loadExoplanets();
    loadStats();
  }, []);

  const loadExoplanets = async (customQuery = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const query = customQuery || "SELECT pl_name, hostname, discoverymethod, disc_year, pl_orbper, pl_rade, pl_masse, sy_dist, pl_eqt, st_spectype, sy_snum, sy_pnum FROM ps WHERE default_flag=1 LIMIT 500";
      
      const response = await fetchExoplanet({ query });
      
      if (response.data && response.data.data) {
        setExoplanets(response.data.data);
      } else {
        setExoplanets([]);
      }
    } catch (err) {
      console.error('Error loading exoplanets:', err);
      setError(err.message || 'Failed to load exoplanet data');
      setExoplanets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      try {
        const response = await fetch('/api/exoplanet/quick-stats');
        const data = await response.json();
        
        if (response.ok && data.by_discovery_method) {
          setStats(data.by_discovery_method);
          return;
        }
      } catch (quickStatsError) {
        console.log('Quick stats failed, trying simple stats...');
      }

      try {
        const response = await fetch('/api/exoplanet/simple-stats');
        const data = await response.json();
        
        if (response.ok && data.by_discovery_method) {
          setStats(data.by_discovery_method);
          return;
        }
      } catch (simpleStatsError) {
        console.log('Simple stats failed, trying minimal approach...');
      }

      const response = await fetchExoplanet({ 
        query: "SELECT discoverymethod FROM ps WHERE default_flag=1 AND discoverymethod IS NOT NULL LIMIT 1000" 
      });
      
      if (response.data && response.data.data) {
        const methodCounts = {};
        response.data.data.forEach(item => {
          if (item.discoverymethod) {
            methodCounts[item.discoverymethod] = (methodCounts[item.discoverymethod] || 0) + 1;
          }
        });
        
        const sortedMethods = Object.entries(methodCounts)
          .map(([method, count]) => ({ discoverymethod: method, count }))
          .sort((a, b) => b.count - a.count);
        
        setStats(sortedMethods);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadExoplanets();
      return;
    }

    const searchQuery = `SELECT pl_name, hostname, discoverymethod, disc_year, pl_orbper, pl_rade, pl_masse, sy_dist FROM ps WHERE (pl_name LIKE '%${searchTerm}%' OR hostname LIKE '%${searchTerm}%') AND default_flag=1 LIMIT 100`;
    
    await loadExoplanets(searchQuery);
    setCurrentPage(1);
  };

  const handleMethodFilter = async (method) => {
    setSelectedMethod(method);
    setCurrentPage(1);
    
    if (method === 'all') {
      loadExoplanets();
    } else {
      const methodQuery = `SELECT pl_name, hostname, discoverymethod, disc_year, pl_orbper, pl_rade, pl_masse, sy_dist FROM ps WHERE discoverymethod='${method}' AND default_flag=1 LIMIT 300`;
      await loadExoplanets(methodQuery);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setSelectedMethod('all');
    setCurrentPage(1);
    loadExoplanets();
    loadStats();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = exoplanets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(exoplanets.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="text-white mt-4">Loading exoplanet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            NASA Exoplanet Explorer
          </h1>
          <p className="text-gray-300 text-lg">
            Discover thousands of confirmed exoplanets from NASA's Exoplanet Archive
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by planet or star name..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-300">Filter by method:</label>
              <select
                value={selectedMethod}
                onChange={(e) => handleMethodFilter(e.target.value)}
                disabled={loading}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <option value="all">All Methods</option>
                {stats && stats.slice(0, 8).map((stat, index) => (
                  <option key={index} value={stat.discoverymethod}>
                    {stat.discoverymethod} ({stat.count})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center text-blue-400">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Loading data from NASA Exoplanet Archive...</span>
              </div>
            </div>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Discovery Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {stats.slice(0, 6).map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{stat.count}</div>
                  <div className="text-xs text-gray-400 truncate" title={stat.discoverymethod}>
                    {stat.discoverymethod}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <div>
                <div className="font-semibold">Error loading data:</div>
                <div className="text-sm">{error}</div>
                <div className="text-xs mt-1 text-red-300">
                  This might be due to API connectivity issues. Try refreshing the page.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-300">
            Showing {currentItems.length} of {exoplanets.length} exoplanets
            {selectedMethod !== 'all' && ` (filtered by ${selectedMethod})`}
          </p>
        </div>

        {exoplanets.length > 0 ? (
          <>
            <ExoplanetTable exoplanets={currentItems} />
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No exoplanets found</h3>
              <p className="text-gray-400">
                {searchTerm || selectedMethod !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Unable to load exoplanet data at this time. This might be due to API connectivity issues.'
                }
              </p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}