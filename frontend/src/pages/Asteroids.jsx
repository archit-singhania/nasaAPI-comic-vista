import React, { useState, useEffect } from 'react';
import { 
  Globe, Telescope, AlertTriangle, Eye, Star, 
  Calendar, Share2, Download, Search, Filter,
  TrendingUp, Zap, ChevronDown, MoreHorizontal,
  Rocket, Award, Clock, Info, RefreshCw
} from 'lucide-react';
import NeoWsChart from '../components/NeoWsChart';

const PremiumAsteroids = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalAsteroids: 0,
    potentiallyHazardous: 0,
    averageSize: 0,
    closestApproach: 0
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Near-Earth Asteroids Dashboard',
          text: 'Check out this amazing asteroid tracking dashboard!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">ASTEROIDS</span>
                </div>
                
                <nav className="hidden md:flex space-x-6">
                  {['Dashboard', 'Live Feed', 'Archive', 'Analytics'].map((item, index) => (
                    <button
                      key={item}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        index === 0
                          ? 'text-white border-b-2 border-orange-500'
                          : 'text-gray-300 hover:text-white hover:scale-105'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110">
                  <Search className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full ring-2 ring-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
          <div 
            className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-transparent to-red-900/30"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          ></div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold tracking-wide">LIVE TRACKING</span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-8 leading-none">
              <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Near-Earth
              </span>
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Asteroids
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Real-time monitoring and analysis of potentially hazardous asteroids approaching Earth. 
              Stay informed about cosmic visitors with comprehensive tracking data and risk assessments.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
          
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Telescope className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">NASA Near-Earth Object Program</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span>{new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>Real-time data</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={shareContent}
                  className="group p-3 rounded-xl transition-all duration-300 hover:bg-white/10 text-gray-400 hover:text-white hover:scale-110"
                >
                  <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <NeoWsChart onStatsUpdate={setStats} />
          </div>

          <div className="p-6 sm:p-8 border-t border-white/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
                <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalAsteroids}</div>
                <div className="text-sm text-gray-400">Total Tracked</div>
              </div>
              
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.potentiallyHazardous}</div>
                <div className="text-sm text-gray-400">Potentially Hazardous</div>
              </div>
              
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.averageSize} km</div>
                <div className="text-sm text-gray-400">Average Size</div>
              </div>
              
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30">
                <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.closestApproach}M km</div>
                <div className="text-sm text-gray-400">Closest Approach</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 border-t border-white/10">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Data Source</p>
                  <p className="font-semibold text-lg">NASA Near Earth Object Web Service (NeoWs)</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                This dashboard provides real-time data from NASA's comprehensive database of near-Earth objects. 
                All measurements and classifications follow official NASA guidelines for potentially hazardous asteroid identification.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-8 right-8 z-40">
          <div className="bg-black/90 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-orange-400" />
              <span className="font-bold text-lg">Date Range</span>
            </div>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              min="1995-06-16"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all hover:bg-white/20"
            />
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default PremiumAsteroids;