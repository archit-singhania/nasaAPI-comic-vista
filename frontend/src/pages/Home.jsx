import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Globe, 
  Camera, 
  Satellite, 
  Zap, 
  Star, 
  Map,
  AlertTriangle,
  Database,
  Search,
  Download,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react';

function Home() {
  const [showOptions, setShowOptions] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const apiOptions = [
    {
      title: 'Astronomy Picture of the Day',
      description: 'Discover breathtaking cosmic imagery with daily curated space photography',
      icon: <Camera className="w-6 h-6" />,
      path: '/apod',
      color: 'purple'
    },
    {
      title: 'Mars Rover Photos',
      description: 'Explore Mars through high-resolution rover camera feeds',
      icon: <Rocket className="w-6 h-6" />,
      path: '/mars-rover',
      color: 'red'
    },
    {
      title: 'Near Earth Asteroids',
      description: 'Track and monitor celestial objects approaching Earth',
      icon: <Globe className="w-6 h-6" />,
      path: '/asteroids',
      color: 'blue'
    },
    {
      title: 'EPIC Earth Images',
      description: 'Full Earth imagery captured from deep space observatory',
      icon: <Satellite className="w-6 h-6" />,
      path: '/epic',
      color: 'green'
    },
    {
      title: 'Earth Imagery',
      description: 'High-resolution Landsat satellite imagery and analysis',
      icon: <Map className="w-6 h-6" />,
      path: '/earth',
      color: 'emerald'
    },
    {
      title: 'Space Weather',
      description: 'Real-time solar flare and space weather monitoring',
      icon: <Zap className="w-6 h-6" />,
      path: '/donki',
      color: 'yellow'
    },
    {
      title: 'Natural Events',
      description: 'Global natural phenomena tracking and visualization',
      icon: <AlertTriangle className="w-6 h-6" />,
      path: '/eonet',
      color: 'pink'
    },
    {
      title: 'Mars InSight',
      description: 'Martian weather patterns and seismic activity data',
      icon: <Settings className="w-6 h-6" />,
      path: '/insight',
      color: 'orange'
    },
    {
      title: 'Exoplanets',
      description: 'Discover and explore worlds beyond our solar system',
      icon: <Star className="w-6 h-6" />,
      path: '/exoplanet',
      color: 'indigo'
    },
    {
      title: 'Media Library',
      description: 'Access NASA\'s comprehensive multimedia collection',
      icon: <Database className="w-6 h-6" />,
      path: '/media-library',
      color: 'violet'
    },
    {
      title: 'Technology Transfer',
      description: 'NASA innovations available for commercial applications',
      icon: <Search className="w-6 h-6" />,
      path: '/tech-transfer',
      color: 'teal'
    },
    {
      title: 'Satellite Tracking',
      description: 'Precise orbital data and satellite positioning systems',
      icon: <Download className="w-6 h-6" />,
      path: '/tle',
      color: 'cyan'
    }
  ];

  const handleOptionClick = (path) => {
    console.log(`Navigating to: ${path}`);
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-purple-400', border: 'border-purple-500' },
      red: { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-400', border: 'border-red-500' },
      blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-400', border: 'border-blue-500' },
      green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-400', border: 'border-green-500' },
      emerald: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-400', border: 'border-emerald-500' },
      yellow: { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', text: 'text-yellow-400', border: 'border-yellow-500' },
      pink: { bg: 'bg-pink-600', hover: 'hover:bg-pink-700', text: 'text-pink-400', border: 'border-pink-500' },
      orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-400', border: 'border-orange-500' },
      indigo: { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-400', border: 'border-indigo-500' },
      violet: { bg: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-400', border: 'border-violet-500' },
      teal: { bg: 'bg-teal-600', hover: 'hover:bg-teal-700', text: 'text-teal-400', border: 'border-teal-500' },
      cyan: { bg: 'bg-cyan-600', hover: 'hover:bg-cyan-700', text: 'text-cyan-400', border: 'border-cyan-500' }
    };
    return colors[color] || colors.purple;
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        position: 'relative'
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4,
              animation: `float ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      <div
        className="fixed pointer-events-none transition-all duration-500 ease-out z-1"
        style={{
          background: `radial-gradient(circle 400px at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(139, 92, 246, 0.15), 
            rgba(236, 72, 153, 0.08), 
            transparent 60%)`,
          width: '100vw',
          height: '100vh',
          opacity: 0.8
        }}
      />

      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {!showOptions ? (
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-16 relative flex justify-center">
              <div 
                className="absolute inset-0 rounded-full blur-3xl scale-150"
                style={{
                  background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6)',
                  opacity: 0.3
                }}
              />
              <div 
                className="relative w-40 h-40 rounded-3xl border-2 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <Rocket className="w-20 h-20 text-white drop-shadow-lg" />
                <div 
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                  }}
                />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 text-white leading-tight tracking-tight">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #e5e7eb, #ffffff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Cosmic Insight
              </span>
            </h1>

            <div className="mb-20 max-w-4xl mx-auto text-center">
              <p className="text-2xl md:text-4xl text-gray-200 mb-6 leading-relaxed font-light tracking-wide">
                Unlock the mysteries of the universe through{" "}
                <span 
                  className="font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  NASA's most powerful APIs
                </span>
              </p>
              <p className="text-xl text-gray-400 font-light tracking-wide">
                Explore, discover, and be amazed by the cosmos
              </p>
            </div>

            <button
              onClick={() => setShowOptions(true)}
              className="group relative px-20 py-8 mb-24 overflow-hidden rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 transform"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              }}
            >
              <div 
                className="absolute inset-0 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                }}
              />
              <div className="relative flex items-center gap-4 text-white font-bold text-2xl z-10">
                <Sparkles className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
                Begin Your Journey
                <ChevronRight className="w-8 h-8 transition-transform duration-300 group-hover:translate-x-2" />
              </div>
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { icon: <Globe className="w-10 h-10" />, label: "13+ APIs", desc: "Comprehensive", color: "blue" },
                { icon: <Star className="w-10 h-10" />, label: "Real-time", desc: "Live Data", color: "purple" },
                { icon: <Satellite className="w-10 h-10" />, label: "High Quality", desc: "Premium Sources", color: "green" },
                { icon: <Zap className="w-10 h-10" />, label: "Lightning Fast", desc: "Optimized", color: "yellow" }
              ].map((feature, index) => (
                <div key={index} className="group text-center transform hover:scale-110 transition-all duration-500">
                  <div 
                    className={`relative w-24 h-24 mx-auto mb-6 rounded-2xl border-2 flex items-center justify-center text-white group-hover:${getColorClasses(feature.color).text} transition-all duration-500 shadow-2xl`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
                      borderColor: 'rgba(107, 114, 128, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        background: getColorClasses(feature.color).bg.includes('purple') ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' :
                                   getColorClasses(feature.color).bg.includes('blue') ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                                   getColorClasses(feature.color).bg.includes('green') ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   'linear-gradient(135deg, #f59e0b, #d97706)'
                      }}
                    />
                    <div className="relative z-10">{feature.icon}</div>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{feature.label}</h3>
                  <p className="text-gray-400 text-base font-light">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <button
                onClick={() => setShowOptions(false)}
                className="group mb-12 px-10 py-5 rounded-2xl text-white hover:scale-105 transition-all duration-500 flex items-center gap-4 mx-auto border-2 shadow-2xl transform"
                style={{
                  background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
                  borderColor: 'rgba(107, 114, 128, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <ChevronRight className="w-6 h-6 rotate-180 transition-transform duration-300 group-hover:-translate-x-2 text-white" />
                <span className="font-semibold text-lg">Back to Home</span>
              </button>
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight">
                Choose Your{" "}
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Cosmic Journey
                </span>
              </h2>
              <p className="text-2xl text-gray-300 font-light tracking-wide">
                Select an API to start exploring the infinite universe
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {apiOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionClick(option.path)}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group cursor-pointer relative p-8 rounded-3xl border-2 transition-all duration-500 hover:scale-105 shadow-2xl transform hover:-translate-y-2"
                  style={{
                    background: hoveredCard === index 
                      ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.9), rgba(31, 41, 55, 0.9))'
                      : 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
                    borderColor: hoveredCard === index 
                      ? 'rgba(139, 92, 246, 0.5)' 
                      : 'rgba(107, 114, 128, 0.3)',
                    backdropFilter: 'blur(20px)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div 
                    className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-all duration-500`}
                    style={{
                      background: getColorClasses(option.color).bg.includes('purple') ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' :
                                 getColorClasses(option.color).bg.includes('red') ? 'linear-gradient(135deg, #ef4444, #f97316)' :
                                 getColorClasses(option.color).bg.includes('blue') ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                                 getColorClasses(option.color).bg.includes('green') ? 'linear-gradient(135deg, #10b981, #059669)' :
                                 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div 
                      className={`w-20 h-20 rounded-2xl p-5 mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}
                      style={{
                        background: getColorClasses(option.color).bg.includes('purple') ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' :
                                   getColorClasses(option.color).bg.includes('red') ? 'linear-gradient(135deg, #ef4444, #f97316)' :
                                   getColorClasses(option.color).bg.includes('blue') ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                                   getColorClasses(option.color).bg.includes('green') ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   getColorClasses(option.color).bg.includes('emerald') ? 'linear-gradient(135deg, #059669, #047857)' :
                                   getColorClasses(option.color).bg.includes('yellow') ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                   getColorClasses(option.color).bg.includes('pink') ? 'linear-gradient(135deg, #ec4899, #be185d)' :
                                   getColorClasses(option.color).bg.includes('orange') ? 'linear-gradient(135deg, #f97316, #ea580c)' :
                                   getColorClasses(option.color).bg.includes('indigo') ? 'linear-gradient(135deg, #6366f1, #4f46e5)' :
                                   getColorClasses(option.color).bg.includes('violet') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                                   getColorClasses(option.color).bg.includes('teal') ? 'linear-gradient(135deg, #14b8a6, #0d9488)' :
                                   'linear-gradient(135deg, #06b6d4, #0891b2)'
                      }}
                    >
                      <div className="text-white w-full h-full flex items-center justify-center">
                        {option.icon}
                      </div>
                    </div>

                    <h3 
                      className={`text-2xl font-bold text-white mb-4 group-hover:${getColorClasses(option.color).text} transition-all duration-500`}
                    >
                      {option.title}
                    </h3>

                    <p className="text-gray-400 mb-8 leading-relaxed text-lg font-light">
                      {option.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${getColorClasses(option.color).text} font-semibold group-hover:text-pink-400 transition-colors duration-500 text-lg`}>
                        <span>Explore Now</span>
                        <ChevronRight className="w-6 h-6 ml-2 transition-transform duration-500 group-hover:translate-x-2" />
                      </div>
                      <div 
                        className={`w-10 h-10 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-500`}
                        style={{
                          background: getColorClasses(option.color).bg.includes('purple') ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' :
                                     getColorClasses(option.color).bg.includes('red') ? 'linear-gradient(135deg, #ef4444, #f97316)' :
                                     getColorClasses(option.color).bg.includes('blue') ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                                     'linear-gradient(135deg, #8b5cf6, #ec4899)'
                        }}
                      />
                    </div>
                  </div>

                  <div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
                      filter: 'blur(10px)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          25% { transform: translateY(-10px) rotate(90deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
          75% { transform: translateY(-10px) rotate(270deg); opacity: 0.6; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.4; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
}

export default Home;