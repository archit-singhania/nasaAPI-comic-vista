import { useEffect, useState } from 'react';
import { fetchDonki } from '../api/nasaAPI';
import Loader from '../components/common/Loader';
import DonkiEvents from '../components/DonkiEvents';
import { 
  Zap, 
  Sun, 
  Radio, 
  Waves, 
  Magnet, 
  Globe, 
  Radiation, 
  Bell,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Filter,
  Calendar,
  Activity
} from 'lucide-react';

export default function Donki() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventType, setEventType] = useState('notifications');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const eventTypes = [
    { 
      value: 'notifications', 
      label: 'All Notifications', 
      icon: <Bell className="w-5 h-5" />,
      description: 'Space weather alerts and notifications',
      color: 'gray'
    },
    { 
      value: 'FLR', 
      label: 'Solar Flares', 
      icon: <Sun className="w-5 h-5" />,
      description: 'Intense bursts of radiation from the Sun',
      color: 'yellow'
    },
    { 
      value: 'SEP', 
      label: 'Solar Energetic Particles', 
      icon: <Zap className="w-5 h-5" />,
      description: 'High-energy particles from solar events',
      color: 'purple'
    },
    { 
      value: 'CME', 
      label: 'Coronal Mass Ejections', 
      icon: <Waves className="w-5 h-5" />,
      description: 'Large expulsions of plasma from the Sun',
      color: 'blue'
    },
    { 
      value: 'IPS', 
      label: 'Interplanetary Shocks', 
      icon: <Radio className="w-5 h-5" />,
      description: 'Shock waves traveling through space',
      color: 'red'
    },
    { 
      value: 'MPC', 
      label: 'Magnetopause Crossings', 
      icon: <Magnet className="w-5 h-5" />,
      description: 'Boundary interactions with Earth\'s magnetosphere',
      color: 'green'
    },
    { 
      value: 'GST', 
      label: 'Geomagnetic Storms', 
      icon: <Globe className="w-5 h-5" />,
      description: 'Disturbances in Earth\'s magnetic field',
      color: 'orange'
    },
    { 
      value: 'RBE', 
      label: 'Radiation Belt Enhancements', 
      icon: <Radiation className="w-5 h-5" />,
      description: 'Increases in trapped radiation around Earth',
      color: 'pink'
    }
  ];

  const fetchEvents = async (type) => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchDonki(type);
      if (!response) {
        throw new Error('No response received');
      }
      const eventsData = response.data?.data || response.data || response || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      setError(`Failed to fetch ${type} events: ${err.message}`);
      console.error('Error fetching DONKI data:', err);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents(eventType);
  }, [eventType]);

  const handleEventTypeChange = (newType) => {
    setEventType(newType);
  };

  const handleRefresh = () => {
    fetchEvents(eventType);
  };

  const getEventTypeColors = (color) => {
    const colors = {
      gray: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
      yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      purple: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
      blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      red: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
      pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30'
    };
    return colors[color] || colors.gray;
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border-2 border-purple-500/30 backdrop-blur-xl animate-pulse">
            <Activity className="w-16 h-16 text-purple-400 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Scanning the Cosmos</h3>
          <p className="text-gray-400">Fetching the latest space weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
      }}
    >
      <div className="relative z-10 container mx-auto px-6 pb-12">
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl mb-8">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">
              Space Weather Monitor
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real-time monitoring of space weather events from NASA's DONKI (Database of Notifications, Knowledge, Information).
            Track solar flares, coronal mass ejections, and other cosmic phenomena that affect Earth.
          </p>
        </div>

        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              <Filter className="w-5 h-5" />
              <span className="font-semibold">
                Event Filters
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-xl text-white hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-semibold">
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-900/80 to-slate-900/80 border border-gray-700/50 backdrop-blur-xl">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleEventTypeChange(type.value)}
                  className={`group relative p-4 rounded-xl border-2 backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                    eventType === type.value
                      ? `bg-gradient-to-br ${getEventTypeColors(type.color)} shadow-lg`
                      : 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/70'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${eventType === type.value ? 'bg-white/20' : 'bg-gray-700/50'}`}>
                      {type.icon}
                    </div>
                    <span className="font-bold text-white text-sm">
                      {type.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {type.description}
                  </p>
                  
                  {eventType === type.value && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-xl">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-semibold">
              Currently viewing: {eventTypes.find(t => t.value === eventType)?.label}
            </span>
            {events.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-bold text-white">
                {events.length} events
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
                <span className="text-red-400 font-bold text-sm">!</span>
              </div>
              <h3 className="text-lg font-bold text-white">Error</h3>
            </div>
            <p className="text-red-200">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 rounded-lg bg-red-500/30 hover:bg-red-500/40 text-white font-semibold transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        <DonkiEvents 
          events={events} 
          eventType={eventType}
          loading={loading}
          refreshing={refreshing}
        />

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center border-2 border-gray-500/30 backdrop-blur-xl">
              <Bell className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Events Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              No {eventTypes.find(t => t.value === eventType)?.label.toLowerCase()} have been detected recently. 
              Space weather is currently calm.
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              Check Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}