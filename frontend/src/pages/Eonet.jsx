import EonetMap from '../components/EonetMap';
import { motion } from 'framer-motion';

export default function Eonet() {
  return (
    <motion.div 
      className="min-h-screen bg-gray-900"
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8 bg-black">
          <div className="mb-8">
            <h1 
              className="font-bold text-white mb-2 text-center"
              style={{ fontSize: '2rem' }}
            >
              Earth Natural Events
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
              Real-time tracking of natural events around the world including wildfires, 
              severe storms, earthquakes, volcanoes, and more. Data is sourced from NASA's 
              Earth Observatory Natural Event Tracker (EONET) system.
            </p>

            <p className="text-md text-gray-400 max-w-2xl mx-auto text-center mt-4">
              🌍 Fun Fact: NASA's EONET system helps track natural disasters in near real-time using satellite data.<br/>
              🚀 The system monitors over 60 types of events including wildfires, severe storms, and volcanic activity.<br/>
              🔥 EONET helps scientists and emergency responders stay updated on global natural events as they happen.
            </p>
          </div>

          <div className="h-10"></div> 

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 w-64 border-2 border-white shadow-xl hover:scale-105 hover:shadow-blue-400/50 transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white">Data Source</p>
                  <p className="text-xl font-bold text-white">NASA EONET</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 w-64 border-2 border-white shadow-xl hover:scale-105 hover:shadow-red-400/50 transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white">Active Events</p>
                  <p className="text-xl font-bold text-white">Loading...</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 w-64 border-2 border-white shadow-xl hover:scale-105 hover:shadow-green-400/50 transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white">Update Frequency</p>
                  <p className="text-xl font-bold text-white">Real-time</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 w-64 border-2 border-white shadow-xl hover:scale-105 hover:shadow-purple-400/50 transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white">Categories</p>
                  <p className="text-xl font-bold text-white">13 Types</p>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <EonetMap />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
                🌐 Event Categories
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: '#fb923c', fontWeight: '500' }}>🔥 Wildfires</span>
                  <span style={{ color: '#9ca3af' }}>Forest and brush fires</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#00FFFF', fontWeight: '500' }}>⛈️ Severe Storms</span>
                  <span style={{ color: '#9ca3af' }}>Hurricanes, cyclones, typhoons</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#a78bfa', fontWeight: '500' }}>🌋 Volcanoes</span>
                  <span style={{ color: '#9ca3af' }}>Volcanic eruptions and activity</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#8FFCFD', fontWeight: '500' }}>🧊 Sea and Lake Ice</span>
                  <span style={{ color: '#9ca3af' }}>Ice formation and melting</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#4ade80', fontWeight: '500' }}>🌍 Earthquakes</span>
                  <span style={{ color: '#9ca3af' }}>Seismic activity</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#22d3ee', fontWeight: '500' }}>🌊 Floods</span>
                  <span style={{ color: '#9ca3af' }}>Flooding events</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#f0fdfa', fontWeight: '500' }}>⛄ Snow</span>
                  <span style={{ color: '#9ca3af' }}>Significant snowfall</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#B86B4B', fontWeight: '500' }}>🏔️ Landslides</span>
                  <span style={{ color: '#9ca3af' }}>Ground movement events</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#facc15', fontWeight: '500' }}>💨 Dust and Haze</span>
                  <span style={{ color: '#9ca3af' }}>Airborne dust events</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#c4b5fd', fontWeight: '500' }}>💥 Manmade</span>
                  <span style={{ color: '#9ca3af' }}>Human-caused incidents</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#f472b6', fontWeight: '500' }}>🌡️ Temperature Extremes</span>
                  <span style={{ color: '#9ca3af' }}>Extreme heat or cold</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: '#38bdf8', fontWeight: '500' }}>🎨 Water Color</span>
                  <span style={{ color: '#9ca3af' }}>Unusual water coloration</span>
                </div>

              </div>
            </div>

          </div>

          <div className="mt-12 text-center text-gray-400 text-sm">
            <p>
              Data provided by NASA's Earth Observatory Natural Event Tracker (EONET). 
              Events are updated continuously as new information becomes available.
            </p>
            <p className="mt-2">
              For more information, visit{' '}
              <a 
                href="https://eonet.gsfc.nasa.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                NASA EONET
              </a>
            </p>
          </div>
        </div>
      </div>
      </motion.div>
  );
}