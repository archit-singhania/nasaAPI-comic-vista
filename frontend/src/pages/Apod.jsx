import NasaApodViewer from '../components/ApodViewer';
import { motion } from 'framer-motion';

const Apod = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen bg-black relative overflow-hidden"
  >
    <div className="relative z-10">
      <NasaApodViewer />
    </div>
    <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Powered by NASA API • Built with React & Express • Data updated daily
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default Apod;
