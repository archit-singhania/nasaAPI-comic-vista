import { useEffect, useState, useCallback } from 'react';
import { fetchTle, fetchTleBySearch, fetchTleByCategory, fetchTleBySatelliteId } from '../api/nasaAPI';
import Loader from './common/Loader';

export default function TleVisualizer() {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [searchType, setSearchType] = useState('all'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSatellites, setTotalSatellites] = useState(0);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'stations', label: '🏠 Space Stations' },
    { value: 'visual', label: '👁️ Visible Satellites' },
    { value: 'active-geosynchronous', label: '🌍 Geostationary' },
    { value: 'weather', label: '🌤️ Weather Satellites' },
    { value: 'noaa', label: '📊 NOAA Satellites' },
    { value: 'goes', label: '🛰️ GOES Weather' },
    { value: 'resource', label: '📡 Earth Resources' },
    { value: 'cubesat', label: '📦 CubeSats' },
    { value: 'other', label: '🔧 Other Satellites' }
  ];

  const loadSatellites = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (searchType === 'search' && searchTerm.trim()) {
        console.log('🔍 Searching satellites:', searchTerm);
        response = await fetchTleBySearch(searchTerm.trim());
      } else if (searchType === 'category' && selectedCategory) {
        console.log('📂 Fetching category:', selectedCategory);
        response = await fetchTleByCategory(selectedCategory);
      } else {
        console.log('📡 Fetching all satellites');
        response = await fetchTle({ page: currentPage, page_size: 50 });
      }
      
      const data = response?.data || response;
      
      if (Array.isArray(data)) {
        setSatellites(data);
        setTotalSatellites(data.length);
      } else if (data && typeof data === 'object') {
        setSatellites(data.satellites || [data]);
        setTotalSatellites(data.totalCount || data.total || 1);
      } else {
        setSatellites([]);
        setTotalSatellites(0);
      }
      
    } catch (err) {
      console.error('❌ TLE Frontend Error:', err);
      setError(`Failed to load satellites: ${err.message}`);
      setSatellites([]);
      setTotalSatellites(0);
    } finally {
      setLoading(false);
    }
  }, [searchType, searchTerm, selectedCategory, currentPage]);

  useEffect(() => {
    loadSatellites();
  }, [loadSatellites]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchType('search');
      setSelectedCategory('');
      setCurrentPage(1);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setSearchType(category ? 'category' : 'all');
    setCurrentPage(1);
  };

  const showAll = () => {
    setSearchType('all');
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const handleSatelliteClick = async (satellite) => {
    try {
      setSelectedSatellite({ ...satellite, loading: true });
      
      if (satellite.satelliteId && !satellite.tle) {
        const detailResponse = await fetchTleBySatelliteId(satellite.satelliteId);
        const detailData = detailResponse?.data || detailResponse;
        setSelectedSatellite({ ...detailData, loading: false });
      } else {
        setSelectedSatellite({ ...satellite, loading: false });
      }
    } catch (err) {
      console.error('Failed to load satellite details:', err);
      setSelectedSatellite({ ...satellite, loading: false, error: 'Failed to load details' });
    }
  };

  const closeModal = () => {
    setSelectedSatellite(null);
  };

  const formatTleData = (satellite) => {
    if (satellite.tle) {
      return `${satellite.name}\n${satellite.tle.line1}\n${satellite.tle.line2}`;
    }
    return 'TLE data not available';
  };

  const copyTleData = (satellite) => {
    const tleText = formatTleData(satellite);
    navigator.clipboard.writeText(tleText).then(() => {
      alert('TLE data copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy TLE data');
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search satellites (e.g., ISS, Hubble, NOAA)..."
              className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              🔍 Search
            </button>
          </form>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-gray-800 text-white">
                {cat.label}
              </option>
            ))}
          </select>

          {(searchTerm || selectedCategory) && (
            <button
              onClick={showAll}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Show All
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-300">
          {searchType === 'search' && searchTerm && (
            <p>🔍 Searching for: <span className="font-semibold text-white">"{searchTerm}"</span></p>
          )}
          {searchType === 'category' && selectedCategory && (
            <p>📂 Category: <span className="font-semibold text-white">{categories.find(c => c.value === selectedCategory)?.label}</span></p>
          )}
          <p>Found {totalSatellites} satellite{totalSatellites !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-red-300">Error Loading Satellites</h3>
          </div>
          <p className="text-red-200 mb-3">{error}</p>
          <button 
            onClick={loadSatellites}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {satellites.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No Satellites Found</h3>
            <p className="text-gray-400">
              {searchType === 'search' 
                ? "No satellites match your search. Try a different term or browse by category."
                : "No satellites available in this category at the moment."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {satellites.map((satellite, index) => (
            <div 
              key={`${satellite.satelliteId || satellite.noradCatId || satellite.name}-${index}`} 
              className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 hover:bg-white/20 transition-all cursor-pointer transform hover:scale-105"
              onClick={() => handleSatelliteClick(satellite)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-white truncate pr-2">
                  {satellite.name || 'Unknown Satellite'}
                </h3>
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full whitespace-nowrap">
                  ID: {satellite.satelliteId || satellite.noradCatId || 'N/A'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {satellite.intldes && (
                  <p className="text-gray-300">
                    <span className="text-blue-300">🌍 COSPAR ID:</span> {satellite.intldes}
                  </p>
                )}
                {satellite.epochyr && (
                  <p className="text-gray-300">
                    <span className="text-blue-300">📅 Epoch Year:</span> {satellite.epochyr}
                  </p>
                )}
                {satellite.epochdays && (
                  <p className="text-gray-300">
                    <span className="text-blue-300">📊 Epoch Days:</span> {satellite.epochdays.toFixed(4)}
                  </p>
                )}
                {satellite.inclination && (
                  <p className="text-gray-300">
                    <span className="text-blue-300">🔄 Inclination:</span> {satellite.inclination.toFixed(2)}°
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/20">
                <p className="text-xs text-gray-400 text-center">
                  Click for detailed orbital parameters
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSatellite && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl max-h-[90vh] overflow-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {selectedSatellite.name || 'Satellite Details'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {selectedSatellite.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading detailed information...</p>
                </div>
              ) : selectedSatellite.error ? (
                <div className="text-center py-8 text-red-400">
                  <p>{selectedSatellite.error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-blue-300 border-b border-gray-700 pb-2">
                      📡 Basic Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">NORAD Cat ID:</span> {selectedSatellite.satelliteId || selectedSatellite.noradCatId || 'N/A'}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">COSPAR ID:</span> {selectedSatellite.intldes || 'N/A'}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">Epoch Year:</span> {selectedSatellite.epochyr || 'N/A'}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">Epoch Day:</span> {selectedSatellite.epochdays?.toFixed(6) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-blue-300 border-b border-gray-700 pb-2">
                      🛰️ Orbital Parameters
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">Inclination:</span> {selectedSatellite.inclination?.toFixed(4) || 'N/A'}°
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">RA of Asc Node:</span> {selectedSatellite.raan?.toFixed(4) || 'N/A'}°
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">Eccentricity:</span> {selectedSatellite.eccentricity?.toFixed(7) || 'N/A'}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">Arg of Perigee:</span> {selectedSatellite.argPer?.toFixed(4) || 'N/A'}°
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">Mean Anomaly:</span> {selectedSatellite.meanAnomaly?.toFixed(4) || 'N/A'}°
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-300 font-medium">Mean Motion:</span> {selectedSatellite.meanMotion?.toFixed(8) || 'N/A'} rev/day
                      </p>
                    </div>
                  </div>

                  {selectedSatellite.tle && (
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-blue-300 border-b border-gray-700 pb-2">
                          📄 Two-Line Element (TLE) Data
                        </h4>
                        <button
                          onClick={() => copyTleData(selectedSatellite)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          📋 Copy TLE
                        </button>
                      </div>
                      <pre className="bg-black/50 p-4 rounded-lg text-green-400 text-xs font-mono overflow-x-auto border border-gray-700">
                        {formatTleData(selectedSatellite)}
                      </pre>
                    </div>
                  )}

                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-lg font-semibold text-blue-300 border-b border-gray-700 pb-2">
                      🔧 Technical Parameters
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-blue-300 font-medium mb-1">First Derivative</p>
                        <p className="text-gray-300">{selectedSatellite.firstDev?.toFixed(8) || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-blue-300 font-medium mb-1">Second Derivative</p>
                        <p className="text-gray-300">{selectedSatellite.secondDev?.toFixed(8) || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-blue-300 font-medium mb-1">B-Star Drag</p>
                        <p className="text-gray-300">{selectedSatellite.bstar?.toFixed(8) || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-blue-300 font-medium mb-1">Element Set</p>
                        <p className="text-gray-300">{selectedSatellite.elementSet || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-blue-300 font-medium mb-1">Revolution Number</p>
                        <p className="text-gray-300">{selectedSatellite.revNum || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-blue-300 font-medium mb-1">Ephemeris Type</p>
                        <p className="text-gray-300">{selectedSatellite.ephType || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {satellites.length > 0 && searchType === 'all' && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            ← Previous
          </button>
          <span className="text-white">
            Page {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={satellites.length < 50}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}