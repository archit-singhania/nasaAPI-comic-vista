import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ArrowUp,
  Brain,
  Filter,
  RefreshCw,
  Monitor,
  Cpu,
  Wifi,
  Shield,
  TestTube,
  Video,
  Telescope,
  Navigation,
  Radio,
  Atom
} from 'lucide-react';

function Home() {
  const [showOptions, setShowOptions] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const insights = [
      "🚀 Mars Rover Perseverance detected new mineral formations",
      "🌍 Earth imagery shows 15% increase in Arctic ice coverage",
      "☄️ 3 new Near-Earth asteroids discovered this week",
      "🌟 Exoplanet archive updated with 47 new confirmed worlds",
      "⚡ Solar activity increased by 23% in the past 24 hours"
    ];
    setAiInsights(insights);
  }, []);

  const apiOptions = [
    {
      title: 'Astronomy Picture of the Day',
      description: 'Discover breathtaking cosmic imagery with daily curated space photography from NASA\'s archives',
      icon: <Camera className="w-7 h-7" />,
      path: '/apod',
      color: 'red',
      category: 'Visual',
      status: 'Active',
      features: ['HD Images', 'Daily Updates', 'Historical Archive']
    },
    {
      title: 'Mars Rover Photos',
      description: 'Explore Mars through high-resolution rover camera feeds from Perseverance and Curiosity',
      icon: <Rocket className="w-7 h-7" />,
      path: '/mars-rover',
      color: 'orange',
      category: 'Exploration',
      status: 'Active',
      features: ['Real-time Photos', 'Multiple Rovers', 'Sol Dating']
    },
    {
      title: 'Near Earth Asteroids',
      description: 'Track and monitor celestial objects approaching Earth with precise orbital data',
      icon: <Globe className="w-7 h-7" />,
      path: '/asteroids',
      color: 'blue',
      category: 'Tracking',
      status: 'Active',
      features: ['Orbital Data', 'Risk Assessment', 'Live Tracking']
    },
    {
      title: 'Space Weather (DONKI)',
      description: 'Real-time solar flare monitoring and space weather forecasting systems',
      icon: <Zap className="w-7 h-7" />,
      path: '/donki',
      color: 'yellow',
      category: 'Weather',
      status: 'Active',
      features: ['Solar Flares', 'CME Tracking', 'Forecasting']
    },
    {
      title: 'Earth Imagery',
      description: 'High-resolution Landsat satellite imagery and comprehensive Earth analysis tools',
      icon: <Map className="w-7 h-7" />,
      path: '/earth',
      color: 'emerald',
      category: 'Earth',
      status: 'Active',
      features: ['Landsat Data', 'Change Detection', 'Global Coverage']
    },
    {
      title: 'Natural Events (EONET)',
      description: 'Global natural phenomena tracking with real-time event visualization',
      icon: <AlertTriangle className="w-7 h-7" />,
      path: '/eonet',
      color: 'red',
      category: 'Events',
      status: 'Active',
      features: ['Real-time Events', 'Global Coverage', 'Multi-source Data']
    },
    {
      title: 'EPIC Earth Images',
      description: 'Full Earth imagery captured from the Deep Space Climate Observatory satellite',
      icon: <Satellite className="w-7 h-7" />,
      path: '/epic',
      color: 'green',
      category: 'Earth',
      status: 'Active',
      features: ['Full Earth View', 'Color Enhancement', 'Time-lapse']
    },
    {
      title: 'Exoplanet Archive',
      description: 'Discover and explore confirmed exoplanets beyond our solar system',
      icon: <Star className="w-7 h-7" />,
      path: '/exoplanet',
      color: 'purple',
      category: 'Discovery',
      status: 'Active',
      features: ['Confirmed Planets', 'Habitability Data', 'Transit Data']
    },
    {
      title: 'OSDR (Biological)',
      description: 'Open Science Data Repository for space biology and life sciences research',
      icon: <TestTube className="w-7 h-7" />,
      path: '/osdr',
      color: 'teal',
      category: 'Science',
      status: 'Active',
      features: ['Biological Data', 'Research Papers', 'Experimental Results']
    },
    {
      title: 'Mars InSight',
      description: 'Martian weather patterns, seismic activity, and atmospheric data analysis',
      icon: <Settings className="w-7 h-7" />,
      path: '/insight',
      color: 'orange',
      category: 'Science',
      status: 'Active',
      features: ['Weather Data', 'Seismic Activity', 'Atmospheric Analysis']
    },
    {
      title: 'Media Library',
      description: 'Access NASA\'s comprehensive multimedia collection and historical archives',
      icon: <Video className="w-7 h-7" />,
      path: '/media-library',
      color: 'blue',
      category: 'Archive',
      status: 'Active',
      features: ['Video Library', 'Image Archive', 'Audio Files']
    },
    {
      title: 'Technology Transfer',
      description: 'NASA innovations and technologies available for commercial applications',
      icon: <Cpu className="w-7 h-7" />,
      path: '/tech-transfer',
      color: 'teal',
      category: 'Innovation',
      status: 'Active',
      features: ['Patents', 'Licensing', 'Commercial Applications']
    },
    {
      title: 'WMTS (Web Map Tile)',
      description: 'Global imagery and data visualization through web map tile services',
      icon: <Navigation className="w-7 h-7" />,
      path: '/wmts',
      color: 'cyan',
      category: 'Mapping',
      status: 'Development',
      features: ['Map Tiles', 'Global Data', 'Interactive Maps']
    },
    {
      title: 'Satellite Tracking (TLE)',
      description: 'Real-time orbital data and precise satellite positioning information',
      icon: <Radio className="w-7 h-7" />,
      path: '/tle',
      color: 'cyan',
      category: 'Tracking',
      status: 'Active',
      features: ['Orbital Elements', 'Satellite Tracking', 'Prediction Models']
    },
    {
      title: 'TechPort',
      description: 'NASA technology portfolio and project management information system',
      icon: <Database className="w-7 h-7" />,
      path: '/techport',
      color: 'purple',
      category: 'Research',
      status: 'Active',
      features: ['Project Database', 'Technology Roadmaps', 'Innovation Tracking']
    },
    {
      title: 'SSD/CNEOS',
      description: 'Solar System Dynamics and Center for Near Earth Object Studies data',
      icon: <Atom className="w-7 h-7" />,
      path: '/ssdcneos',
      color: 'orange',
      category: 'Dynamics',
      status: 'Development',
      features: ['Orbital Mechanics', 'NEO Analysis', 'Impact Assessment']
    },
    {
      title: 'Spacecraft Data (SSC)',
      description: 'Satellite Situation Center coordinated data and orbit information',
      icon: <Telescope className="w-7 h-7" />,
      path: '/ssc',
      color: 'indigo',
      category: 'Spacecraft',
      status: 'Development',
      features: ['Mission Data', 'Orbital Parameters', 'Historical Records']
    }
  ];

  const categories = ['All', 'Visual', 'Exploration', 'Tracking', 'Weather', 'Earth', 'Events', 'Discovery', 'Science', 'Archive', 'Innovation', 'Mapping', 'Research', 'Dynamics', 'Spacecraft'];

  const filteredOptions = apiOptions.filter(option => {
    const matchesSearch = option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         option.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || option.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOptionClick = (path) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Navigating to: ${path}`);
    }, 1000);
  };

  const getColorClasses = (color) => {
    const colors = {
      red: { 
        bg: 'from-red-600 to-red-800', 
        glow: 'shadow-red-500/30',
        text: 'text-red-400',
        border: 'border-red-500/30',
        accent: '#ef4444'
      },
      orange: { 
        bg: 'from-orange-600 to-red-700', 
        glow: 'shadow-orange-500/30',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        accent: '#f97316'
      },
      blue: { 
        bg: 'from-blue-600 to-cyan-600', 
        glow: 'shadow-blue-500/30',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        accent: '#3b82f6'
      },
      green: { 
        bg: 'from-green-600 to-emerald-600', 
        glow: 'shadow-green-500/30',
        text: 'text-green-400',
        border: 'border-green-500/30',
        accent: '#10b981'
      },
      emerald: { 
        bg: 'from-emerald-600 to-green-700', 
        glow: 'shadow-emerald-500/30',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        accent: '#059669'
      },
      yellow: { 
        bg: 'from-yellow-500 to-orange-600', 
        glow: 'shadow-yellow-500/30',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        accent: '#f59e0b'
      },
      purple: { 
        bg: 'from-purple-600 to-pink-600', 
        glow: 'shadow-purple-500/30',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        accent: '#8b5cf6'
      },
      teal: { 
        bg: 'from-teal-600 to-blue-600', 
        glow: 'shadow-teal-500/30',
        text: 'text-teal-400',
        border: 'border-teal-500/30',
        accent: '#14b8a6'
      },
      cyan: { 
        bg: 'from-cyan-600 to-blue-600', 
        glow: 'shadow-cyan-500/30',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        accent: '#06b6d4'
      },
      indigo: { 
        bg: 'from-indigo-600 to-purple-600', 
        glow: 'shadow-indigo-500/30',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        accent: '#6366f1'
      }
    };
    return colors[color] || colors.red;
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-black"
    >
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="./assets/nasa-landing-page-vid.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {showOptions && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black/90 via-gray-900/90 to-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center gap-4 px-6 py-3 overflow-hidden">

            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap text-gray-300 text-sm">
                {aiInsights.join(' • ')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`relative z-30 transition-all duration-1000 ${showOptions ? 'pt-16' : ''} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        <div className="relative z-30">
          {!showOptions ? (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-12">
              <div className="text-center max-w-7xl mx-auto">
                <div className="mb-12 sm:mb-16 relative flex justify-center">
                  <div 
                    className="absolute inset-0 rounded-full blur-3xl scale-150 animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4), rgba(59, 130, 246, 0.3), transparent)',
                      opacity: 0.6
                    }}
                  />
                  <div 
                    className={`relative w-32 h-32 sm:w-48 sm:h-48 rounded-full border-2 flex items-center justify-center shadow-2xl transform transition-all duration-700 ${
                      isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-180'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(31, 41, 55, 0.8))',
                      borderColor: 'rgba(239, 68, 68, 0.5)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 0 60px rgba(239, 68, 68, 0.3), inset 0 0 60px rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    <Rocket className="w-16 h-16 sm:w-24 sm:h-24 text-white drop-shadow-2xl animate-pulse" />
                    <div 
                      className="absolute inset-0 rounded-full opacity-20"
                      style={{
                        background: 'conic-gradient(from 0deg, transparent, rgba(239, 68, 68, 0.5), transparent, rgba(59, 130, 246, 0.5), transparent)',
                        animation: 'spin 20s linear infinite'
                      }}
                    />
                  </div>
                </div>

                <div className={`mb-16 sm:mb-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 sm:mb-8 text-white leading-tight tracking-tight">
                    <span 
                      className="bg-clip-text text-transparent bg-gradient-to-r from-white via-red-200 to-blue-200 animate-pulse"
                      style={{
                        textShadow: '0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      COSMIC
                    </span>
                    <br />
                    <span 
                      className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-white to-blue-400"
                      style={{
                        textShadow: '0 0 30px rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      INSIGHT
                    </span>
                  </h1>

                  <div className="max-w-5xl mx-auto text-center px-4">
                    <p className="text-lg sm:text-2xl md:text-4xl text-gray-200 mb-6 sm:mb-8 leading-relaxed font-light tracking-wide">
                      Unlock the mysteries of the universe through{" "}
                      <span 
                        className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-blue-400"
                      >
                        NASA's most advanced APIs
                      </span>
                    </p>
                    <p className="text-base sm:text-xl text-gray-400 font-light tracking-wide mb-2">
                      Professional space data visualization and exploration platform
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>NASA CERTIFIED</span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="hidden sm:inline">• 14+ APIs • AI-POWERED</span>
                    </div>
                  </div>
                </div>

                <div className={`mb-16 sm:mb-24 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <button
                    onClick={() => setShowOptions(true)}
                    className="group relative px-12 sm:px-20 py-6 sm:py-8 overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 transform"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(59, 130, 246, 0.9))',
                      boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(59, 130, 246, 0.8))',
                      }}
                    />
                    <div className="relative flex items-center gap-3 sm:gap-4 text-white font-bold text-xl sm:text-2xl z-10">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="hidden sm:inline">INITIATE EXPLORATION</span>
                      <span className="sm:hidden">EXPLORE</span>
                      <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:-rotate-45" />
                    </div>
                  </button>
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-6xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  {[
                    { icon: <Globe className="w-8 h-8 sm:w-12 sm:h-12" />, label: "14+ APIs", desc: "Comprehensive Data", color: "blue" },
                    { icon: <Brain className="w-8 h-8 sm:w-12 sm:h-12" />, label: "AI-Powered", desc: "Smart Insights", color: "purple" },
                    { icon: <Satellite className="w-8 h-8 sm:w-12 sm:h-12" />, label: "HD Quality", desc: "4K+ Images", color: "orange" },
                    { icon: <Zap className="w-8 h-8 sm:w-12 sm:h-12" />, label: "Real-time", desc: "Live Updates", color: "yellow" }
                  ].map((feature, index) => (
                    <div 
                      key={index} 
                      className="group text-center transform hover:scale-110 transition-all duration-500"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div 
                        className={`relative w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6 rounded-2xl border-2 flex items-center justify-center text-white transition-all duration-500 shadow-2xl`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(31, 41, 55, 0.8))',
                          borderColor: `${getColorClasses(feature.color).accent}40`,
                          backdropFilter: 'blur(10px)',
                          boxShadow: `0 10px 30px ${getColorClasses(feature.color).accent}20`
                        }}
                      >
                        <div 
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(135deg, ${getColorClasses(feature.color).accent}40, ${getColorClasses(feature.color).accent}20)`
                          }}
                        />
                        <div className="relative z-10">{feature.icon}</div>
                      </div>
                      <h3 className="text-white font-bold text-lg sm:text-xl mb-2">{feature.label}</h3>
                      <p className="text-gray-400 text-sm sm:text-base font-light">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <div className="text-center mb-12 sm:mb-20">
                <button
                  onClick={() => setShowOptions(false)}
                  className="group mb-12 sm:mb-16 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-white hover:scale-105 transition-all duration-500 flex items-center gap-3 sm:gap-4 mx-auto border-2 shadow-2xl transform"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(31, 41, 55, 0.8))',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-180 transition-transform duration-300 group-hover:-translate-x-2 text-red-400" />
                  <span className="font-semibold text-base sm:text-lg">MISSION CONTROL</span>
                </button>
                
                <h2 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    SELECT YOUR{" "}
                  </span>
                  <span 
                    className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-white to-blue-400"
                    style={{
                      textShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    MISSION
                  </span>
                </h2>
                <p className="text-lg sm:text-2xl text-gray-300 font-light tracking-wide mb-8 sm:mb-12">
                  Choose your exploration path through the cosmos
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search APIs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-700 bg-black/50 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                  <div className="relative min-w-[200px]">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-700 bg-black/50 text-white focus:border-blue-500 focus:outline-none backdrop-blur-sm transition-all duration-300 appearance-none cursor-pointer"
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-gray-900">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-6 py-4 rounded-xl border-2 border-gray-700 bg-black/50 text-white hover:border-purple-500 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>

                <div className="text-center mb-8">
                  <p className="text-gray-400">
                    Found <span className="text-white font-bold">{filteredOptions.length}</span> of{' '}
                    <span className="text-white font-bold">{apiOptions.length}</span> APIs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {filteredOptions.map((option, index) => {
                  const colorClasses = getColorClasses(option.color);
                  return (
                    <div
                      key={index}
                      className={`group relative transform transition-all duration-700 hover:scale-105 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        transitionDelay: `${index * 0.05}s`
                      }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div 
                        className={`relative h-full p-6 sm:p-8 rounded-3xl border-2 backdrop-blur-md transition-all duration-700 cursor-pointer overflow-hidden ${colorClasses.border} ${colorClasses.glow}`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(17, 24, 39, 0.8))',
                          backdropFilter: 'blur(20px)',
                          boxShadow: hoveredCard === index 
                            ? `0 20px 60px ${colorClasses.accent}40, 0 0 40px ${colorClasses.accent}20`
                            : '0 10px 30px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={() => handleOptionClick(option.path)}
                      >
                        <div 
                          className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 bg-gradient-to-br ${colorClasses.bg}`}
                        />
                        
                        <div className="absolute top-4 right-4 z-10">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            option.status === 'Active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {option.status}
                          </div>
                        </div>

                        <div className="mb-6 relative z-10">
                          <div 
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${colorClasses.text} ${colorClasses.border}`}
                            style={{
                              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(31, 41, 55, 0.6))',
                              backdropFilter: 'blur(10px)',
                              boxShadow: `0 8px 24px ${colorClasses.accent}20`
                            }}
                          >
                            {option.icon}
                          </div>
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-300">
                            {option.title}
                          </h3>
                          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 group-hover:text-gray-200 transition-colors duration-300">
                            {option.description}
                          </p>

                          <div className="space-y-2 mb-6">
                            {option.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-2 text-gray-400 text-sm">
                                <div className={`w-2 h-2 rounded-full ${colorClasses.text.replace('text-', 'bg-')}`} />
                                <span className="group-hover:text-gray-300 transition-colors duration-300">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-semibold ${colorClasses.text}`}>
                              {option.category}
                            </div>
                            <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                              <span className="text-sm font-bold">EXPLORE</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${colorClasses.accent}10, transparent 50%)`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredOptions.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">🌌</div>
                  <h3 className="text-2xl font-bold text-white mb-4">No APIs Found</h3>
                  <p className="text-gray-400 mb-8">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold hover:scale-105 transition-transform duration-300"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-6" />
                    <p className="text-white text-xl font-bold mb-2">Initiating Mission...</p>
                    <p className="text-gray-400">Preparing cosmic data interface</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ef4444, #3b82f6);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #dc2626, #2563eb);
        }
      `}</style>
    </div>
  );
}

export default Home;