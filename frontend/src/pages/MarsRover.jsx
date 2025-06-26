import { useState, useEffect } from 'react';
import MarsRoverGallery from '../components/MarsRoverGallery';
import { motion } from 'framer-motion';

const MarsRover = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="p-6 min-h-screen bg-gradient-to-b from-black via-gray-900 to-black"
    >
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center mt-40 space-y-6 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide animate-pulse">
            🚀 Booting Up <span className="text-cyan-300">Mars Rover Feed</span>…
          </h2>

          <div className="w-32 border-t border-cyan-500 my-2"></div>

          <div className="w-12 h-12 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>

          <p className="text-gray-100 text-sm tracking-wide">
            <span className="text-blue-400 font-semibold">Contacting NASA Servers & Retrieving Photos...</span>
          </p>
        </motion.div>
      ) : (
        <>
          <MarsRoverGallery />
        </>
      )}
    </motion.div>
  );
};

export default MarsRover;
