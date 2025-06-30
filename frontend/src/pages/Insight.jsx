import { useEffect, useState } from 'react';
import { fetchInsight } from '../api/nasaAPI';
import InsightWeather from '../components/InsightWeather';
import { motion } from 'framer-motion';

export default function Insight() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('weather');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchInsight();
        setData(response.data || response);
        setDataLoaded(true);
      } catch (err) {
        console.error('❌ Failed to load InSight data:', err);
        setError(`Failed to load data: ${err.message}`);
        setDataLoaded(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (dataLoaded && videoLoaded) {
      setLoading(false);
    }
  }, [dataLoaded, videoLoaded]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  useEffect(() => {
    const videoTimeout = setTimeout(() => {
      if (!videoLoaded) {
        console.warn('⏳ Video load timeout. Proceeding without video.');
        setVideoLoaded(true);
      }
    }, 5000);

    return () => clearTimeout(videoTimeout);
  }, [videoLoaded]);

  const handleVideoError = (e) => {
    setVideoLoaded(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-100 via-red-200 to-red-300">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl font-bold mb-2 text-black"
            style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            animate={pulseAnimation}
          >
            Fetching Martian Weather...
          </motion.h1>
          <motion.p 
            className="text-lg text-black mb-6"
            style={{ fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Initializing systems from the Red Planet
          </motion.p>
          
          <motion.div 
            className="mt-6 flex justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="rounded-full h-8 w-8 border-b-2 border-black"></div>
          </motion.div>
          
          <motion.div 
            className="mt-4 text-sm text-black"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>Loading: {dataLoaded ? '✓' : '⏳'} Data | {videoLoaded ? '✓' : '⏳'} Video</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-red-200 to-red-300 flex items-center justify-center">
        <motion.div 
          className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full mx-4 border border-red-200"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="text-center">
            <motion.div 
              className="text-red-500 text-6xl mb-4"
              animate={floatAnimation}
            >
              🚫
            </motion.div>
            <h2 className="text-2xl font-bold text-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Connection Error
            </h2>
            <p className="text-black mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </p>
            <motion.button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(220, 38, 38, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={handleVideoLoad}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://storage.googleapis.com/insight-page-video/mars-Insight-page-vid.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-br from-red-200/80 via-red-300/70 to-red-400/60"></div>
      </div>

      <motion.div 
        className="relative min-h-screen" 
        style={{ zIndex: 1 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="text-center backdrop-blur-md border-b-2 border-red-600/50"
          style={{
            background: 'linear-gradient(to right, rgba(248, 113, 113, 0.95), rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
            padding: '2rem 1.5rem',
          }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-2 text-black text-center"
            style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            animate={floatAnimation}
          >
            Welcome to the Martian Weather Station
          </motion.h2>
          <motion.p 
            className="text-lg text-black text-center"
            style={{ fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tracking atmospheric conditions from NASA's InSight Lander on Mars
          </motion.p>
        </motion.div>

        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={itemVariants}
        >
          {viewMode === 'weather' ? (
            <motion.div 
              className="bg-red-50/95 backdrop-blur-md rounded-lg shadow-xl border border-red-200/50 overflow-hidden"
              whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(220, 38, 38, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <InsightWeather />
            </motion.div>
          ) : (
            <motion.div 
              className="bg-red-50/95 backdrop-blur-md rounded-lg shadow-xl p-6 border border-red-200/50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 text-center sm:text-left">
                <h2 className="text-xl font-semibold text-black mb-2 sm:mb-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Raw API Response
                </h2>
                <div className="flex items-center space-x-2 text-sm text-black">
                  <motion.span animate={pulseAnimation}>🔍</motion.span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Developer Mode</span>
                </div>
              </div>
              
              <motion.div 
                className="bg-gray-900/95 backdrop-blur-sm text-green-400 p-4 rounded-lg overflow-auto max-h-96 border border-red-300/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <pre className="text-sm font-mono whitespace-pre-wrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </motion.div>
              
              <motion.div 
                className="mt-4 p-4 bg-red-100/90 backdrop-blur-sm border border-red-300/50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-600">ℹ️</span>
                  <h3 className="font-semibold text-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Raw Data Information
                  </h3>
                </div>
                <p className="text-sm text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
                  This view shows the unprocessed JSON response from NASA's InSight Weather API. 
                  Use this for debugging or understanding the data structure. Switch to "Weather View" 
                  for a user-friendly interface.
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="bg-red-900/95 backdrop-blur-md text-white mt-12 border-t border-red-700/50"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  About InSight
                </h3>
                <p className="text-black text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  NASA's InSight mission landed on Mars in November 2018 to study the planet's interior. 
                  The mission officially ended in December 2022 but left behind a treasure trove of weather data.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Weather Instruments
                </h3>
                <ul className="text-black text-sm space-y-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <li>• Temperature and Wind for InSight (TWINS)</li>
                  <li>• Auxiliary Payload Sensor Suite (APSS)</li>
                  <li>• Pressure sensor and magnetometer</li>
                </ul>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibent mb-3 text-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Data Details
                </h3>
                <ul className="text-black text-sm space-y-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <li>• Sol: Martian solar day (~24h 37min)</li>
                  <li>• Temperatures in Celsius</li>
                  <li>• Pressure in Pascals</li>
                  <li>• Wind speed in meters per second</li>
                </ul>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="border-t border-red-700/50 mt-8 pt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <p className="text-black text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                Data provided by NASA's InSight Mars Mission • 
                <motion.a 
                  href="https://mars.nasa.gov/insight/" 
                  className="text-black hover:text-gray-700 ml-1 transition-colors duration-200 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                >
                  Learn more about InSight
                </motion.a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}