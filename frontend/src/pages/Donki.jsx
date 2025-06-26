import React, { useEffect, useState } from 'react';
import { fetchDonki } from '../api/nasaAPI';
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
  Star,
  Activity,
  Filter,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Donki() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventType, setEventType] = useState('notifications');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const getColor = (color) => {
    switch (color) {
      case 'yellow': return '#FACC15';  
      case 'purple': return '#A855F7';  
      case 'blue': return '#3B82F6';    
      case 'red': return '#EF4444';      
      case 'green': return '#22C55E';    
      case 'orange': return '#F97316';  
      case 'pink': return '#EC4899';    
      case 'gray': return '#9CA3AF';    
      default: return '#FFFFFF';
    }
  };

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
      
      const eventsData = response.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      setError(`Failed to fetch ${type} events: ${err.message}`);
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
    setShowFilters(false); 
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
      <motion.div 
        className="relative z-10 container mx-auto px-6 pb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div 
          className="text-center mb-2 pt-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
        <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl mb-4 w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-white" />
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center justify-center flex-grow">
           <h1 className="flex items-center text-xl font-bold text-white">
            <Star className="w-14 h-14 text-yellow-400 ml-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="mx-4">SPACE WEATHER MONITOR</span>
            <Star className="w-14 h-14 text-yellow-400 ml-4 animate-spin" style={{ animationDuration: '4s' }} />
          </h1>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-white" />
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Real-time monitoring of space weather events from NASA's DONKI (Database of Notifications, Knowledge, Information).
            Track solar flares, coronal mass ejections, and other cosmic phenomena that affect Earth.
            Also monitoring of cosmic events affecting Earth's electromagnetic environment.
          </p>
        </motion.div>

        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              <Filter className="w-5 h-5" />
              <span className="font-semibold text-white">Event Filters</span>
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-3xl relative mx-4">
                <button
                  onClick={() => setShowFilters(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  ✕
                </button>

                <h2 className="text-xl text-white font-bold mb-6 text-center">Event Filters</h2>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
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
                          {React.cloneElement(type.icon, { style: { color: getColor(type.color) } })}
                        </div>
                        <span 
                          className="font-bold text-sm" 
                          style={{ color: getColor(type.color) }}
                        >
                          {type.label}
                        </span>
                      </div>
                      <p className="text-xs text-white leading-relaxed">
                        {type.description}
                      </p>
                      
                      {eventType === type.value && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-sm"><Calendar className="w-5 h-5 text-indigo-400" />
            <span className="text-indigo-400 font-medium text-sm">
              Currently viewing:&nbsp;
              <span className="font-semibold ml-3 text-white gap-2">
                {eventTypes.find(t => t.value === eventType)?.label}
              </span>
            </span>
            
            {events.length > 0 && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-white border border-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center min-w-[60px]">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-center flex-1">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </span>
              </span>
            )}
          </div>
        </div>
        <DonkiEvents 
          events={events} 
          eventType={eventType}
          loading={loading}
          refreshing={refreshing}
        />
      </motion.div>
    </div>
  );
}