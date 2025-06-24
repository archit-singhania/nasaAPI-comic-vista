import ApodViewer from '../components/ApodViewer';

const Apod = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '30s'}}></div>
    </div>

    <div className="relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
      
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-20 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-lg rounded-full border border-white/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <div className="relative">
              <span className="text-3xl animate-bounce">🌌</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-30 animate-pulse"></div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 tracking-widest">
                NASA ASTRONOMY
              </div>
              <div className="text-xs text-white/60 font-medium">
                Official API Integration
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none mb-4">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
                Astronomy
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                Picture
              </span>
              <span className="block text-white drop-shadow-2xl">
                of the Day
              </span>
            </h1>
            
            <div className="mx-auto w-32 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full animate-pulse"></div>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-6 font-light">
              Discover the cosmos through NASA's daily featured astronomical images,
              videos, and explanations from professional astronomers.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                { icon: '🚀', text: 'NASA Official API' },
                { icon: '🔬', text: 'Professional Analysis' },
                { icon: '📅', text: 'Daily Updates' },
                { icon: '🌟', text: 'HD Quality' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-white/80 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative px-8 py-4 bg-black rounded-2xl leading-none flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <span className="text-white font-bold">Explore the Universe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="relative z-10 px-6 pb-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8 lg:p-12">
            <ApodViewer />
          </div>
        </div>
      </div>
    </div>

    <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Powered by NASA API • Built with cutting-edge technology • Data updated daily
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Apod;