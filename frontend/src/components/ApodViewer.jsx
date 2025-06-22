import React, { useState, useEffect, useRef } from 'react';
import { Heart, Calendar, Share2, Download, Play, Pause, Volume2, VolumeX, Maximize, Star, Bookmark, Eye, Clock, Camera, Film, Award, Sparkles, ArrowRight, ChevronDown, Search, Filter, TrendingUp, Globe, Rocket, Telescope, ChevronLeft, MoreHorizontal, ExternalLink, Fullscreen, ZoomIn, Info, Image as ImageIcon } from 'lucide-react';

const PremiumApodViewer = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewCount] = useState(Math.floor(Math.random() * 100000) + 50000);
  const [readMore, setReadMore] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    setTimeout(() => {
      setApod({
        title: "The Horsehead Nebula in Infrared",
        explanation: "One of the most identifiable nebulae in the sky, the Horsehead Nebula in Orion, is part of a large, dark, molecular cloud. Also known as Barnard 33, the unusual shape was first discovered on a photographic plate in the late 1800s. The red glow originates from hydrogen gas predominantly behind the nebula, ionized by the nearby bright star Sigma Orionis. The darkness of the Horsehead is caused mostly by thick dust, although the lower part of the Horsehead's neck casts a shadow to the left. Streams of gas leaving the nebula are funneled by a strong magnetic field. Bright spots in the Horsehead Nebula's base are young stars just in the process of forming. This spectacular image was captured by the James Webb Space Telescope, revealing unprecedented detail in infrared light that penetrates the cosmic dust.",
        url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=800&fit=crop",
        hdurl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=2400&h=1600&fit=crop",
        media_type: "image",
        date: "2024-06-16",
        copyright: "NASA, ESA, CSA, STScI, Hubble Heritage Team"
      });
      setLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleFavorite = () => {
    const isFavorite = favorites.some(fav => fav?.date === apod?.date);
    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.date !== apod.date));
    } else {
      setFavorites(prev => [...prev, apod]);
    }
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: apod?.title,
          text: `Check out today's Astronomy Picture of the Day: ${apod?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${apod?.title} - ${window.location.href}`);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = apod?.hdurl || apod?.url;
    link.download = `${apod?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    link.click();
  };

  const openImageViewer = () => {
    setShowImageViewer(true);
  };

  const isFavorite = favorites.some(fav => fav?.date === apod?.date);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/30"></div>
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"
            style={{
              transform: `translate(${-mousePosition.x * 0.1}px, ${-mousePosition.y * 0.1}px)`
            }}
          ></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Telescope className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Exploring the Cosmos</h2>
              <p className="text-gray-400 text-lg">Loading today's astronomical wonder...</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Telescope className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">COSMOS</span>
                </div>
                
                <nav className="hidden md:flex space-x-6">
                  {['Home', 'Explore', 'Archive', 'Favorites'].map((item, index) => (
                    <button
                      key={item}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        index === 0
                          ? 'text-white border-b-2 border-red-500'
                          : 'text-gray-300 hover:text-white hover:scale-105'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110">
                  <Search className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full ring-2 ring-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          ></div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-500/20 to-purple-500/20 backdrop-blur-sm border border-red-500/30 rounded-full px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold tracking-wide">FEATURED TODAY</span>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-8 leading-none">
              <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Astronomy Picture
              </span>
              <span className="block bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                of the Day
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Experience the universe through NASA's daily collection of stunning astronomical images, 
              videos, and expert explanations from professional astronomers worldwide.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" ref={containerRef}>
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
          
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">NASA Astronomy</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span>{new Date(apod?.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{viewCount.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`group p-3 rounded-xl transition-all duration-300 ${
                    isFavorite 
                      ? 'bg-red-500/20 text-red-400 scale-110' 
                      : 'hover:bg-white/10 text-gray-400 hover:text-white hover:scale-110'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''} group-hover:scale-110 transition-transform`} />
                </button>
                <button 
                  onClick={shareContent}
                  className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={downloadImage}
                  className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative group">
            {apod?.media_type === 'image' ? (
              <div className="relative overflow-hidden">
                <img
                  ref={imageRef}
                  src={apod.url}
                  alt={apod.title}
                  onLoad={() => setImageLoaded(true)}
                  className="w-full h-auto transition-all duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={openImageViewer}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute top-6 right-6 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  {apod.hdurl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(apod.hdurl, '_blank');
                      }}
                      className="p-3 bg-black/80 backdrop-blur-sm rounded-xl hover:bg-black/90 transition-all duration-200 border border-white/20 hover:scale-110 group/btn"
                    >
                      <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageViewer();
                    }}
                    className="p-3 bg-black/80 backdrop-blur-sm rounded-xl hover:bg-black/90 transition-all duration-200 border border-white/20 hover:scale-110 group/btn"
                  >
                    <ZoomIn className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>

                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex items-center space-x-3 bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="text-sm font-semibold block">High Definition</span>
                      <span className="text-xs text-gray-400">Click to expand</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-gray-900 to-black aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Video Content</p>
                  <p className="text-gray-500 text-sm">Click to play</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">{apod?.title}</h2>
              
              <div className="flex items-center justify-between py-6 border-y border-white/10">
                <div className="flex items-center space-x-8">
                  <button className="flex items-center space-x-2 hover:text-red-400 transition-colors group">
                    <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-lg">{Math.floor(Math.random() * 5000) + 1000}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-blue-400 transition-colors group">
                    <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-lg">{Math.floor(Math.random() * 500) + 100}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-yellow-400 transition-colors group">
                    <Bookmark className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-lg">{Math.floor(Math.random() * 200) + 50}</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Updated daily at 00:00 UTC</span>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="relative">
                  <p className={`text-gray-300 leading-relaxed text-lg transition-all duration-500 ${
                    readMore ? '' : 'line-clamp-4'
                  }`}>
                    {apod?.explanation}
                  </p>
                  {apod?.explanation && apod.explanation.length > 200 && (
                    <button
                      onClick={() => setReadMore(!readMore)}
                      className="mt-4 flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group"
                    >
                      <span className="font-medium">{readMore ? 'Show Less' : 'Read More'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform group-hover:scale-110 ${readMore ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              
              {apod?.copyright && (
                <div className="mt-8 p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Image Credit & Copyright</p>
                      <p className="font-semibold text-lg">{apod.copyright}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-8 right-8 z-40">
          <div className="bg-black/90 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-400" />
              <span className="font-bold text-lg">Time Travel</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1995-06-16"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all hover:bg-white/20"
            />
          </div>
        </div>
      </main>

      {showImageViewer && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-black/80 rounded-full hover:bg-black/90 transition-colors"
            >
              <ArrowRight className="w-6 h-6 rotate-45" />
            </button>
            <img
              src={apod?.hdurl || apod?.url}
              alt={apod?.title}
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PremiumApodViewer;