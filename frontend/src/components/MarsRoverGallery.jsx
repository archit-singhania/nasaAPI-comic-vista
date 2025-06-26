import { useState, useEffect, useCallback } from 'react';
import { Camera, Calendar, Car, Search, Download, Info, Star, Grid, List, Filter, RefreshCw, ExternalLink, ZoomIn, Heart, Share2, AlertCircle, Sparkles, Rocket } from 'lucide-react';
import { fetchRovers, fetchCameras, fetchPhotos } from '../api/nasaAPI';

const funFacts = [
  "🚀 Curiosity has traveled over 30 km on Mars since its 2012 landing!",
  "🛰️ Perseverance is the first rover to carry microphones to record Martian sounds.",
  "🧪 NASA's rovers help search for signs of ancient life on Mars.",
  "🌬️ Mars rovers have to survive dust storms and freezing nights!",
  "🔍 Opportunity once found tiny spheres nicknamed 'blueberries' that suggest past water!",
  "📸 The rovers have sent back over 1 million images from Mars!",
  "🎯 Perseverance landed in Jezero Crater — once a lake billions of years ago.",
];

const MarsRoverGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [rovers, setRovers] = useState([
    { name: 'Curiosity', status: 'active' },
    { name: 'Opportunity', status: 'complete' },
    { name: 'Spirit', status: 'complete' },
    { name: 'Perseverance', status: 'active' },
    { name: 'Ingenuity', status: 'active' }
  ]);
  const [selectedRover, setSelectedRover] = useState('curiosity');
  const [cameras, setCameras] = useState([
    { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
    { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
    { name: 'MAST', full_name: 'Mast Camera' },
    { name: 'CHEMCAM', full_name: 'Chemistry and Camera Complex' },
    { name: 'MAHLI', full_name: 'Mars Hand Lens Imager' },
    { name: 'MARDI', full_name: 'Mars Descent Imager' },
    { name: 'NAVCAM', full_name: 'Navigation Camera' }
  ]);
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
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [downloadStatus, setDownloadStatus] = useState({});
  const [shareStatus, setShareStatus] = useState({});
  const [funFact, setFunFact] = useState('');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/mars/photos?rover=curiosity&earth_date=2022-01-01');
        if (res.ok) {
          setApiStats({ status: 'online', uptime: null });
        } else {
          setApiStats({ status: 'offline', uptime: null });
        }
      } catch (err) {
        console.error('API is unreachable:', err);
        setApiStats({ status: 'offline', uptime: null });
      }
    };

    checkApiStatus();
  }, []);

  const isApiOnline = apiStats?.status === 'online';

  useEffect(() => {
    const fetchRoversData = async () => {
      await fetchRovers(setRovers, setError);
    };
    fetchRoversData();
  }, []);

  useEffect(() => {
    if (selectedRover) {
      fetchCameras(selectedRover, setCameras);
    }
  }, [selectedRover]);

  useEffect(() => {
    const fetchPhotosData = async () => {
      await fetchPhotos(
        { connectionStatus, selectedRover, sol, date, selectedCamera },
        setPhotos,
        setLoading,
        setError,
        page
      );
    };
    fetchPhotosData();
  }, [selectedRover, selectedCamera, date, sol, page]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setFunFact(funFacts[randomIndex]);
  }, []);

  const handleFavorite = (photoId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(photoId)) {
        newFavorites.delete(photoId);
      } else {
        newFavorites.add(photoId);
      }
      try {
        const favArray = Array.from(newFavorites);
        localStorage.setItem('mars-favorites', JSON.stringify(favArray));
      } catch (e) {
        console.log('LocalStorage not available, storing in memory only');
      }
      return newFavorites;
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mars-favorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.log('LocalStorage not available');
    }
  }, []);

  const downloadImage = async (imageUrl, filename, photoId) => {
    setDownloadStatus(prev => ({ ...prev, [photoId]: 'downloading' }));
    
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
      
      setDownloadStatus(prev => ({ ...prev, [photoId]: 'success' }));
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [photoId]: null }));
      }, 2000);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadStatus(prev => ({ ...prev, [photoId]: 'error' }));
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [photoId]: null }));
      }, 2000);
    }
  };

  const sharePhoto = async (photo) => {
    setShareStatus(prev => ({ ...prev, [photo.id]: 'sharing' }));
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mars Photo by ${photo.rover.name}`,
          text: `Check out this amazing Mars photo taken by ${photo.rover.name} rover!`,
          url: photo.img_src
        });
        setShareStatus(prev => ({ ...prev, [photo.id]: 'success' }));
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Sharing failed:', err);
          setShareStatus(prev => ({ ...prev, [photo.id]: 'error' }));
        } else {
          setShareStatus(prev => ({ ...prev, [photo.id]: null }));
          return;
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(photo.img_src);
        setShareStatus(prev => ({ ...prev, [photo.id]: 'success' }));
      } catch (err) {
        console.error('Copy failed:', err);
        setShareStatus(prev => ({ ...prev, [photo.id]: 'error' }));
      }
    }
    
    setTimeout(() => {
      setShareStatus(prev => ({ ...prev, [photo.id]: null }));
    }, 2000);
  };

  const resetFilters = () => {
    setSelectedCamera('');
    setDate('2023-01-01');
    setSol('');
    setPage(1);
    setError('');
  };

  const retryConnection = async () => {
    setError('');
    setConnectionStatus('checking');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 1000);
  };

  const ConnectionStatus = () => (
    <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all duration-300 ${
      connectionStatus === 'connected' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 
      connectionStatus === 'checking' ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' :
      'text-red-300 bg-red-500/10 border-red-500/30'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' :
        connectionStatus === 'checking' ? 'bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50' :
        'bg-red-400 shadow-lg shadow-red-400/50'
      }`}></div>
      {connectionStatus === 'connected' && 'API Online'}
      {connectionStatus === 'checking' && 'Connecting...'}
      {connectionStatus === 'disconnected' && (
        <div className="flex items-center gap-2">
          <span>API Offline</span>
          <button 
            onClick={retryConnection}
            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-xs transition-all duration-200 hover:scale-105"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );

  const PhotoCard = ({ photo }) => (
    <div className="group relative bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-purple-900/30 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20">
      <div className="relative overflow-hidden">
        <img
          src={photo.img_src}
          alt={`Mars photo by ${photo.rover.name}`}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23374151"/><text x="200" y="150" text-anchor="middle" fill="%23ffffff" font-family="Arial" font-size="16">Image Failed to Load</text></svg>';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={() => handleFavorite(photo.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
              favorites.has(photo.id) 
                ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/50 animate-pulse' 
                : 'bg-black/50 text-white hover:bg-red-500/90 hover:shadow-lg hover:shadow-red-500/50'
            }`}
          >
            <Heart size={16} fill={favorites.has(photo.id) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setSelectedPhoto(photo)}
            className="p-2.5 rounded-full bg-black/50 text-white hover:bg-cyan-500/90 backdrop-blur-md transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <p className="text-sm font-medium text-cyan-300">{photo.camera?.full_name || 'Unknown Camera'}</p>
              <p className="text-xs text-gray-300 flex items-center gap-1">
                <Star size={12} className="text-yellow-400" />
                Sol {photo.sol}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadImage(photo.img_src, `mars-${photo.rover?.name || 'rover'}-${photo.id}.jpg`, photo.id)}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                  downloadStatus[photo.id] === 'downloading' ? 'bg-blue-500/90 animate-spin' :
                  downloadStatus[photo.id] === 'success' ? 'bg-green-500/90 text-white' :
                  downloadStatus[photo.id] === 'error' ? 'bg-red-500/90 text-white' :
                  'bg-white/20 text-white hover:bg-blue-500/90 hover:shadow-lg hover:shadow-blue-500/50'
                }`}
                disabled={downloadStatus[photo.id] === 'downloading'}
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => sharePhoto(photo)}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                  shareStatus[photo.id] === 'sharing' ? 'bg-purple-500/90 animate-pulse' :
                  shareStatus[photo.id] === 'success' ? 'bg-green-500/90 text-white' :
                  shareStatus[photo.id] === 'error' ? 'bg-red-500/90 text-white' :
                  'bg-white/20 text-white hover:bg-purple-500/90 hover:shadow-lg hover:shadow-purple-500/50'
                }`}
                disabled={shareStatus[photo.id] === 'sharing'}
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-slate-800/30 to-purple-800/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-cyan-400 text-sm font-bold bg-cyan-400/10 px-2 py-1 rounded-full border border-cyan-400/30">
            {photo.rover?.name || selectedRover} Rover
          </span>
          <span className="text-gray-300 text-xs bg-gray-700/50 px-2 py-1 rounded-full">
            {photo.earth_date}
          </span>
        </div>
        <p className="text-gray-300 text-sm">{photo.camera?.full_name || 'Unknown Camera'}</p>
      </div>
    </div>
  );

  const PhotoModal = ({ photo, onClose }) => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative max-w-7xl max-h-[95vh] bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-purple-900/90 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-cyan-500/20 animate-in zoom-in-95 duration-500">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-red-500/90 transition-all duration-300 transform hover:scale-110 hover:rotate-90 backdrop-blur-sm"
        >
          ✕
        </button>
        
        <div className="flex flex-col lg:flex-row max-h-[95vh]">
          <div className="flex-1 relative bg-black/30">
            <img
              src={photo.img_src}
              alt={`Mars photo by ${photo.rover?.name || 'rover'}`}
              className="w-full h-full object-contain max-h-[60vh] lg:max-h-[95vh]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
          </div>
          
          <div className="w-full lg:w-96 p-6 bg-gradient-to-b from-slate-800/50 to-purple-900/50 overflow-y-auto backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="text-cyan-400" size={24} />
              <h3 className="text-2xl font-bold text-white">Photo Details</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30">
                <label className="text-cyan-300 text-sm font-medium">Rover</label>
                <p className="text-white font-bold text-lg">{photo.rover?.name || selectedRover}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30">
                <label className="text-purple-300 text-sm font-medium">Camera</label>
                <p className="text-white font-bold">{photo.camera?.full_name || 'Unknown Camera'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/30">
                  <label className="text-green-300 text-sm font-medium">Earth Date</label>
                  <p className="text-white font-bold">{photo.earth_date}</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/30">
                  <label className="text-yellow-300 text-sm font-medium">Sol</label>
                  <p className="text-white font-bold">{photo.sol}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-2xl border border-slate-500/30">
                <label className="text-slate-300 text-sm font-medium">Photo ID</label>
                <p className="text-white font-mono text-sm">{photo.id}</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleFavorite(photo.id)}
                  className={`w-full py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    favorites.has(photo.id)
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/30'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-red-600 hover:to-pink-600 hover:shadow-lg hover:shadow-red-500/30'
                  }`}
                >
                  <Heart size={16} className="inline mr-2" fill={favorites.has(photo.id) ? 'currentColor' : 'none'} />
                  {favorites.has(photo.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => downloadImage(photo.img_src, `mars-${photo.rover?.name || 'rover'}-${photo.id}.jpg`, photo.id)}
                    className={`py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      downloadStatus[photo.id] === 'downloading' ? 'bg-gradient-to-r from-blue-600 to-blue-700 animate-pulse' :
                      downloadStatus[photo.id] === 'success' ? 'bg-gradient-to-r from-green-600 to-green-700' :
                      'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30'
                    } text-white`}
                    disabled={downloadStatus[photo.id] === 'downloading'}
                  >
                    <Download size={16} className="inline mr-2" />
                    {downloadStatus[photo.id] === 'downloading' ? 'Downloading...' :
                     downloadStatus[photo.id] === 'success' ? 'Downloaded!' : 'Download'}
                  </button>
                  <button
                    onClick={() => sharePhoto(photo)}
                    className={`py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      shareStatus[photo.id] === 'sharing' ? 'bg-gradient-to-r from-purple-600 to-purple-700 animate-pulse' :
                      shareStatus[photo.id] === 'success' ? 'bg-gradient-to-r from-green-600 to-green-700' :
                      'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30'
                    } text-white`}
                    disabled={shareStatus[photo.id] === 'sharing'}
                  >
                    <Share2 size={16} className="inline mr-2" />
                    {shareStatus[photo.id] === 'sharing' ? 'Sharing...' :
                     shareStatus[photo.id] === 'success' ? 'Shared!' : 'Share'}
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <a
                  href={photo.img_src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-300 transform hover:scale-105 bg-cyan-400/10 px-4 py-2 rounded-2xl border border-cyan-400/30 hover:border-cyan-400/50"
                >
                  <ExternalLink size={14} className="mr-2" />
                  View Original Image
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <header className="bg-black/30 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-40 shadow-2xl">
        <div className="relative bg-black text-white px-6 py-10">
          <div className="absolute top-4 right-6 flex items-center gap-2 text-sm bg-gray-800/70 px-4 py-1 rounded-full border border-gray-700 shadow-md">
            <span className="text-gray-300">API:</span>
            <span className={apiStats?.status === 'online' ? 'text-green-400' : 'text-red-500'}>
              {apiStats?.status === 'online' ? 'Online 🟢' : 'Offline 🔴'}
            </span>
            {apiStats?.uptime && (
              <span className="ml-1 text-gray-400">({Math.floor(apiStats.uptime)}s)</span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center text-center mt-2 scale-50">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Camera className="text-cyan-400 animate-pulse" size={40} />
            <h1
              className="font-montserrat tracking-tight text-cyan-400 uppercase"
              style={{ fontSize: '1.7rem', fontWeight: 650 }}
            >
              MARS ROVER PHOTOS
            </h1>
            </div>
          </div>
        </div>

      </header>
      <div className="flex flex-col items-center justify-center text-center mt-4">
        <p className="text-base text-gray-300 max-w-xl mt-1">
          Discover breathtaking high-definition images taken by NASA’s legendary Mars rovers.<br />
          Filter by mission, camera, or Earth date to explore the Martian landscape like never before. <br />
          <strong>🔎 Mars Fact:</strong> {funFact}
        </p>
      </div>
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="bg-gradient-to-r from-black/20 via-purple-900/20 to-black/20 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 mb-8 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 group">
              <Filter size={24} className="text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Search Filters
              </span>
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 active:scale-95 group"
              >
                <span className="flex items-center gap-2">
                  <div className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}>
                    <Filter size={16} />
                  </div>
                  {showFilters ? 'Hide' : 'Show'} Filters
                </span>
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95 group"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-medium">Reset</span>
              </button>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ${showFilters ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="group relative">
              <label className="block text-gray-300 text-sm font-bold mb-3 flex items-center gap-3 group-hover:text-cyan-300 transition-colors duration-300">
                <Car className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" size={18} />
                Mars Rover
                <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="ml-4 text-xs bg-purple-500/20 px-2 py-1 rounded-full text-purple-300 border border-purple-500/30">
                  {rovers.length} available
                </div>
              </label>
              <div className="relative">
                <select
                  value={selectedRover}
                  onChange={(e) => {
                    setSelectedRover(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/50 rounded-2xl text-black focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 group-hover:shadow-lg group-hover:shadow-cyan-500/20 appearance-none cursor-pointer"
                  disabled={loading}
                >
                  {rovers.map(rover => (
                    <option
                      key={rover.name.toLowerCase()}
                      value={rover.name.toLowerCase()}
                      className="bg-gray-900 text-white py-2"
                    >
                      🚀 {rover.name} {rover.status === 'complete' ? '(Mission Complete)' : '(Active)'}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-400"></div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <label className="block text-gray-300 text-sm font-bold mb-3 flex items-center gap-3 group-hover:text-purple-300 transition-colors duration-300">
                <Camera className="text-purple-400 group-hover:scale-110 transition-transform duration-300" size={18} />
                Camera Type
                <div className="ml-4 text-xs bg-purple-500/20 px-2 py-1 rounded-full text-purple-300 border border-purple-500/30">
                  {cameras.length} available
                </div>
              </label>
              <div className="relative">
                <select
                  value={selectedCamera}
                  onChange={(e) => {
                    setSelectedCamera(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/50 rounded-2xl text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-purple-400/50 group-hover:shadow-lg group-hover:shadow-purple-500/20 appearance-none cursor-pointer"
                  disabled={loading}
                >
                  <option value="" className="bg-gray-900 text-white">📷 All Cameras</option>
                  {cameras.map(camera => (
                    <option key={camera.name} value={camera.name} className="bg-gray-900 text-white">
                      📸 {camera.full_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-400"></div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <label className="block text-gray-300 text-sm font-bold mb-3 flex items-center gap-2 group-hover:text-green-300 transition-colors duration-300">
                <Calendar className="text-green-400 group-hover:scale-110 transition-transform duration-300" size={18} />
                Earth Date
                {date && <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSol('');
                    setPage(1);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/50 rounded-2xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-green-400/50 group-hover:shadow-lg group-hover:shadow-green-500/20"
                  disabled={loading || sol !== ''}
                />
                {(loading || sol !== '') && (
                  <div className="absolute inset-0 bg-gray-800/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-gray-400 text-sm">
                      {loading ? 'Loading...' : 'Using Sol date'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="group relative">
              <label className="block text-gray-300 text-sm font-bold mb-3 flex items-center gap-2 group-hover:text-yellow-300 transition-colors duration-300">
                <Star className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" size={18} />
                Sol (Mars Day)
                {sol && <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={sol}
                  onChange={(e) => {
                    setSol(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Enter Mars day..."
                  className="w-full p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/50 rounded-2xl text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/50 group-hover:shadow-lg group-hover:shadow-yellow-500/20 placeholder-gray-400"
                  disabled={loading}
                  min="0"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-400/50">
                  🪐
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-gray-300 text-sm font-medium">Quick Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Latest Photos', action: () => { setDate(''); setSol(''); setPage(1); } },
                { label: 'Curiosity Only', action: () => { setSelectedRover('curiosity'); setPage(1); } },
                { label: 'Perseverance Only', action: () => { setSelectedRover('perseverance'); setPage(1); } },
                { label: 'Clear All', action: resetFilters }
              ].map((filter, index) => (
                <button
                  key={index}
                  onClick={filter.action}
                  className="px-4 py-2 bg-gradient-to-r from-gray-700/30 to-gray-800/30 hover:from-purple-600/30 hover:to-cyan-600/30 text-gray-300 hover:text-white text-sm rounded-xl transition-all duration-300 border border-gray-600/30 hover:border-purple-500/50 backdrop-blur-sm transform hover:scale-105 active:scale-95"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 p-2 rounded-2xl backdrop-blur-sm border border-gray-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20'
                }`}
              >
                <Grid size={18} className={viewMode === 'grid' ? 'animate-pulse' : ''} />
                <span className="font-medium">Grid</span>
              </button>
            </div>
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 p-2 rounded-2xl backdrop-blur-sm border border-gray-700/50">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20'
                }`}
              >
                <List size={18} className={viewMode === 'list' ? 'animate-pulse' : ''} />
                <span className="font-medium">List</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-gray-300 bg-gradient-to-r from-gray-800/30 to-gray-900/30 px-6 py-3 rounded-2xl backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
              {photos.length > 0 && (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400 group-hover:animate-spin" />
                  <span className="font-bold text-cyan-400">{photos.length}</span>
                  <span>photos found</span>
                </span>
              )}
            </div>
            {favorites.size > 0 && (
              <div className="text-gray-300 bg-gradient-to-r from-gray-800/30 to-gray-900/30 px-6 py-3 rounded-2xl backdrop-blur-sm border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 group">
                <span className="flex items-center gap-2">
                  <Heart size={16} className="text-red-400 group-hover:animate-pulse" fill="currentColor" />
                  <span className="font-bold text-red-400">{favorites.size}</span>
                  <span>favorited</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 rounded-3xl p-6 mb-8 flex items-start gap-4 backdrop-blur-sm shadow-2xl shadow-red-500/20 animate-in slide-in-from-top duration-500 hover:shadow-red-500/30 transition-all duration-300">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-1 animate-bounce" size={24} />
            <div className="flex-1">
              <p className="text-xl font-bold text-red-400 flex items-center gap-2">
                <span>Error Detected</span>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              </p>
              <p className="text-red-400 text-sm mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-6 text-cyan-400">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400/20 border-b-purple-400 rounded-full animate-spin" style={{ animationDelay: '150ms', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-2 w-12 h-12 border-2 border-pink-400/40 border-r-pink-400 rounded-full animate-spin" style={{ animationDelay: '300ms' }}></div>
              </div>
              <div className="text-center">
                <span className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  Loading Mars photos...
                </span>
                <p className="text-gray-400 text-sm mt-2 flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Exploring the Red Planet
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '500ms' }}></div>
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && photos.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700' 
            : 'space-y-6 animate-in fade-in duration-700'
          }>
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="animate-in slide-in-from-bottom duration-700 hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}

        {!loading && photos.length === 0 && !error && connectionStatus === 'connected' && (
          <div className="text-center py-20 animate-in fade-in duration-700">
            <div className="relative inline-block mb-8 group">
              <Camera className="mx-auto text-gray-600 group-hover:text-gray-500 transition-colors duration-300" size={80} />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              No Photos Found
            </h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto mb-6">
              Try adjusting your search filters or selecting a different date to explore more of Mars.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetFilters}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 active:scale-95 font-medium"
              >
                🔄 Reset Filters
              </button>
              <button
                onClick={() => setSelectedRover('curiosity')}
                className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95 font-medium"
              >
                🚀 Try Curiosity
              </button>
            </div>
          </div>
        )}

        {photos.length > 0 && photos.length % 24 === 0 && (
          <div className="text-center mt-12">
            <div className="relative inline-block">
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/30 text-lg font-bold disabled:cursor-not-allowed active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <span className="flex items-center gap-3 relative z-10">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Loading More...
                  </span>
                ) : (
                  <span className="flex items-center gap-3 relative z-10">
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    Load More Photos
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </span>
                )}
              </button>
            </div>
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