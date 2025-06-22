import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Calendar, Car, Search, Download, Info, Star, Grid, List, Filter, RefreshCw, ExternalLink, ZoomIn, Heart, Share2, AlertCircle } from 'lucide-react';

const MarsRoverGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [rovers, setRovers] = useState([]);
  const [selectedRover, setSelectedRover] = useState('curiosity');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [date, setDate] = useState('2022-01-01');
  const [sol, setSol] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  const API_BASE = 'http://localhost:5050/api';

  useEffect(() => {
    fetchRovers();
    checkApiHealth();
  }, []);

  useEffect(() => {
    if (selectedRover) {
      fetchCameras();
    }
  }, [selectedRover]);

  useEffect(() => {
    fetchPhotos();
  }, [selectedRover, selectedCamera, date, sol, page]);

  const checkApiHealth = async () => {
    try {
      setConnectionStatus('checking');
      console.log('🔍 Checking API health at:', `${API_BASE}/health`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 
      
      const response = await fetch(`${API_BASE}/health`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApiStats(data);
      setConnectionStatus('connected');
      console.log('✅ API Health:', data);
    } catch (err) {
      console.error('❌ API health check failed:', err);
      setConnectionStatus('disconnected');
      
      let errorMessage = 'Backend connection failed. ';
      if (err.name === 'AbortError') {
        errorMessage += 'Request timed out. ';
      } else if (err.message.includes('fetch')) {
        errorMessage += 'Cannot reach the server. ';
      } else {
        errorMessage += err.message + '. ';
      }
      errorMessage += 'Make sure the Node.js server is running on port 5050.';
      
      setError(errorMessage);
    }
  };

  const fetchRovers = async () => {
    try {
      console.log('🤖 Fetching rovers...');
      const response = await fetch(`${API_BASE}/rovers`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Rovers response:', data);
      
      if (data.success && data.data) {
        setRovers(data.data);
        console.log(`✅ Loaded ${data.data.length} rovers`);
      } else {
        throw new Error(data.error || 'Invalid rovers response');
      }
    } catch (err) {
      console.error('❌ Failed to fetch rovers:', err);
      setError(`Failed to fetch rovers: ${err.message}`);
      setRovers([
        { name: 'Curiosity', status: 'active' },
        { name: 'Perseverance', status: 'active' },
        { name: 'Opportunity', status: 'complete' },
        { name: 'Spirit', status: 'complete' }
      ]);
    }
  };

  const fetchCameras = async () => {
    try {
      console.log(`📷 Fetching cameras for ${selectedRover}...`);
      const response = await fetch(`${API_BASE}/rovers/${selectedRover}/cameras`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Cameras response:', data);
      
      if (data.success && data.data) {
        setCameras(data.data.cameras || []);
        console.log(`✅ Loaded ${data.data.cameras?.length || 0} cameras`);
      } else {
        throw new Error(data.error || 'Invalid cameras response');
      }
    } catch (err) {
      console.error('❌ Failed to fetch cameras:', err);
      setCameras([]);
    }
  };

  const fetchPhotos = async () => {
    if (connectionStatus === 'disconnected') {
      console.log('⏸️ Skipping photo fetch - API disconnected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log(`📸 Fetching photos for ${selectedRover}...`);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '24'
      });
      
      if (sol && sol.trim()) {
        params.append('sol', sol.trim());
        console.log('Using sol:', sol.trim());
      } else if (date) {
        params.append('earth_date', date);
        console.log('Using earth_date:', date);
      }
      
      if (selectedCamera && selectedCamera.trim()) {
        params.append('camera', selectedCamera.trim());
      }

      const url = `${API_BASE}/rovers/${selectedRover}/photos?${params}`;
      console.log('🔗 Fetching from URL:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); 
      
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Photos response:', data);
      
      if (data.success && data.data) {
        const newPhotos = data.data.photos || [];
        setPhotos(prev => page === 1 ? newPhotos : [...prev, ...newPhotos]);
        console.log(`✅ Loaded ${newPhotos.length} photos (page ${page})`);
        
        if (newPhotos.length === 0 && page === 1) {
          setError('No photos found for the selected filters. Try a different date, sol, or camera.');
        }
      } else {
        throw new Error(data.error || 'Invalid photos response format');
      }
    } catch (err) {
      console.error('❌ Failed to fetch photos:', err);
      let errorMessage = 'Failed to fetch photos: ';
      
      if (err.name === 'AbortError') {
        errorMessage += 'Request timed out. The NASA API might be slow.';
      } else if (err.message.includes('fetch')) {
        errorMessage += 'Cannot connect to backend server.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = (photoId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(photoId)) {
        newFavorites.delete(photoId);
      } else {
        newFavorites.add(photoId);
      }
      return newFavorites;
    });
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const sharePhoto = async (photo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mars Photo by ${photo.rover.name}`,
          text: `Check out this amazing Mars photo taken by ${photo.rover.name} rover!`,
          url: photo.img_src
        });
      } catch (err) {
        console.error('Sharing failed:', err);
      }
    } else {
      navigator.clipboard.writeText(photo.img_src);
      alert('Image URL copied to clipboard!');
    }
  };

  const resetFilters = () => {
    setSelectedCamera('');
    setDate('2023-01-01');
    setSol('');
    setPage(1);
    setError('');
  };

  const retryConnection = () => {
    setError('');
    checkApiHealth();
    if (connectionStatus === 'connected') {
      fetchRovers();
    }
  };

  const ConnectionStatus = () => (
    <div className={`flex items-center gap-2 text-sm ${
      connectionStatus === 'connected' ? 'text-green-400' : 
      connectionStatus === 'checking' ? 'text-yellow-400' :
      'text-red-400'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
        connectionStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
        'bg-red-400'
      }`}></div>
      {connectionStatus === 'connected' && 'API Online'}
      {connectionStatus === 'checking' && 'Connecting...'}
      {connectionStatus === 'disconnected' && (
        <div className="flex items-center gap-2">
          <span>API Offline</span>
          <button 
            onClick={retryConnection}
            className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 rounded text-xs transition-colors"
          >
            Retry
          </button>
          <button 
            onClick={() => {
              console.log('🧪 Testing backend connection...');
              fetch(`${API_BASE}/test`)
                .then(res => res.json())
                .then(data => console.log('Test result:', data))
                .catch(err => console.error('Test failed:', err));
            }}
            className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 rounded text-xs transition-colors"
          >
            Test
          </button>
        </div>
      )}
    </div>
  );

  const PhotoCard = ({ photo }) => (
    <div className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
      <div className="relative overflow-hidden">
        <img
          src={photo.img_src}
          alt={`Mars photo by ${photo.rover.name}`}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23374151"/><text x="200" y="150" text-anchor="middle" fill="%23ffffff" font-family="Arial" font-size="16">Image Failed to Load</text></svg>';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => handleFavorite(photo.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
              favorites.has(photo.id) 
                ? 'bg-red-500/90 text-white' 
                : 'bg-black/50 text-white hover:bg-red-500/90'
            }`}
          >
            <Heart size={16} fill={favorites.has(photo.id) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setSelectedPhoto(photo)}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-blue-500/90 backdrop-blur-sm transition-colors duration-200"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <p className="text-sm font-medium">{photo.camera?.full_name || 'Unknown Camera'}</p>
              <p className="text-xs text-gray-300">Sol {photo.sol}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadImage(photo.img_src, `mars-${photo.rover?.name || 'rover'}-${photo.id}.jpg`)}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => sharePhoto(photo)}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-400 text-sm font-medium">
            {photo.rover?.name || selectedRover} Rover
          </span>
          <span className="text-gray-400 text-xs">
            {photo.earth_date}
          </span>
        </div>
        <p className="text-gray-300 text-sm">{photo.camera?.full_name || 'Unknown Camera'}</p>
      </div>
    </div>
  );

  const PhotoModal = ({ photo, onClose }) => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-red-500/90 transition-colors duration-200"
        >
          ✕
        </button>
        
        <div className="flex">
          <div className="flex-1">
            <img
              src={photo.img_src}
              alt={`Mars photo by ${photo.rover?.name || 'rover'}`}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="w-80 p-6 bg-gray-800 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Photo Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Rover</label>
                <p className="text-white font-medium">{photo.rover?.name || selectedRover}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Camera</label>
                <p className="text-white font-medium">{photo.camera?.full_name || 'Unknown Camera'}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Earth Date</label>
                <p className="text-white">{photo.earth_date}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Sol (Mars Day)</label>
                <p className="text-white">{photo.sol}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Photo ID</label>
                <p className="text-white font-mono text-sm">{photo.id}</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleFavorite(photo.id)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
                    favorites.has(photo.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-white hover:bg-red-500'
                  }`}
                >
                  <Heart size={16} className="inline mr-2" fill={favorites.has(photo.id) ? 'currentColor' : 'none'} />
                  {favorites.has(photo.id) ? 'Favorited' : 'Favorite'}
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => downloadImage(photo.img_src, `mars-${photo.rover?.name || 'rover'}-${photo.id}.jpg`)}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Download size={16} className="inline mr-2" />
                  Download
                </button>
                <button
                  onClick={() => sharePhoto(photo)}
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Share2 size={16} className="inline mr-2" />
                  Share
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <a
                  href={photo.img_src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                >
                  <ExternalLink size={14} className="mr-2" />
                  View Original
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <header className="bg-black/30 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Camera className="text-red-400" size={32} />
                <h1 className="text-2xl font-bold text-white">Mars Rover Gallery</h1>
              </div>
              <ConnectionStatus />
            </div>
            
            {apiStats && (
              <div className="text-sm text-gray-400">
                <span>API: {apiStats.status}</span>
                {apiStats.uptime && <span className="ml-2">Uptime: {Math.floor(apiStats.uptime)}s</span>}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Filter size={20} />
              Search Filters
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Car className="inline mr-2" size={16} />
                Rover
              </label>
              <select
                value={selectedRover}
                onChange={(e) => {
                  setSelectedRover(e.target.value);
                  setPage(1);
                }}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {rovers.map(rover => (
                  <option key={rover.name.toLowerCase()} value={rover.name.toLowerCase()}>
                    {rover.name} {rover.status === 'complete' ? '(Mission Complete)' : '(Active)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Camera className="inline mr-2" size={16} />
                Camera
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => {
                  setSelectedCamera(e.target.value);
                  setPage(1);
                }}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">All Cameras</option>
                {cameras.map(camera => (
                  <option key={camera.name} value={camera.name}>
                    {camera.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Calendar className="inline mr-2" size={16} />
                Earth Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSol('');
                  setPage(1);
                }}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || sol !== ''}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Star className="inline mr-2" size={16} />
                Sol (Mars Day)
              </label>
              <input
                type="number"
                value={sol}
                onChange={(e) => {
                  setSol(e.target.value);
                  setPage(1);
                }}
                placeholder="Optional"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Grid size={16} />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <List size={16} />
              List
            </button>
          </div>
          
          <div className="text-gray-300">
            {photos.length > 0 && `${photos.length} photos found`}
            {favorites.size > 0 && ` • ${favorites.size} favorited`}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-100 font-medium">Error</p>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-blue-400">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading Mars photos...</span>
            </div>
          </div>
        )}

        {!loading && photos.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {photos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}

        {!loading && photos.length === 0 && !error && connectionStatus === 'connected' && (
          <div className="text-center py-12">
            <Camera className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No photos found</h3>
            <p className="text-gray-500">Try adjusting your search filters or selecting a different date.</p>
          </div>
        )}

        {photos.length > 0 && photos.length % 24 === 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              {loading ? 'Loading...' : 'Load More Photos'}
            </button>
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </div>
  );
};

export default MarsRoverGallery;