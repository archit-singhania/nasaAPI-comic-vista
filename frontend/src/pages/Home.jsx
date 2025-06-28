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
  Settings,
  ChevronRight,
  Sparkles,
  ArrowUp,
  Brain,
  Filter,
  RefreshCw,
  Cpu,
  TestTube,
  Video,
  Telescope,
  Navigation,
  Radio,
  Atom,
  ChevronDown
} from 'lucide-react';
import Loader from '../components/common/Loader';
import { motion } from 'framer-motion';

function Home() {
  const [showOptions, setShowOptions] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [aiInsights, setAiInsights] = useState([]);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading] = useState(false);
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
      icon: <Camera className="w-7 h-7" style={{color: '#fca5a5'}} />,
      path: '/apod',
      color: 'red',
      category: 'Visual',
      status: 'Active',
      features: ['HD Images', 'Daily Updates', 'Historical Archive'],
      style: { 
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)',
        border: '1px solid rgba(248, 113, 113, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Mars Rover Photos',
      description: 'Explore Mars through high-resolution rover camera feeds from Perseverance and Curiosity',
      icon: <Rocket className="w-7 h-7" style={{color: '#fdba74'}} />,
      path: '/mars-rover',
      color: 'orange',
      category: 'Exploration',
      status: 'Active',
      features: ['Real-time Photos', 'Multiple Rovers', 'Sol Dating'],
      style: { 
        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        boxShadow: '0 8px 32px rgba(234, 88, 12, 0.4)',
        border: '1px solid rgba(251, 146, 60, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Near Earth Asteroids',
      description: 'Track and monitor celestial objects approaching Earth with precise orbital data',
      icon: <Globe className="w-7 h-7" style={{color: '#93c5fd'}} />,
      path: '/asteroids',
      color: 'blue',
      category: 'Tracking',
      status: 'Active',
      features: ['Orbital Data', 'Risk Assessment', 'Live Tracking'],
      style: { 
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4)',
        border: '1px solid rgba(96, 165, 250, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Space Weather (DONKI)',
      description: 'Real-time solar flare monitoring and space weather forecasting systems',
      icon: <Zap className="w-7 h-7" style={{color: '#fde047'}} />,
      path: '/donki',
      color: 'yellow',
      category: 'Weather',
      status: 'Active',
      features: ['Solar Flares', 'CME Tracking', 'Forecasting'],
      style: { 
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
        border: '1px solid rgba(253, 224, 71, 0.5)',
        color: '#1f2937'
      }
    },
    {
      title: 'Earth Imagery',
      description: 'High-resolution Landsat satellite imagery and comprehensive Earth analysis tools',
      icon: <Map className="w-7 h-7" style={{color: '#6ee7b7'}} />,
      path: '/earth',
      color: 'emerald',
      category: 'Earth',
      status: 'Active',
      features: ['Landsat Data', 'Change Detection', 'Global Coverage'],
      style: { 
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        boxShadow: '0 8px 32px rgba(5, 150, 105, 0.4)',
        border: '1px solid rgba(110, 231, 183, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Natural Events (EONET)',
      description: 'Global natural phenomena tracking with real-time event visualization',
      icon: <AlertTriangle className="w-7 h-7" style={{color: '#fca5a5'}} />,
      path: '/eonet',
      color: 'red',
      category: 'Events',
      status: 'Active',
      features: ['Real-time Events', 'Global Coverage', 'Multi-source Data'],
      style: { 
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)',
        border: '1px solid rgba(248, 113, 113, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'EPIC Earth Images',
      description: 'Full Earth imagery captured from the Deep Space Climate Observatory satellite',
      icon: <Satellite className="w-7 h-7" style={{color: '#86efac'}} />,
      path: '/epic',
      color: 'green',
      category: 'Earth',
      status: 'Active',
      features: ['Full Earth View', 'Color Enhancement', 'Time-lapse'],
      style: { 
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        boxShadow: '0 8px 32px rgba(22, 163, 74, 0.4)',
        border: '1px solid rgba(134, 239, 172, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Exoplanet Archive',
      description: 'Discover and explore confirmed exoplanets beyond our solar system',
      icon: <Star className="w-7 h-7" style={{color: '#c4b5fd'}} />,
      path: '/exoplanet',
      color: 'purple',
      category: 'Discovery',
      status: 'in-Development',
      features: ['Confirmed Planets', 'Habitability Data', 'Transit Data'],
      style: { 
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
        border: '1px solid rgba(196, 181, 253, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'OSDR (Biological)',
      description: 'Open Science Data Repository for space biology and life sciences research',
      icon: <TestTube className="w-7 h-7" style={{color: '#99f6e4'}} />,
      path: '/osdr',
      color: 'teal',
      category: 'Science',
      status: 'Active',
      features: ['Biological Data', 'Research Papers', 'Experimental Results'],
      style: { 
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        boxShadow: '0 8px 32px rgba(13, 148, 136, 0.4)',
        border: '1px solid rgba(153, 246, 228, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Mars InSight',
      description: 'Martian weather patterns, seismic activity, and atmospheric data analysis',
      icon: <Settings className="w-7 h-7" style={{color: '#fdba74'}} />,
      path: '/insight',
      color: 'orange',
      category: 'Science',
      status: 'Active',
      features: ['Weather Data', 'Seismic Activity', 'Atmospheric Analysis'],
      style: { 
        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        boxShadow: '0 8px 32px rgba(234, 88, 12, 0.4)',
        border: '1px solid rgba(251, 146, 60, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Media Library',
      description: 'Access NASA\'s comprehensive multimedia collection and historical archives',
      icon: <Video className="w-7 h-7" style={{color: '#93c5fd'}} />,
      path: '/media-library',
      color: 'blue',
      category: 'Archive',
      status: 'in-Development',
      features: ['Video Library', 'Image Archive', 'Audio Files'],
      style: { 
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4)',
        border: '1px solid rgba(96, 165, 250, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Technology Transfer',
      description: 'NASA innovations and technologies available for commercial applications',
      icon: <Cpu className="w-7 h-7" style={{color: '#99f6e4'}} />,
      path: '/tech-transfer',
      color: 'teal',
      category: 'Innovation',
      status: 'in-Development',
      features: ['Patents', 'Licensing', 'Commercial Applications'],
      style: { 
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        boxShadow: '0 8px 32px rgba(13, 148, 136, 0.4)',
        border: '1px solid rgba(153, 246, 228, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'WMTS (Web Map Tile)',
      description: 'Global imagery and data visualization through web map tile services',
      icon: <Navigation className="w-7 h-7" style={{color: '#67e8f9'}} />,
      path: '/wmts',
      color: 'cyan',
      category: 'Mapping',
      status: 'in-Development',
      features: ['Map Tiles', 'Global Data', 'Interactive Maps'],
      style: { 
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        boxShadow: '0 8px 32px rgba(8, 145, 178, 0.4)',
        border: '1px solid rgba(165, 243, 252, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Satellite Tracking (TLE)',
      description: 'Real-time orbital data and precise satellite positioning information',
      icon: <Radio className="w-7 h-7" style={{color: '#67e8f9'}} />,
      path: '/tle',
      color: 'cyan',
      category: 'Tracking',
      status: 'Active',
      features: ['Orbital Elements', 'Satellite Tracking', 'Prediction Models'],
      style: { 
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        boxShadow: '0 8px 32px rgba(8, 145, 178, 0.4)',
        border: '1px solid rgba(165, 243, 252, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'TechPort',
      description: 'NASA technology portfolio and project management information system',
      icon: <Database className="w-7 h-7" style={{color: '#c4b5fd'}} />,
      path: '/techport',
      color: 'purple',
      category: 'Research',
      status: 'Coming Soon',
      features: ['Project Database', 'Technology Roadmaps', 'Innovation Tracking'],
      style: { 
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
        border: '1px solid rgba(196, 181, 253, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'SSD/CNEOS',
      description: 'Solar System Dynamics and Center for Near Earth Object Studies data',
      icon: <Atom className="w-7 h-7" style={{color: '#fdba74'}} />,
      path: '/ssdcneos',
      color: 'orange',
      category: 'Dynamics',
      status: 'Coming Soon',
      features: ['Orbital Mechanics', 'NEO Analysis', 'Impact Assessment'],
      style: { 
        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        boxShadow: '0 8px 32px rgba(234, 88, 12, 0.4)',
        border: '1px solid rgba(251, 146, 60, 0.5)',
        color: '#f3f4f6'
      }
    },
    {
      title: 'Spacecraft Data (SSC)',
      description: 'Satellite Situation Center coordinated data and orbit information',
      icon: <Telescope className="w-7 h-7" style={{color: '#c7d2fe'}} />,
      path: '/ssc',
      color: 'indigo',
      category: 'Spacecraft',
      status: 'Coming Soon',
      features: ['Mission Data', 'Orbital Parameters', 'Historical Records'],
      style: { 
        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
        boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
        border: '1px solid rgba(199, 210, 254, 0.5)',
        color: '#f3f4f6'
      }
    }
  ];

  const categories = ['All', 'Visual', 'Exploration', 'Tracking', 'Weather', 'Earth', 'Events', 'Discovery', 'Science', 'Archive', 'Innovation', 'Mapping', 'Research', 'Dynamics', 'Spacecraft'];

  const filteredOptions = apiOptions.filter(option => {
    const matchesSearch = option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         option.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || option.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getColorClasses = (color) => {
    const colors = {
      red: { 
        bg: 'from-red-600 to-red-800', 
        glow: 'shadow-red-500/40',
        text: 'text-red-300',
        border: 'border-red-400/50',
        accent: '#ef4444'
      },
      orange: { 
        bg: 'from-orange-600 to-red-700', 
        glow: 'shadow-orange-500/40',
        text: 'text-orange-300',
        border: 'border-orange-400/50',
        accent: '#f97316'
      },
      blue: { 
        bg: 'from-blue-600 to-cyan-600', 
        glow: 'shadow-blue-500/40',
        text: 'text-blue-300',
        border: 'border-blue-400/50',
        accent: '#3b82f6'
      },
      green: { 
        bg: 'from-green-600 to-emerald-600', 
        glow: 'shadow-green-500/40',
        text: 'text-green-300',
        border: 'border-green-400/50',
        accent: '#10b981'
      },
      emerald: { 
        bg: 'from-emerald-600 to-green-700', 
        glow: 'shadow-emerald-500/40',
        text: 'text-emerald-300',
        border: 'border-emerald-400/50',
        accent: '#059669'
      },
      yellow: { 
        bg: 'from-yellow-500 to-orange-600', 
        glow: 'shadow-yellow-500/40',
        text: 'text-yellow-300',
        border: 'border-yellow-400/50',
        accent: '#f59e0b'
      },
      purple: { 
        bg: 'from-purple-600 to-pink-600', 
        glow: 'shadow-purple-500/40',
        text: 'text-purple-300',
        border: 'border-purple-400/50',
        accent: '#8b5cf6'
      },
      teal: { 
        bg: 'from-teal-600 to-blue-600', 
        glow: 'shadow-teal-500/40',
        text: 'text-teal-300',
        border: 'border-teal-400/50',
        accent: '#14b8a6'
      },
      cyan: { 
        bg: 'from-cyan-600 to-blue-600', 
        glow: 'shadow-cyan-500/40',
        text: 'text-cyan-300',
        border: 'border-cyan-400/50',
        accent: '#06b6d4'
      },
      indigo: { 
        bg: 'from-indigo-600 to-purple-600', 
        glow: 'shadow-indigo-500/40',
        text: 'text-indigo-300',
        border: 'border-indigo-400/50',
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
        {!videoLoaded && <Loader />}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src="https://storage.googleapis.com/cosmic-video-file/nasa-landing-page-vid.mp4" type="video/mp4" />
        </video>
        <div className="fixed top-0 left-0 w-full flex justify-between items-start p-4 z-50 pointer-events-none">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg"
            alt="Earth from Apollo"
            className="w-10 sm:w-14 h-auto rounded-full shadow-md pointer-events-auto"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/NASA_seal.svg/400px-NASA_seal.svg.png"
            alt="NASA Seal"
            className="w-10 sm:w-14 h-auto rounded-full shadow-md pointer-events-auto"
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg"
            alt="NASA Meatball Logo"
            className="w-10 sm:w-14 h-auto rounded-full shadow-md pointer-events-auto"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/NASA_Worm_logo.svg/500px-NASA_Worm_logo.svg.png"
            alt="NASA Worm Logo"
            className="w-10 sm:w-14 h-auto rounded-full shadow-md pointer-events-auto"
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/US-NASA-Seal-EO10849.jpg/500px-US-NASA-Seal-EO10849.jpg"
            alt="NASA EO Seal"
            className="w-10 sm:w-14 h-auto rounded-full shadow-md pointer-events-auto"
          />
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {showOptions && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black/90 via-gray-900/90 to-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center gap-4 px-6 py-3 overflow-hidden">

            <div className="marquee-container">
              <div className="w-max animate-marquee text-gray-300 text-sm">
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
                  <span className="font-semibold text-base sm:text-lg">RETURN TO DASHBOARD</span>
                </button>
                
                <h2 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    Explore The NASA's{" "}
                  </span>
                  <span 
                    className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-white to-blue-400"
                    style={{
                      textShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    Extensive APIs
                  </span>
                </h2>
                <p className="text-lg sm:text-2xl text-gray-300 font-light tracking-wide mb-8 sm:mb-12">
                  Choose your exploration path through the cosmos
                </p>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                  className="flex flex-col lg:flex-row items-center justify-between gap-4 mx-auto mb-6 px-4"
                  style={{ maxWidth: '600px' }}
                >
                  <div 
                    className="relative w-full lg:w-64"
                    style={{ height: '40px' }}
                  >
                    <Search 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 group-hover:text-red-500 transition-colors duration-300" 
                      style={{ color: '#6b7280' }}
                    />
                    <input
                      type="text"
                      placeholder="Search APIs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        paddingLeft: '40px',
                        paddingRight: '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        borderRadius: '8px',
                        border: '1.5px solid rgba(209, 213, 219, 0.4)',
                        background: 'linear-gradient(135deg, #1f2937, #111827)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        outline: 'none',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.5s ease',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                        height: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f87171';
                        e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 4px rgba(239,68,68,0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                        e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.background = 'linear-gradient(90deg, white, white)';
                        e.target.style.boxShadow = '0 8px 25px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.6)';
                        e.target.style.color = 'black';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = 'linear-gradient(135deg, #374151, #1f2937)';
                        e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
                        e.target.style.color = 'white';
                      }}
                    />
                  </div>
                  
                  <div 
                    className="relative w-full lg:w-48"
                    style={{ height: '40px' }}
                  >
                    <Filter 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 group-hover:text-blue-500 transition-colors duration-300" 
                      style={{ color: '#6b7280' }}
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        width: '100%',
                        paddingLeft: '40px',
                        paddingRight: '32px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        borderRadius: '8px',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        background: 'linear-gradient(135deg, #1f2937, #111827)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        outline: 'none',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.5s ease',
                        appearance: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                        height: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#60a5fa';
                        e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 4px rgba(59,130,246,0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                        e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.background = 'linear-gradient(90deg, white, white)';
                        e.target.style.boxShadow = '0 8px 25px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.6)';
                        e.target.style.color = 'black';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = 'linear-gradient(135deg, #374151, #1f2937)';
                        e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
                        e.target.style.color = 'white';
                      }}
                    >
                      {categories.map(category => (
                        <option 
                          key={category} 
                          value={category} 
                          style={{ 
                            backgroundColor: 'white', 
                            color: 'black', 
                            fontWeight: 'bold' 
                          }}
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                    <div 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    >
                      <svg 
                        className="w-4 h-4 transition-colors duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: '#6b7280' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '2px solid transparent',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(249,250,251,0.95))',
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      transition: 'all 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backdropFilter: 'blur(20px)',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                      height: '34px',
                      width: 'fit-content',
                      minwidth: '100%'
                    }}
                    className="w-full lg:w-auto flex-shrink-0"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.background = 'linear-gradient(135deg, #ffffff, #f4f4f5)';
                      e.target.style.boxShadow = '0 8px 25px rgba(147,51,234,0.2), inset 0 1px 0 rgba(255,255,255,0.6)';
                      e.target.style.borderColor = '#a855f7';
                      const icon = e.target.querySelector('svg');
                      if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                        icon.style.color = '#a855f7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.background = 'linear-gradient(135deg, #f9fafb, #e5e7eb)';
                      e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
                      e.target.style.borderColor = 'transparent';
                      const icon = e.target.querySelector('svg');
                      if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                        icon.style.color = 'black';
                      }
                    }}
                  >
                    <RefreshCw 
                      className="w-4 h-4" 
                      style={{ 
                        transition: 'all 0.5s ease',
                        color: 'black'
                      }}
                    />
                    <span>Reset</span>
                  </button>
                </motion.div>

                <div className="h-10" /> 

                <div className="text-center mb-8">
                  <p className="text-gray-400">
                    Found <span className="text-white font-bold">{filteredOptions.length}</span> of{' '}
                    <span className="text-white font-bold">{apiOptions.length}</span> APIs
                  </p>
                </div>
              </div>
              <div className="h-8" /> 
          
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4">
                {filteredOptions.map((option, index) => {
                  const colorClasses = getColorClasses(option.color);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
                      className={`group relative transform transition-all duration-700 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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
                      >
                        <div 
                          className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 bg-gradient-to-br ${colorClasses.bg}`}
                        />
                        
                        <div className="absolute top-4 right-4 z-10">
                          <div
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              backgroundColor:
                                option.status === 'Active'
                                  ? 'rgba(34,197,94,0.2)'          
                                  : option.status === 'Coming Soon'
                                  ? 'rgba(253,224,71,0.2)'         
                                  : 'rgba(239,68,68,0.2)',          
                              color:
                                option.status === 'Active'
                                  ? 'rgb(34,197,94)'
                                  : option.status === 'Coming Soon'
                                  ? 'rgb(202,138,4)'
                                  : 'rgb(239,68,68)',
                              border:
                                `1px solid ${
                                  option.status === 'Active'
                                    ? 'rgba(34,197,94,0.3)'
                                    : option.status === 'Coming Soon'
                                    ? 'rgba(202,138,4,0.3)'
                                    : 'rgba(239,68,68,0.3)'
                                }`
                            }}
                          >
                            {option.status}<ChevronDown
                              size={16} 
                              strokeWidth={2.5} 
                              style={{ marginTop: '1px' }}
                            />
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
                            <div
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                backgroundColor:
                                  option.category === 'Weather'
                                    ? 'rgba(96,165,250,0.2)'      
                                    : option.category === 'Mapping'
                                    ? 'rgba(103,232,249,0.2)'    
                                    : option.category === 'Imagery'
                                    ? 'rgba(251,191,36,0.2)'     
                                    : option.category === 'Exploration'
                                    ? 'rgba(244,114,182,0.2)'    
                                    : option.category === 'Technology'
                                    ? 'rgba(165,180,252,0.2)'     
                                    : option.category === 'Science'
                                    ? 'rgba(134,239,172,0.2)'    
                                    : 'rgba(163,163,163,0.2)',    
                                color:
                                  option.category === 'Weather'
                                    ? 'rgb(59,130,246)'          
                                    : option.category === 'Mapping'
                                    ? 'rgb(6,182,212)'            
                                    : option.category === 'Imagery'
                                    ? 'rgb(245,158,11)'           
                                    : option.category === 'Exploration'
                                    ? 'rgb(236,72,153)'          
                                    : option.category === 'Technology'
                                    ? 'rgb(99,102,241)'           
                                    : option.category === 'Science'
                                    ? 'rgb(245,158,11)'            
                                    : 'rgb(99,102,241)',         
                                border:
                                  `1px solid ${
                                    option.category === 'Weather'
                                      ? 'rgba(96,165,250,0.4)'
                                      : option.category === 'Mapping'
                                      ? 'rgba(103,232,249,0.4)'
                                      : option.category === 'Imagery'
                                      ? 'rgba(251,191,36,0.4)'
                                      : option.category === 'Exploration'
                                      ? 'rgba(244,114,182,0.4)'
                                      : option.category === 'Technology'
                                      ? 'rgba(165,180,252,0.4)'
                                      : option.category === 'Science'
                                      ? 'rgba(134,239,172,0.4)'
                                      : 'rgba(163,163,163,0.4)'
                                  }`
                              }}
                            >
                              {option.category}
                            </div>

                            <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                              <span className="text-sm font-bold">INFO</span>
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
                    </motion.div>
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
          display: inline-block;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
        }

        .marquee-container {
          flex: 1;
          overflow: hidden;
          position: relative;
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