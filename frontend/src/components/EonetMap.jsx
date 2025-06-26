import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import { Activity, Satellite, Filter, RefreshCw, Zap, AlertTriangle, MapPin, Calendar, Database, Eye, EyeOff, CheckCircle, Layers, FileText } from 'lucide-react';
import { fetchEonetEvents, fetchEonetCategories, fetchEonetSources, fetchEonetStats, checkEonetHealth} from '../api/nasaAPI';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCategoryIcon = (category, isActive = true) => {
  const categoryColors = {
    'Wildfires': '#FF4444',
    'Severe Storms': '#4444FF', 
    'Volcanoes': '#FF8800',
    'Sea and Lake Ice': '#00DDFF',
    'Earthquakes': '#8B4513',
    'Floods': '#0066CC',
    'Landslides': '#654321',
    'Manmade': '#800080',
    'Snow': '#FFFFFF',
    'Water Color': '#00FF88',
    'Dust and Haze': '#DAA520',
    'Drought': '#DEB887',
    'Temperature Extremes': '#FF69B4'
  };
  
  const color = categoryColors[category] || '#666666';
  const glowIntensity = isActive ? '0 0 20px' : '0 0 10px';
  const pulseAnimation = isActive ? 'animate-pulse' : '';
  
  return L.divIcon({
      className: 'custom-event-marker',
      html: `
        <div class="${pulseAnimation}" style="
          background: radial-gradient(circle, ${color}, ${color}dd);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
          box-shadow: ${glowIntensity} ${color}66, 0 0 6px rgba(0,0,0,0.8);
          backdrop-filter: blur(2px);
          animation: ${isActive ? 'pulse 2s infinite' : 'none'};
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  };

export default function PremiumEonetMap() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    days: 30,
    showActive: true,
    showClosed: true
  });
  const [stats, setStats] = useState(null);

  const [sources, setSources] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [showHealthIndicator, setShowHealthIndicator] = useState(true);
  const [showAllSources, setShowAllSources] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {};
      if (filters.status !== 'all') queryParams.status = filters.status;
      if (filters.category && filters.category !== '') queryParams.category = filters.category;
      if (filters.days) queryParams.days = filters.days;
      queryParams.limit = '200';

      const data = await fetchEonetEvents(queryParams);
      setEvents(data.events || []);
      
    } catch (err) {
      console.error('Error fetching events:', err);
      let errorMessage = err.message;
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to NASA EONET server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchEonetCategories();
      
      let categoriesArray;
      if (data.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      } else {
        throw new Error('Invalid categories response format');
      }
      
      setCategories(categoriesArray);
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      
      const fallbackCategories = [
        { id: 'drought', title: 'Drought' },
        { id: 'dustHaze', title: 'Dust and Haze' },
        { id: 'earthquakes', title: 'Earthquakes' },
        { id: 'floods', title: 'Floods' },
        { id: 'landslides', title: 'Landslides' },
        { id: 'manmade', title: 'Manmade' },
        { id: 'seaLakeIce', title: 'Sea and Lake Ice' },
        { id: 'severeStorms', title: 'Severe Storms' },
        { id: 'snow', title: 'Snow' },
        { id: 'tempExtremes', title: 'Temperature Extremes' },
        { id: 'volcanoes', title: 'Volcanoes' },
        { id: 'waterColor', title: 'Water Color' },
        { id: 'wildfires', title: 'Wildfires' }
      ];
      setCategories(fallbackCategories);
    }
  }, []);

  const fetchStatsData = useCallback(async () => {
    try {
      const data = await fetchEonetStats({ days: filters.days });
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [filters.days]);

  const fetchSources = useCallback(async () => {
    try {
      const data = await fetchEonetSources();
      setSources(data.sources || data || []);
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  }, []);

  const fetchHealthStatus = useCallback(async () => {
    try {
      const data = await checkEonetHealth();
      setHealthStatus(data);
    } catch (err) {
      console.error('Error fetching health status:', err);
      setHealthStatus({ status: 'unknown', message: 'Unable to connect to EONET service' });
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchStatsData();
    fetchSources();
    fetchHealthStatus();
  }, [fetchEvents, fetchCategories, fetchStatsData, fetchSources, fetchHealthStatus]);


  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchStatsData();
  }, [fetchEvents, fetchCategories, fetchStatsData]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!filters.showActive && event.isActive) return false;
      if (!filters.showClosed && !event.isActive) return false;
      return true;
    });
  }, [events, filters.showActive, filters.showClosed]);

  const eventsByCategory = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach(event => {
      event.categories.forEach(cat => {
        const categoryTitle = cat.title || 'Unknown';
        if (!grouped[categoryTitle]) {
          grouped[categoryTitle] = [];
        }
        grouped[categoryTitle].push(event);
      });
    });
    return grouped;
  }, [filteredEvents]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatEventDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventCoordinates = (event) => {
    if (!event.latestGeometry || !event.latestGeometry.coordinates) {
      return null;
    }
    
    const coords = event.latestGeometry.coordinates;
    
    if (event.latestGeometry.type === 'Point') {
      return [coords[1], coords[0]]; 
    } else if (event.latestGeometry.type === 'Polygon' && coords[0] && coords[0][0]) {
      return [coords[0][0][1], coords[0][0][0]];
    }
    
    return null;
  };

  const renderEventMarker = (event) => {
    const coordinates = getEventCoordinates(event);
    if (!coordinates) return null;

    const primaryCategory = event.categories[0]?.title || 'Unknown';
    const icon = createCategoryIcon(primaryCategory, event.isActive);

    return (
      <Marker
        key={event.id}
        position={coordinates}
        icon={icon}
      >
        <Popup maxWidth={400} minWidth={320} className="dark-popup">
          <div className="bg-gray-900 p-4 rounded-lg text-white border border-gray-700">
            <h3 className="font-bold text-xl mb-3 text-cyan-400 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {event.title}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  event.isActive 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}>
                  {event.isActive ? <Zap className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {event.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Category:</span>
                <span className="text-cyan-300 font-medium">
                  {event.categories.map(cat => cat.title).join(', ')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Started:
                </span>
                <span className="text-white">{formatEventDate(event.date)}</span>
              </div>
              
              {!event.isActive && event.closed && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ended:</span>
                  <span className="text-white">{formatEventDate(event.closed)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location:
                </span>
                <span className="text-xs font-mono text-green-400 bg-gray-800 px-2 py-1 rounded">
                  {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Data Points:
                </span>
                <span className="text-yellow-400 font-medium">{event.totalGeometries}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedEvent(event)}
              className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              View Full Details
            </button>
          </div>
        </Popup>
      </Marker>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <span className="text-cyan-400 text-lg font-medium">Loading NASA EONET Data...</span>
          <p className="text-gray-400 text-sm mt-2">Connecting to Earth Observatory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: linear-gradient(135deg, #0f172a, #1e3a8a, #9333ea) !important;
          box-shadow: 0 0 25px rgba(147, 51, 234, 0.4) !important;
          border-radius: 12px !important;
          border: 1px solid #4f46e5 !important;
          padding: 8px !important;
          color: #fff !important;
        }

        .dark-popup .leaflet-popup-tip {
          background: linear-gradient(135deg, #1e3a8a, #9333ea) !important;
          border: 1px solid #4f46e5 !important;
        }

        .leaflet-control-layers {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95)) !important;
          border: 1px solid #374151 !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px) !important;
        }

        .leaflet-control-layers-expanded {
          color: white !important;
        }

        .leaflet-control-layers label {
          color: #e5e7eb !important;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
            <Satellite className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-300 text-lg">
            Earth Observatory Natural Event Tracker
          </p>
        </div>
      </div>

      {healthStatus && showHealthIndicator && (
        <div className={`mb-4 p-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between ${
          healthStatus.status === 'ok' || healthStatus.status === 'operational' 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus.status === 'ok' || healthStatus.status === 'operational' 
                ? 'bg-green-400 animate-pulse' 
                : 'bg-yellow-400 animate-pulse'
            }`}></div>
            <div>
              <span className={`font-medium ${
                healthStatus.status === 'ok' || healthStatus.status === 'operational' 
                  ? 'text-green-400' 
                  : 'text-yellow-400'
              }`}>
                EONET Service Status: {healthStatus.status === 'ok' || healthStatus.status === 'operational' ? 'Operational' : 'Degraded'}
              </span>
              {healthStatus.message && (
                <p className="text-gray-400 text-sm mt-1">{healthStatus.message}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowHealthIndicator(false)}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-all duration-300"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-8 p-8 bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-cyan-900/30 backdrop-blur-2xl rounded-3xl border border-gradient-to-r from-purple-500/30 via-cyan-500/30 to-blue-500/30 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-cyan-600/5 to-blue-600/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🚀 Mission Control
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">🟢 System Online</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              📊 Event Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 rounded-2xl text-black font-bold focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 hover:border-purple-400/50 shadow-lg backdrop-blur-sm"
            >
              <option value="all">🌟 All Events</option>
              <option value="open">🔥 Active Only</option>
              <option value="closed">✅ Closed Only</option>
            </select>
          </div>
          
          <div className="group">
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              🎯 Event Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 rounded-2xl text-black font-bold focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 hover:border-cyan-400/50 shadow-lg backdrop-blur-sm"
            >
              <option value="">🌈 All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="group">
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              ⏰ Time Range
            </label>
            <select
              value={filters.days}
              onChange={(e) => handleFilterChange('days', parseInt(e.target.value))}
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 rounded-2xl text-black font-bold focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 hover:border-green-400/50 shadow-lg backdrop-blur-sm"
            >
              <option value={7}>📅 Last 7 days</option>
              <option value={14}>📆 Last 2 weeks</option>
              <option value={30}>🗓️ Last 30 days</option>
              <option value={60}>📊 Last 2 months</option>
              <option value={90}>📈 Last 3 months</option>
              <option value={180}>📉 Last 6 months</option>
              <option value={365}>🎊 Last year</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 font-semibold flex items-center justify-center gap-3 border border-cyan-400/20"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? '🔄 Updating...' : '🚀 Refresh Data'}
            </button>
            <button
              onClick={fetchHealthStatus}
              className="px-6 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl hover:from-emerald-400 hover:via-green-400 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 font-semibold flex items-center justify-center gap-3 border border-green-400/20"
            >
              <Activity className="w-5 h-5" />
              💚 Check Health
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <input
              type="checkbox"
              id="showActive"
              checked={filters.showActive}
              onChange={(e) => handleFilterChange('showActive', e.target.checked)}
              className="sr-only"
            />
            <label 
              htmlFor="showActive"
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 font-medium ${
                filters.showActive 
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-400/40 shadow-lg shadow-red-500/20' 
                  : 'bg-gradient-to-r from-gray-700/40 to-gray-600/40 text-gray-400 border-gray-500/30 hover:border-red-400/40 hover:text-red-300'
              }`}
            >
              {filters.showActive ? (
                <>
                  <Eye className="w-5 h-5" />
                  👀 Active Events Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5" />
                  🔥 Show Active Events
                </>
              )}
            </label>
          </div>
          
          <div className="relative group">
            <input
              type="checkbox"
              id="showClosed"
              checked={filters.showClosed}
              onChange={(e) => handleFilterChange('showClosed', e.target.checked)}
              className="sr-only"
            />
            <label 
              htmlFor="showClosed"
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 font-medium ${
                filters.showClosed 
                  ? 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-400/40 shadow-lg shadow-gray-500/20' 
                  : 'bg-gradient-to-r from-gray-700/40 to-gray-600/40 text-gray-400 border-gray-500/30 hover:border-gray-400/40 hover:text-gray-300'
              }`}
            >
              {filters.showClosed ? (
                <>
                  <Eye className="w-5 h-5" />
                  👁️ Closed Events Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5" />
                  📁 Show Closed Events
                </>
              )}
            </label>
          </div>
          
          <div className="ml-auto flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-300 font-medium">⚡ Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/20">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <span className="text-cyan-300 font-medium">🛰️ Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {stats && (
        <div className="mb-8 flex flex-wrap md:flex-nowrap gap-4 md:gap-6 justify-between">
          <div className="group relative bg-gradient-to-br from-blue-500/25 via-cyan-500/20 to-indigo-500/25 p-7 rounded-3xl border-2 border-blue-400/40 backdrop-blur-2xl shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div className="text-4xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  {filteredEvents.length}
                </div>
              </div>
              <div className="text-blue-200 text-sm font-bold flex items-center gap-2 mb-3">
                📊 Total Events
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <div className="w-full bg-blue-900/40 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse shadow-lg shadow-blue-500/50" style={{width: '100%'}}></div>
              </div>
              <div className="text-xs text-blue-300/80 mt-2 font-medium">🌟 Complete Overview</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-red-500/25 via-pink-500/20 to-orange-500/25 p-7 rounded-3xl border-2 border-red-400/40 backdrop-blur-2xl shadow-2xl shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-pink-600/10 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 rounded-full -translate-y-8 translate-x-8 animate-bounce"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg animate-pulse">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-4xl font-black bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent">
                  {filteredEvents.filter(e => e.isActive).length}
                </div>
              </div>
              <div className="text-red-200 text-sm font-bold flex items-center gap-2 mb-3">
                🔥 Active Events
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              </div>
              <div className="w-full bg-red-900/40 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full animate-pulse shadow-lg shadow-red-500/50"
                  style={{width: `${Math.max((filteredEvents.filter(e => e.isActive).length / filteredEvents.length) * 100, 5)}%`}}></div>
              </div>
              <div className="text-xs text-red-300/80 mt-2 font-medium">⚡ Live & Running</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-500/25 via-gray-500/20 to-zinc-500/25 p-7 rounded-3xl border-2 border-slate-400/40 backdrop-blur-2xl shadow-2xl shadow-slate-500/20 hover:shadow-slate-500/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 to-gray-600/10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-slate-500/20 rounded-full translate-y-6 -translate-x-6"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-4xl font-black bg-gradient-to-r from-slate-300 to-gray-300 bg-clip-text text-transparent">
                  {filteredEvents.filter(e => !e.isActive).length}
                </div>
              </div>
              <div className="text-slate-200 text-sm font-bold flex items-center gap-2 mb-3">
                ✅ Closed Events
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              </div>
              <div className="w-full bg-slate-900/40 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-500 to-gray-500 h-2 rounded-full shadow-lg shadow-slate-500/50"
                  style={{width: `${Math.max((filteredEvents.filter(e => !e.isActive).length / filteredEvents.length) * 100, 5)}%`}}></div>
              </div>
              <div className="text-xs text-slate-300/80 mt-2 font-medium">📁 Completed Tasks</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-emerald-500/25 via-green-500/20 to-teal-500/25 p-7 rounded-3xl border-2 border-emerald-400/40 backdrop-blur-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-green-600/10 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-12 -translate-x-12 animate-ping"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div className="text-4xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  {filters.category ? '1' : Object.keys(eventsByCategory).length}
                </div>
              </div>
              <div className="text-emerald-200 text-sm font-bold flex items-center gap-2 mb-3">
                🎯 Categories
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div className="w-full bg-emerald-900/40 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" style={{width: '85%'}}></div>
              </div>
              <div className="text-xs text-emerald-300/80 mt-2 font-medium">🌈 Organized Groups</div>
            </div>
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 w-6 h-6 bg-emerald-400/20 rounded-full animate-pulse -translate-x-1.5 -translate-y-1.5"></div>
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
                <h3 
                  className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-pulse text-center"
                  style={{ fontFamily: `"Segoe UI", "Poppins", "Arial Rounded MT Bold", sans-serif` }}
                >
                  Active Data Sources
                </h3>
                <div className="relative">
                  <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 rounded-full border border-emerald-500/30 shadow-lg backdrop-blur-sm">
                    {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {sources.length > 6 && (
              <button
                onClick={() => setShowAllSources(!showAllSources)}
                className="group relative px-4 py-2 text-sm font-medium bg-gradient-to-r from-slate-700/80 to-slate-600/80 hover:from-emerald-600/80 hover:to-cyan-600/80 text-slate-300 hover:text-white rounded-lg transition-all duration-300 border border-slate-600/40 hover:border-emerald-500/60 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 active:scale-95 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative z-10 flex items-center space-x-2">
                  <span>{showAllSources ? 'Show Less' : `View All ${sources.length}`}</span>
                  <svg 
                    className={`w-4 h-4 transition-all duration-300 ${showAllSources ? 'rotate-180' : 'rotate-0'} group-hover:scale-110`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            )}
          </div>

          <div className="relative z-10">
            <div className={`flex gap-4 transition-all duration-500 ease-in-out ${showAllSources ? 'flex-wrap' : 'overflow-x-auto scrollbar-hide'} pb-2`}>
              {(showAllSources ? sources : sources.slice(0, 6)).map((source, index) => (
                <div 
                  key={source.id || index}
                  className="group relative bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl p-5 border border-slate-600/40 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 transform hover:-translate-y-2 hover:rotate-1 flex-shrink-0 min-w-[300px] max-w-[380px] backdrop-blur-sm overflow-hidden"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animation: `slideInUp 0.6s ease-out ${index * 150}ms both`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors duration-300 truncate">
                            {source.title || source.id}
                          </h4>
                        </div>
                        {source.description && (
                          <p className="text-slate-400 text-sm mt-3 line-clamp-3 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">
                            {source.description}
                          </p>
                        )}
                      </div>
                      
                      {source.url && (
                        <button
                          onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-sm font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:scale-110 active:scale-95 flex items-center space-x-2 group/btn relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                          <span className="relative z-10">View</span>
                          <svg className="relative z-10 w-4 h-4 transform transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!showAllSources && sources.length > 6 && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none flex items-center justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          <style jsx>{`
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-red-400 font-semibold">Connection Error</div>
              <div className="text-red-300 text-sm mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: '70vh', width: '100%' }}
          className="z-10"
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="🛰️ Satellite View">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="🗺️ Dark Map">
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>'
              />
            </LayersControl.BaseLayer>
            
            {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
              <LayersControl.Overlay checked key={category} name={`${category} (${categoryEvents.length})`}>
                <LayerGroup>
                  {categoryEvents.map(event => renderEventMarker(event))}
                </LayerGroup>
              </LayersControl.Overlay>
            ))}
          </LayersControl>
        </MapContainer>
      </div>
      
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[10000] p-4">
          <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-cyan-900/30 border-2 border-gradient-to-r from-purple-500/40 via-cyan-500/40 to-blue-500/40 rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20 backdrop-blur-2xl">
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 rounded-t-3xl"></div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/30">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      🛰️ {selectedEvent.title}
                    </h2>
                    <p className="text-gray-400 flex items-center gap-2">
                      🌍 NASA Earth Observatory Event
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gradient-to-br hover:from-red-500/20 hover:to-pink-500/20 rounded-lg transition-all duration-300 border border-transparent hover:border-red-400/30"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-800/60 via-purple-800/20 to-cyan-800/20 p-6 rounded-2xl border-2 border-purple-400/30 backdrop-blur-xl shadow-lg shadow-purple-500/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      📊 Event Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">🔄 Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          selectedEvent.isActive 
                            ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-300 border-2 border-red-400/40 shadow-lg shadow-red-500/20' 
                            : 'bg-gradient-to-r from-gray-500/30 to-slate-500/30 text-gray-300 border-2 border-gray-400/40 shadow-lg shadow-gray-500/20'
                        }`}>
                          {selectedEvent.isActive ? <Zap className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {selectedEvent.isActive ? '🔥 Active' : '✅ Closed'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">🚀 Started:</span>
                        <span className="text-white bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-lg border border-green-400/30">
                          {formatEventDate(selectedEvent.date)}
                        </span>
                      </div>
                      
                      {!selectedEvent.isActive && selectedEvent.closed && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 flex items-center gap-2">🏁 Ended:</span>
                          <span className="text-white bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1 rounded-lg border border-blue-400/30">
                            {formatEventDate(selectedEvent.closed)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">🎯 Categories:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedEvent.categories.map(cat => (
                            <span key={cat.id} className="text-xs bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 px-2 py-1 rounded-full border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
                              {cat.title}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">📈 Data Points:</span>
                        <span className="text-yellow-400 font-medium bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-1 rounded-lg border border-yellow-400/30 shadow-lg shadow-yellow-500/20">
                          ⚡ {selectedEvent.totalGeometries}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">🆔 Event ID:</span>
                        <span className="text-xs font-mono text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-lg border border-green-400/30 shadow-lg shadow-green-500/20">
                          {selectedEvent.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEvent.description && (
                    <div className="bg-gradient-to-br from-gray-800/60 via-blue-800/20 to-indigo-800/20 p-6 rounded-2xl border-2 border-blue-400/30 backdrop-blur-xl shadow-lg shadow-blue-500/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        📝 Description
                      </h3>
                      <p className="text-gray-300 leading-relaxed bg-gradient-to-r from-slate-700/30 to-gray-700/30 p-4 rounded-xl border border-slate-600/30">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-800/60 via-green-800/20 to-teal-800/20 p-6 rounded-2xl border-2 border-green-400/30 backdrop-blur-xl shadow-lg shadow-green-500/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      🗺️ Location Data
                    </h3>
                    
                    {getEventCoordinates(selectedEvent) && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 flex items-center gap-2">📍 Coordinates:</span>
                          <span className="text-xs font-mono text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-lg border border-green-400/30 shadow-lg shadow-green-500/20">
                            {getEventCoordinates(selectedEvent)[0].toFixed(4)}, {getEventCoordinates(selectedEvent)[1].toFixed(4)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 flex items-center gap-2">🔷 Geometry Type:</span>
                          <span className="text-cyan-300 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 rounded-lg border border-cyan-400/30">
                            {selectedEvent.latestGeometry.type}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 flex items-center gap-2">🔄 Last Updated:</span>
                          <span className="text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-lg border border-purple-400/30">
                            {formatEventDate(selectedEvent.latestGeometry.date)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedEvent.sources && selectedEvent.sources.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-800/60 via-orange-800/20 to-red-800/20 p-6 rounded-2xl border-2 border-orange-400/30 backdrop-blur-xl shadow-lg shadow-orange-500/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="p-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        🔗 Data Sources
                      </h3>
                      
                      <div className="space-y-3">
                        {selectedEvent.sources.map((source, index) => (
                          <div key={index} className="flex justify-between items-center bg-gradient-to-r from-slate-700/30 to-gray-700/30 p-3 rounded-xl border border-slate-600/30">
                            <span className="text-gray-300 flex items-center gap-2">📊 {source.id}:</span>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-sm underline transition-colors duration-300 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2 py-1 rounded border border-cyan-400/30 hover:border-cyan-300/50"
                            >
                              🌐 View Source
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-gray-800/60 via-pink-800/20 to-rose-800/20 p-6 rounded-2xl border-2 border-pink-400/30 backdrop-blur-xl shadow-lg shadow-pink-500/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      ⚡ Quick Actions
                    </h3>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          const coords = getEventCoordinates(selectedEvent);
                          if (coords) {
                            const url = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
                            window.open(url, '_blank');
                          }
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 border border-green-400/30"
                      >
                        <MapPin className="w-4 h-4" />
                        🗺️ View on Google Maps
                      </button>
                      
                      <button
                        onClick={() => {
                          const eventInfo = `${selectedEvent.title}\nStatus: ${selectedEvent.isActive ? 'Active' : 'Closed'}\nCategory: ${selectedEvent.categories.map(c => c.title).join(', ')}\nDate: ${formatEventDate(selectedEvent.date)}\nCoordinates: ${getEventCoordinates(selectedEvent)?.join(', ') || 'N/A'}`;
                          navigator.clipboard.writeText(eventInfo);
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-xl transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 border border-blue-400/30"
                      >
                        <Database className="w-4 h-4" />
                        📋 Copy Event Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}