import { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';

export default function DonkiEvents({ events = [], eventType = 'notifications' }) {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const safeEvents = Array.isArray(events) ? events : [];

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
        border: 'border-yellow-500/30',
        icon: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/25'
      },
      SEP: {
        bg: 'from-purple-500/20 to-indigo-500/20',
        border: 'border-purple-500/30',
        icon: 'bg-gradient-to-br from-purple-500 to-indigo-500',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/25'
      },
      CME: {
        bg: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        icon: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/25'
      },
      IPS: {
        bg: 'from-red-500/20 to-pink-500/20',
        border: 'border-red-500/30',
        icon: 'bg-gradient-to-br from-red-500 to-pink-500',
        text: 'text-red-400',
        glow: 'shadow-red-500/25'
      },
      MPC: {
        bg: 'from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/30',
        icon: 'bg-gradient-to-br from-green-500 to-emerald-500',
        text: 'text-green-400',
        glow: 'shadow-green-500/25'
      },
      GST: {
        bg: 'from-orange-500/20 to-red-500/20',
        border: 'border-orange-500/30',
        icon: 'bg-gradient-to-br from-orange-500 to-red-500',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/25'
      },
      RBE: {
        bg: 'from-pink-500/20 to-rose-500/20',
        border: 'border-pink-500/30',
        icon: 'bg-gradient-to-br from-pink-500 to-rose-500',
        text: 'text-pink-400',
        glow: 'shadow-pink-500/25'
      },
      notifications: {
        bg: 'from-gray-500/20 to-slate-500/20',
        border: 'border-gray-500/30',
        icon: 'bg-gradient-to-br from-gray-500 to-slate-500',
        text: 'text-gray-400',
        glow: 'shadow-gray-500/25'
      }
    };
    return colors[type] || colors.notifications;
  };

  const getSeverityIndicator = (event) => {
    const classType = event.classType;
    if (!classType) return null;

    const severity = classType.charAt(0);
    const severityColors = {
      'A': 'bg-green-500',
      'B': 'bg-yellow-500',
      'C': 'bg-orange-500',
      'M': 'bg-red-500',
      'X': 'bg-purple-500'
    };

    return (
      <div className={`w-3 h-3 rounded-full ${severityColors[severity] || 'bg-gray-500'} animate-pulse`} />
    );
  };

  const renderEventDetails = (event) => {
    if (eventType === 'notifications') {
      return (
        <div className="mt-8 space-y-6 p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 font-medium">Message Type:</span>
                <span className="text-white font-semibold">{event.messageType || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 font-medium">Issue Time:</span>
                <span className="text-white font-semibold">{formatDate(event.messageIssueTime)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300 font-medium text-lg">Message Content:</span>
            </div>
            <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700/50 backdrop-blur-xl">
              <p className="text-gray-100 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {event.messageBody || 'No message body available'}
              </p>
            </div>
          </div>

          {event.messageURL && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-700/30">
              <ExternalLink className="w-5 h-5 text-blue-400" />
              <a 
                href={event.messageURL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300 flex items-center gap-2"
              >
                View Detailed Report
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mt-8 space-y-6 p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {event.beginTime && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 font-medium">Begin Time:</span>
                <span className="text-white font-semibold">{formatDate(event.beginTime)}</span>
              </div>
            )}
            {event.peakTime && (
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 font-medium">Peak Time:</span>
                <span className="text-white font-semibold">{formatDate(event.peakTime)}</span>
              </div>
            )}
            {event.endTime && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-gray-300 font-medium">End Time:</span>
                <span className="text-white font-semibold">{formatDate(event.endTime)}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {event.classType && (
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 font-medium">Class:</span>
                <div className="flex items-center gap-2">
                  {getSeverityIndicator(event)}
                  <span className="text-white font-bold text-lg">{event.classType}</span>
                </div>
              </div>
            )}
            {event.sourceLocation && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 font-medium">Source Location:</span>
                <span className="text-white font-semibold">{event.sourceLocation}</span>
              </div>
            )}
            {event.activeRegionNum && (
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300 font-medium">Active Region:</span>
                <span className="text-white font-semibold">{event.activeRegionNum}</span>
              </div>
            )}
          </div>
        </div>

        {event.note && (
          <div className="space-y-3 pt-4 border-t border-gray-700/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300 font-medium text-lg">Additional Notes:</span>
            </div>
            <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700/50 backdrop-blur-xl">
              <p className="text-gray-100 leading-relaxed">{event.note}</p>
            </div>
          </div>
        )}

        {event.link && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-700/30">
            <ExternalLink className="w-5 h-5 text-blue-400" />
            <a 
              href={event.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300 flex items-center gap-2"
            >
              View Technical Details
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span className="text-2xl font-bold text-white">
            {safeEvents.length} cosmic event{safeEvents.length !== 1 ? 's' : ''} detected
          </span>
          <Sparkles className="w-6 h-6 text-pink-400" />
        </div>
      </div>

      <div className="grid gap-8">
        {safeEvents.map((event, index) => {
          const eventId = event.messageID || event.flrID || event.activityID || index;
          const isExpanded = expandedEvent === eventId;
          const eventTypeFromData = event.eventType || eventType;
          const colors = getEventColors(eventTypeFromData);

          return (
            <div
              key={eventId}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-500 hover:scale-[1.02] transform backdrop-blur-xl ${colors.border} ${colors.glow} hover:shadow-2xl`}
              style={{
                background: hoveredCard === index 
                  ? `linear-gradient(135deg, ${colors.bg.replace('/20', '/30')}, rgba(17, 24, 39, 0.9))`
                  : `linear-gradient(135deg, ${colors.bg}, rgba(17, 24, 39, 0.8))`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-all duration-500 bg-gradient-to-br ${colors.bg.replace('/20', '/40')}`} />
              
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full opacity-20 ${colors.text.replace('text-', 'bg-')} animate-pulse`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 p-8">
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedEvent(isExpanded ? null : eventId)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl ${colors.icon} p-4 shadow-lg group-hover:scale-110 transition-all duration-500 flex items-center justify-center`}>
                        <div className="text-white">
                          {getEventIcon(eventTypeFromData)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
                            {event.messageType || `${eventType.toUpperCase()} Event`}
                          </h3>
                          {getSeverityIndicator(event)}
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {formatDate(event.messageIssueTime || event.beginTime)}
                            </span>
                          </div>
                          {event.sourceLocation && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{event.sourceLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {event.classType && (
                        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
                          <span className="text-white font-bold text-lg">{event.classType}</span>
                        </div>
                      )}
                      <button className={`p-3 rounded-xl ${colors.text} hover:bg-white/10 transition-all duration-300 backdrop-blur-xl border border-white/20`}>
                        {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                  {isExpanded && renderEventDetails(event)}
                </div>
              </div>

              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 pointer-events-none bg-gradient-to-br ${colors.bg.replace('/20', '/40')} blur-xl`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}