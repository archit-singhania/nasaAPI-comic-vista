import React, { useState, useEffect } from 'react';
import { 
  Globe, Telescope, AlertTriangle, Eye, Star, 
  Calendar, Share2, Download, Search, Filter,
  TrendingUp, Zap, ChevronDown, MoreHorizontal,
  Rocket, Award, Clock, Info, RefreshCw
} from 'lucide-react';
import NeoWsChart from '../components/NeoWsChart';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumAsteroids = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [asteroids, setAsteroids] = useState([]);
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

  useEffect(() => {
    const generateAsteroids = () => {
      const newAsteroids = [];
      for (let i = 0; i < 8; i++) {
        newAsteroids.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 2,
          speed: Math.random() * 20 + 10,
          angle: Math.random() * 360,
          opacity: Math.random() * 0.6 + 0.2,
          hazardous: Math.random() > 0.7
        });
      }
      setAsteroids(newAsteroids);
    };

    generateAsteroids();
    const interval = setInterval(generateAsteroids, 15000); 
    return () => clearInterval(interval);
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

  const CometTrail = ({ asteroid }) => {
    const trailLength = 5;
    const trails = Array.from({ length: trailLength }, (_, i) => i);

    return (
      <div className="absolute inset-0 pointer-events-none">
        {trails.map((trail, index) => (
          <motion.div
            key={`${asteroid.id}-trail-${index}`}
            className={`absolute w-1 h-1 rounded-full ${
              asteroid.hazardous ? 'bg-red-400' : 'bg-blue-400'
            }`}
            style={{
              left: `${asteroid.x}%`,
              top: `${asteroid.y}%`,
              opacity: asteroid.opacity * (1 - index * 0.2)
            }}
            animate={{
              x: [
                0,
                -Math.cos((asteroid.angle * Math.PI) / 180) * asteroid.speed * (index + 1) * 2,
                -Math.cos((asteroid.angle * Math.PI) / 180) * asteroid.speed * (index + 1) * 4
              ],
              y: [
                0,
                -Math.sin((asteroid.angle * Math.PI) / 180) * asteroid.speed * (index + 1) * 2,
                -Math.sin((asteroid.angle * Math.PI) / 180) * asteroid.speed * (index + 1) * 4
              ],
              opacity: [asteroid.opacity * (1 - index * 0.2), 0, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    );
  };

  const AnimatedAsteroid = ({ asteroid }) => (
    <motion.div
      key={asteroid.id}
      className="absolute pointer-events-none"
      style={{
        left: `${asteroid.x}%`,
        top: `${asteroid.y}%`,
        width: `${asteroid.size}px`,
        height: `${asteroid.size}px`
      }}
      initial={{ 
        opacity: 0, 
        scale: 0,
        x: -100,
        y: -100
      }}
      animate={{
        opacity: asteroid.opacity,
        scale: [0.8, 1, 0.8],
        x: [
          0,
          Math.cos((asteroid.angle * Math.PI) / 180) * asteroid.speed * 10,
          Math.cos((asteroid.angle * Math.PI) / 180) * asteroid.speed * 20
        ],
        y: [
          0,
          Math.sin((asteroid.angle * Math.PI) / 180) * asteroid.speed * 10,
          Math.sin((asteroid.angle * Math.PI) / 180) * asteroid.speed * 20
        ],
        rotate: [0, 360]
      }}
      exit={{ 
        opacity: 0, 
        scale: 0,
        x: Math.cos((asteroid.angle * Math.PI) / 180) * asteroid.speed * 30,
        y: Math.sin((asteroid.angle * Math.PI) / 180) * asteroid.speed * 30
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "linear",
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    >
      <div
        className={`w-full h-full rounded-full shadow-lg ${
          asteroid.hazardous 
            ? 'bg-gradient-to-br from-red-400 via-orange-500 to-red-600' 
            : 'bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600'
        }`}
        style={{
          boxShadow: asteroid.hazardous 
            ? '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)' 
            : '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)'
        }}
      />
      
      <div
        className={`absolute inset-0 rounded-full animate-pulse ${
          asteroid.hazardous 
            ? 'bg-gradient-to-br from-red-300/30 to-orange-400/30' 
            : 'bg-gradient-to-br from-blue-300/30 to-cyan-400/30'
        }`}
        style={{
          filter: 'blur(4px)',
          transform: 'scale(1.5)'
        }}
      />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="min-h-screen bg-black text-white relative overflow-x-hidden"
    >
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      >
       <div className="bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20"> 
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-2xl sm:text-4xl font-bold text-white text-center">
                NEAR EARTH ASTEROIDS LIVE TRACKING
              </span>
            </motion.div>
          </div>
        </div>
      </div>
      </motion.header>

      <section className="pt-16 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-transparent to-red-900/30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 20%, rgba(194, 65, 12, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 60%, rgba(194, 65, 12, 0.3) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
        </motion.div>
        
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            className="text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(249, 115, 22, 0.3)',
                  '0 0 30px rgba(239, 68, 68, 0.4)',
                  '0 0 20px rgba(249, 115, 22, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <span className="text-base sm:text-lg font-medium tracking-wide text-white max-w-3xl text-left">
                Real-time monitoring and analysis of potentially hazardous asteroids approaching Earth. 
                Stay informed about cosmic visitors with comprehensive tracking data and risk assessments.
              </span>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {/* Optional heading */}
            </motion.h1>
          </motion.div>
        </div>
      </section>

      <motion.main 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.div 
          className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div 
            className="p-6 sm:p-8 border-b border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Telescope className="w-7 h-7 text-white" />
                </motion.div>
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
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Eye className="w-3 h-3" />
                      </motion.div>
                      <span>Real-time data</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {[
                  { icon: Share2, action: shareContent },
                  { icon: Download, action: () => {} },
                  { icon: RefreshCw, action: () => {} },
                  { icon: MoreHorizontal, action: () => {} }
                ].map(({ icon: Icon, action }, index) => (
                  <motion.button
                    key={index}
                    onClick={action}
                    whileHover={{ scale: 1.1, rotate: index === 2 ? 180 : 0 }}
                    whileTap={{ scale: 0.9 }}
                    className="group p-3 rounded-xl transition-all duration-300 hover:bg-white/10 text-gray-400 hover:text-white"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <NeoWsChart onStatsUpdate={setStats} />
          </motion.div>

          <motion.div 
            className="p-6 sm:p-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Globe, value: stats.totalAsteroids, label: 'Total Tracked', color: 'blue' },
                { icon: AlertTriangle, value: stats.potentiallyHazardous, label: 'Potentially Hazardous', color: 'red' },
                { icon: TrendingUp, value: `${stats.averageSize} km`, label: 'Average Size', color: 'purple' },
                { icon: Zap, value: `${stats.closestApproach}M km`, label: 'Closest Approach', color: 'green' }
              ].map(({ icon: Icon, value, label, color }, index) => (
                <motion.div
                  key={index}
                  className={`text-center p-4 rounded-2xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/10 border border-${color}-500/30`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.8 + index * 0.1, type: "spring", stiffness: 400, damping: 10 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <Icon className={`w-8 h-8 text-${color}-400 mx-auto mb-2`} />
                  </motion.div>
                  <motion.div 
                    className="text-2xl font-bold text-white"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {value}
                  </motion.div>
                  <div className="text-sm text-gray-400">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="p-6 sm:p-8 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <motion.div 
                  className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Info className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Data Source</p>
                  <p className="font-semibold text-lg">NASA Near Earth Object Web Service (NeoWs)</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                This dashboard provides real-time data from NASA's comprehensive database of near-Earth objects. 
                All measurements and classifications follow official NASA guidelines for potentially hazardous asteroid identification.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.main>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes asteroidGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4); }
        }
        
        @keyframes hazardousGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4); }
        }
      `}</style>
    </motion.div>
  );
};

export default PremiumAsteroids;