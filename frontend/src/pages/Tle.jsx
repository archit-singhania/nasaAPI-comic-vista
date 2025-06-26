import TleVisualizer from '../components/TleVisualizer';

export default function Tle() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🛰️ TLE Satellite Tracker
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Track satellites in real-time using Two-Line Element (TLE) data. 
              Search by name, browse by category, or explore orbital parameters 
              of thousands of satellites orbiting Earth.
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