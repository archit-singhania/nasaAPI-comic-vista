import TleVisualizer from '../components/TleVisualizer';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Tle() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      setIsLoading(false);
    }, 3500); 

    return () => clearTimeout(delay);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-wide mb-4">
            🛰️ Welcome to <span className="text-blue-400">Orbital Frontier</span>
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl">
            Preparing satellite data from beyond Earth’s horizon...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/assets/sat-view.jpg')` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{
          duration: 1.2,
          ease: 'easeInOut',
        }}
        className="text-center py-12"
      >
        <h1 className="text-5xl font-extrabold text-white drop-shadow-2xl tracking-wide">
          🌌 Welcome to the Orbital Frontier
        </h1>
        <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
          A portal to the invisible architecture above us—track satellites in real-time.
        </p>
      </motion.div>

      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🛰️ TLE Satellite Tracker
            </h1>
            <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed">
              Discover and Explore real-time satellite orbital Two-Line Element (TLE) data. 
              Search by name, browse by category, or explore orbital parameters from NASA's comprehensive database.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TleVisualizer />
      </div>

      <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="text-gray-300">
              <h3 className="font-semibold text-white mb-2">📡 Real-Time Data</h3>
              <p className="text-sm">
                Updated TLE data from authoritative sources including NORAD and CelesTrak
              </p>
            </div>
            <div className="text-gray-300">
              <h3 className="font-semibold text-white mb-2">🗂️ Categories</h3>
              <p className="text-sm">
                Browse satellites by type: ISS, weather, communications, CubeSats, and more
              </p>
            </div>
            <div className="text-gray-300">
              <h3 className="font-semibold text-white mb-2">🔍 Advanced Search</h3>
              <p className="text-sm">
                Find specific satellites by name or explore orbital characteristics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
