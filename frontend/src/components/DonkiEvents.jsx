import { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Sun, 
  Radio, 
  Waves, 
  Magnet, 
  Globe, 
  Radiation, 
  Bell,
  Calendar,
  Clock,
  MapPin,
  Activity,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Satellite,
  Eye,
  Filter,
  Search,
  Download,
  Share2,
  X
} from 'lucide-react';

export default function DonkiEvents({ events = [], eventType = 'notifications' }) {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const containerRef = useRef(null);

  const safeEvents = Array.isArray(events) ? events : [];

  useEffect(() => {
    const criticalEvents = events.filter(e => e.classType?.startsWith('X') || e.classType?.startsWith('G3'));
    
    if (criticalEvents.length > 0) {
      setPulseEffect(true);
    } else {
      setPulseEffect(false);
    }

    const timer = setInterval(() => {
      setPulseEffect(prev => !prev);
    }, 2000);

    return () => clearInterval(timer);
  }, [events]);

  if (safeEvents.length === 0) {
    return (
      <div className="text-center py-24 relative">
        <div className="absolute inset-0 overflow-hidden rounded-3xl border-2 border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border-2 border-purple-500/30 backdrop-blur-xl">
            <Sparkles className="w-16 h-16 text-purple-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">No Space Weather Events</h3>
          <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            The cosmos is quiet for now. Try selecting a different event type or check back later for stellar activities.
          </p>
        </div>
      </div>
    );
  }

  const filteredEvents = safeEvents.filter(event => {
    const matchesFilter = selectedFilter === 'all' || event.eventType === selectedFilter;
    const matchesSearch = !searchTerm || 
      event.messageType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.classType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const getEventIcon = (type) => {
    const icons = {
      FLR: <Sun className="w-6 h-6" />,
      SEP: <Zap className="w-6 h-6" />,
      CME: <Waves className="w-6 h-6" />,
      IPS: <Radio className="w-6 h-6" />,
      MPC: <Magnet className="w-6 h-6" />,
      GST: <Globe className="w-6 h-6" />,
      RBE: <Radiation className="w-6 h-6" />,
      notifications: <Bell className="w-6 h-6" />
    };
    return icons[type] || <Activity className="w-6 h-6" />;
  };

  const getEventColors = (type) => {
    const colors = {
      FLR: {
        bg: 'from-yellow-500/20 to-orange-500/20',
        border: 'border-yellow-500/40',
        icon: 'bg-gradient-to-br from-yellow-400 to-orange-500',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/30',
        particle: '#F59E0B'
      },
      SEP: {
        bg: 'from-purple-500/20 to-indigo-500/20',
        border: 'border-purple-500/40',
        icon: 'bg-gradient-to-br from-purple-400 to-indigo-500',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/30',
        particle: '#8B5CF6'
      },
      CME: {
        bg: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/40',
        icon: 'bg-gradient-to-br from-blue-400 to-cyan-500',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/30',
        particle: '#06B6D4'
      },
      GST: {
        bg: 'from-orange-500/20 to-red-500/20',
        border: 'border-orange-500/40',
        icon: 'bg-gradient-to-br from-orange-400 to-red-500',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/30',
        particle: '#F97316'
      }
    };
    return colors[type] || colors.FLR;
  };

  const getSeverityIndicator = (event) => {
    const classType = event.classType;
    if (!classType) return null;

    const severity = classType.charAt(0);
    const severityColors = {
      'A': 'bg-green-500 shadow-green-500/50',
      'B': 'bg-yellow-500 shadow-yellow-500/50',
      'C': 'bg-orange-500 shadow-orange-500/50',
      'M': 'bg-red-500 shadow-red-500/50',
      'X': 'bg-purple-500 shadow-purple-500/50',
      'G': 'bg-pink-500 shadow-pink-500/50',
      'S': 'bg-indigo-500 shadow-indigo-500/50'
    };

    return (
      <div className={`relative w-4 h-4 rounded-full ${severityColors[severity] || 'bg-gray-500'}`}>
        <div className={`absolute inset-0 rounded-full ${severityColors[severity] || 'bg-gray-500'} animate-ping`} />
        <div className={`relative w-4 h-4 rounded-full ${severityColors[severity] || 'bg-gray-500'}`} />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-70" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl animate-pulse" />
          </div>

          {showFilters && (
            <div className="flex flex-wrap justify-center gap-4 mb-8 animate-in slide-in-from-top-2 duration-300">
              {['all', 'FLR', 'CME', 'GST', 'SEP'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedFilter === filter
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  } backdrop-blur-xl border border-gray-600/30`}
                >
                  {filter === 'all' ? 'All Events' : filter}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between gap-4 mb-12 flex-wrap">
            {[
              { 
                label: 'Active Events', 
                value: safeEvents.length, 
                icon: Activity, 
                color: 'purple-300' 
              },
              { 
                label: 'Critical Alerts', 
                value: safeEvents.filter(e => e.classType?.startsWith('X') || e.classType?.startsWith('G3')).length, 
                icon: AlertTriangle, 
                color: 'red-400' 
              },
              { 
                label: 'Solar Flares', 
                value: safeEvents.filter(e => e.eventType === 'FLR').length, 
                icon: Sun, 
                color: 'yellow-200' 
              },
              { 
                label: 'Geomagnetic', 
                value: safeEvents.filter(e => e.eventType === 'GST').length, 
                icon: Globe, 
                color: 'blue-400' 
              }
            ].map(stat => (
              <div 
                key={stat.label} 
                className="aspect-square w-50 bg-gray-800/30 backdrop-blur-xl border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div className="flex justify-end">
                  <stat.icon 
                    className="w-8 h-8 brightness-125" 
                    style={{ 
                      color: stat.color === 'purple-300' ? '#d8b4fe' : 
                            stat.color === 'yellow-200' ? '#fef08a' : 
                            stat.color === 'red-400' ? '#f87171' : '#60a5fa' 
                    }} 
                  />
                </div>
                <div className="text-center">
                  <span 
                    className="text-3xl font-bold brightness-110"
                    style={{ 
                      color: stat.color === 'purple-300' ? '#d8b4fe' : 
                            stat.color === 'yellow-200' ? '#fef08a' : 
                            stat.color === 'red-400' ? '#f87171' : '#60a5fa' 
                    }}
                  >
                    {stat.value}
                  </span>
                  <p 
                    className="font-medium text-base tracking-wide mt-2"
                    style={{ 
                      color: stat.color === 'purple-300' ? '#d8b4fe' : 
                            stat.color === 'yellow-200' ? '#fef08a' : 
                            stat.color === 'red-400' ? '#f87171' : '#60a5fa' 
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
<div className="grid gap-8 justify-items-center">
          {filteredEvents.map((event, index) => {
            const eventId = event.messageID || index;
            const isExpanded = expandedEvent === eventId;
            const colors = getEventColors(event.eventType);
            const isCritical = event.classType?.startsWith('X') || event.classType?.startsWith('G3');

            return (
              <div key={eventId}>
                <div
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-700 hover:scale-[1.02] transform backdrop-blur-xl ${colors.border} ${colors.glow} hover:shadow-2xl ${isCritical && pulseEffect ? 'animate-pulse' : ''}`}
                  style={{
                    background: hoveredCard === index 
                      ? `linear-gradient(135deg, ${colors.bg.replace('/20', '/40')}, rgba(17, 24, 39, 0.9))`
                      : `linear-gradient(135deg, ${colors.bg}, rgba(17, 24, 39, 0.8))`,
                    animationDelay: `${index * 0.15}s`
                  }}
                >
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colors.bg.replace('/20', '/10')} animate-pulse`} />
                  </div>

                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {hoveredCard === index && [...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-3 h-3 rounded-full opacity-30 ${colors.text.replace('text-', 'bg-')} animate-bounce`}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${1 + Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 p-8 text-center">
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedEvent(isExpanded ? null : eventId)}
                    >
                      <div className="flex flex-col items-center justify-center mb-6 space-y-4">
                        <div className="flex flex-col items-center space-y-4">
                          <div className={`relative w-20 h-20 rounded-3xl ${colors.icon} p-5 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex items-center justify-center`}>
                            <div className="text-white">
                              {getEventIcon(event.eventType)}
                            </div>
                            {isCritical && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                <AlertTriangle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-3 text-center">
                            <div className="flex items-center justify-center gap-4">
                              <h3 className="text-3xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
                                {event.messageType}
                              </h3>
                              {getSeverityIndicator(event)}
                            </div>
                            <div className="flex flex-col items-center gap-4 text-white">
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-white" />
                                <span className="font-medium text-lg text-white">
                                  {formatDate(event.messageIssueTime)}
                                </span>
                              </div>
                              {event.sourceLocation && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-white" />
                                  <span className="font-medium text-lg text-white">{event.sourceLocation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-4">
                          {event.classType && (
                            <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                              <span className="text-white font-bold text-xl">{event.classType}</span>
                            </div>
                          )}
                          <button className="p-4 rounded-2xl text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-xl border border-white/20 hover:scale-110">
                            {isExpanded ? <ChevronUp className="w-7 h-7 text-white" /> : <ChevronDown className="w-7 h-7 text-white" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border border-gray-600/30 rounded-3xl shadow-2xl">
                      <button
                        onClick={() => setExpandedEvent(null)}
                        className="absolute top-6 right-6 p-3 rounded-2xl text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-xl border border-white/20 hover:scale-110 z-10"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>

                      <div className="p-10 space-y-8">
                        <div className="text-center mb-8">
                          <h2 className="text-4xl font-bold text-white mb-4">{event.messageType}</h2>
                          <div className="flex items-center justify-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl ${colors.icon} p-4 shadow-xl flex items-center justify-center`}>
                              <div className="text-white">
                                {getEventIcon(event.eventType)}
                              </div>
                            </div>
                            {getSeverityIndicator(event)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            {event.beginTime && (
                              <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                                <Calendar className="w-6 h-6 text-green-400" />
                                <div>
                                  <span className="text-white font-medium block">Begin Time</span>
                                  <span className="text-white font-bold text-lg">{formatDate(event.beginTime)}</span>
                                </div>
                              </div>
                            )}
                            {event.peakTime && (
                              <div className="flex items-center gap-4 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                                <Zap className="w-6 h-6 text-yellow-400" />
                                <div>
                                  <span className="text-white font-medium block">Peak Time</span>
                                  <span className="text-white font-bold text-lg">{formatDate(event.peakTime)}</span>
                                </div>
                              </div>
                            )}
                            {event.endTime && (
                              <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                <Clock className="w-6 h-6 text-red-400" />
                                <div>
                                  <span className="text-white font-medium block">End Time</span>
                                  <span className="text-white font-bold text-lg">{formatDate(event.endTime)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-6">
                            {event.activeRegionNum && (
                              <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                                <Sun className="w-6 h-6 text-orange-400" />
                                <div>
                                  <span className="text-white font-medium block">Active Region</span>
                                  <span className="text-white font-bold text-lg">{event.activeRegionNum}</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                              <Activity className="w-6 h-6 text-purple-400" />
                              <div>
                                <span className="text-white font-medium block">Event Type</span>
                                <span className="text-white font-bold text-lg">{event.eventType}</span>
                              </div>
                            </div>
                            {event.sourceLocation && (
                              <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <MapPin className="w-6 h-6 text-blue-400" />
                                <div>
                                  <span className="text-white font-medium block">Location</span>
                                  <span className="text-white font-bold text-lg">{event.sourceLocation}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3 justify-center">
                            <Bell className="w-6 h-6 text-blue-400" />
                            <span className="text-white font-semibold text-xl">Event Details</span>
                          </div>
                          <div className="relative bg-gray-900/90 p-8 rounded-2xl border border-gray-600/40 backdrop-blur-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
                            <pre className="text-white leading-relaxed whitespace-pre-wrap font-mono text-sm">
                              {event.messageBody || 'No detailed information available'}
                            </pre>
                          </div>
                        </div>

                        {event.note && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 justify-center">
                              <AlertTriangle className="w-6 h-6 text-yellow-400" />
                              <span className="text-white font-semibold text-xl">Additional Notes</span>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl backdrop-blur-xl">
                              <p className="text-white leading-relaxed text-lg">{event.note}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-600/30 justify-center">
                          {event.link && (
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                            >
                              <ExternalLink className="w-5 h-5 text-white" />
                              View Technical Details
                            </a>
                          )}
                          <button className="flex items-center gap-3 px-6 py-4 bg-gray-700/50 text-white font-semibold rounded-2xl hover:bg-gray-600/50 transition-all duration-300 backdrop-blur-xl border border-gray-600/30">
                            <Share2 className="w-5 h-5 text-white" />
                            Share Event
                          </button>
                          <button className="flex items-center gap-3 px-6 py-4 bg-gray-700/50 text-white font-semibold rounded-2xl hover:bg-gray-600/50 transition-all duration-300 backdrop-blur-xl border border-gray-600/30">
                            <Download className="w-5 h-5 text-white" />
                            Export Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-12 mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Satellite className="w-8 h-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Space Weather Monitoring</h3>
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
              Our advanced monitoring systems track solar activity, geomagnetic conditions, and radiation levels to provide early warnings for space weather events that could impact technology and human activities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 hover:bg-purple-500/20 transition-all duration-300">
                <Sun className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Solar Monitoring</h4>
                <p className="text-gray-300">Real-time tracking of solar flares and coronal mass ejections</p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 hover:bg-blue-500/20 transition-all duration-300">
                <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Magnetosphere</h4>
                <p className="text-gray-300">Monitoring Earth's magnetic field and geomagnetic storms</p>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 hover:bg-green-500/20 transition-all duration-300">
                <Radiation className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Radiation Levels</h4>
                <p className="text-gray-300">Tracking solar energetic particles and cosmic radiation</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-semibold">Systems Online</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-xl">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-400 font-semibold">Data Streaming</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl backdrop-blur-xl">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-purple-400 font-semibold">AI Analysis Active</span>
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            Last updated: {new Date().toLocaleString()} | Data source: Space Weather Prediction Center
          </p>
        </div>
      </div>
    </div>
  );
}