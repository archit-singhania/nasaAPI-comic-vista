import { useState, useEffect, useRef } from 'react';
import { X, Heart, Calendar, Share2, Download, Play, Pause, Volume2, VolumeX, Maximize, Star, Bookmark, Eye, Clock, Camera, Film, Award, Sparkles, ArrowRight, ChevronDown, Search, Filter, TrendingUp, Globe, Rocket, Telescope, ChevronLeft, MoreHorizontal, ExternalLink, Fullscreen, ZoomIn, Info, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchApod } from '../api/nasaAPI';

const NasaApodViewer = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewCount] = useState(Math.floor(Math.random() * 100000) + 50000);
  const [readMore, setReadMore] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  const [likesCount] = useState(Math.floor(Math.random() * 5000) + 1000);
  const [sharesCount] = useState(Math.floor(Math.random() * 500) + 100);
  const [bookmarksCount] = useState(Math.floor(Math.random() * 200) + 50);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    fetchApod().then(setApod).catch(setError).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setLoading(true);
      fetchApod({ date: selectedDate }).then(setApod).catch(setError).finally(() => setLoading(false));
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
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
    if (navigator.share && apod) {
      try {
        await navigator.share({
          title: apod.title,
          text: `Check out today's Astronomy Picture of the Day: ${apod.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else if (apod) {
      try {
        await navigator.clipboard.writeText(`${apod.title} - ${window.location.href}`);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
        const textArea = document.createElement('textarea');
        textArea.value = `${apod.title} - ${window.location.href}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
      }
    }
  };

  const downloadImage = () => {
    if (!apod) return;
    
    const link = document.createElement('a');
    link.href = apod.hdurl || apod.url;
    link.download = `${apod.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    link.target = '_blank'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openImageViewer = () => {
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    fetchApod(selectedDate ? { date: selectedDate } : {})
      .then(setApod)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  const isFavorite = favorites.some(fav => fav?.date === apod?.date);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-900/30 via-black to-red-900/20"></div>
        
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
        
        <div 
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
          }}
        ></div>
        <div 
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${-mousePosition.x * 0.1}px, ${-mousePosition.y * 0.1}px)`,
            animationDelay: '1s'
          }}
        ></div>
        
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-blue-600/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-b-transparent animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                <Rocket className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-red-600/20 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-lg tracking-wide">NASA</span>
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              <h2 className="text-4xl font-black text-white mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
                  FETCHING COSMIC DATA
                </span>
                <br />
                <span className="text-white">FROM NASA APOD API</span>
              </h2>
              
              <p className="text-blue-300 text-xl font-medium">Connecting to the Universe</p>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="bg-gradient-to-br from-red-900/30 via-black to-orange-900/20"></div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-red-600/30 rounded-full"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                CONNECTION ERROR
              </span>
            </h2>
            
            <p className="text-red-300 text-xl font-medium mb-6">Unable to fetch APOD data</p>
            
            <div className="bg-red-900/30 border border-red-600/30 rounded-2xl p-6 mb-8">
              <p className="text-red-200 text-lg">{error}</p>
            </div>
            
            <button
              onClick={retry}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/50"
            >
              <span className="relative z-10 flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 group-hover:animate-spin" />
                <span>RETRY CONNECTION</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {showImageViewer && apod && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-red-600/50 rounded-full transition-all duration-200"
            >
              <X className="w-8 h-8 text-white" />
            </button>
            <img
              src={apod.hdurl || apod.url}
              alt={apod.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={closeImageViewer}
            />
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
        <div className="bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-lg border-b border-blue-600/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 items-center h-20 relative">
              
              <div className="flex items-center justify-center space-x-4"> </div>

              <div className="text-center">
                <div className="text-xl text-blue-300 font-semibold tracking-widest">
                  ASTRONOMY PICTURE OF THE DAY
                </div>
              </div>

              <div className="flex justify-end items-center space-x-4">
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-gray-800/80 border border-gray-600 text-black placeholder:text-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-red-600 rounded-full ring-2 ring-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-20 relative overflow-hidden">
        <div className="bg-gradient-to-b from-transparent via-black/30 to-black"></div>
        <div 
          className="bg-gradient-to-br from-blue-900/40 via-transparent to-red-900/30"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        ></div>
        
        <div className="overflow-hidden">
          {[...Array(200)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-600/20 to-red-600/20 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4 mb-12">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-lg font-bold tracking-widest text-white">LIVE FROM NASA API</span>
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            </div>

            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black mb-12 leading-none">
              <span className="block bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
                DISCOVER THE COSMOS
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-blue-200 max-w-5xl mx-auto mb-16 leading-relaxed font-light">
              Journey through space and time with NASA's daily collection of breathtaking 
              astronomical images and groundbreaking discoveries from across the universe.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" ref={containerRef}>
        <div className="bg-gradient-to-br from-blue-900/20 via-black/50 to-red-900/20 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
          
          <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-red-900/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Globe className="w-8 h-8 text-white animate-spin" style={{animationDuration: '3s'}} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-3 text-sm text-blue-300">
                    <span className="font-semibold">{new Date(apod?.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span className="font-bold">{viewCount.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`group p-4 rounded-2xl transition-all duration-300 ${
                    isFavorite 
                      ? 'bg-red-600/30 text-red-400 scale-110 shadow-lg shadow-red-600/30' 
                      : 'hover:bg-white/10 text-white/70 hover:text-red-400 hover:scale-110'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current animate-pulse' : ''} group-hover:scale-110 transition-transform`} />
                </button>
                <button 
                  onClick={shareContent}
                  className="p-4 hover:bg-blue-600/20 rounded-2xl transition-all duration-300 hover:scale-110 group"
                >
                  <Share2 className="w-6 h-6 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                </button>
                <button 
                  onClick={downloadImage}
                  className="p-4 hover:bg-blue-600/20 rounded-2xl transition-all duration-300 hover:scale-110 group"
                >
                  <Download className="w-6 h-6 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative group">
            {apod?.mediaType === 'image' || !apod?.mediaType ? (
              <div className="relative overflow-hidden">
                <img
                  ref={imageRef}
                  src={apod.url}
                  alt={apod.title}
                  onLoad={() => setImageLoaded(true)}
                  className="w-full h-auto transition-all duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={openImageViewer}
                />
                
                <div className="bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute top-6 right-6 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  {apod.hdurl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(apod.hdurl, '_blank');
                      }}
                      className="p-4 bg-black/80 backdrop-blur-sm rounded-2xl hover:bg-blue-600/80 transition-all duration-200 border border-blue-600/30 hover:scale-110 group/btn"
                    >
                      <ExternalLink className="w-6 h-6 group-hover/btn:scale-110 transition-transform text-blue-400" />
                    </button>
                  )}
                  
                </div>

                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-blue-900/30 to-red-900/30 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Film className="w-20 h-20 text-white mx-auto mb-4 animate-pulse" />
                  <p className="text-white text-2xl font-bold">Video Content</p>
                  <p className="text-blue-300 text-lg">Click to play mission footage</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
                {apod?.title}
              </h2>
              
              <div className="flex items-center justify-between py-8 border-y border-white/10 bg-gradient-to-r from-blue-900/20 to-red-900/20 rounded-2xl px-6">
                <div className="flex items-center space-x-8">
                  <button 
                    onClick={toggleFavorite}
                    className={`flex items-center space-x-3 transition-colors group ${
                      isFavorite ? 'text-red-400' : 'hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-7 h-7 group-hover:scale-125 transition-transform ${isFavorite ? 'fill-current' : ''}`} />
                    <span className="font-bold text-xl text-white">{likesCount}</span>
                  </button>
                  <button 
                    onClick={shareContent}
                    className="flex items-center space-x-3 hover:text-blue-400 transition-colors group"
                  >
                    <Share2 className="w-7 h-7 group-hover:scale-125 transition-transform" />
                    <span className="font-bold text-xl text-white">{sharesCount}</span>
                  </button>
                  <button className="flex items-center space-x-3 hover:text-blue-400 transition-colors group">
                    <Bookmark className="w-7 h-7 group-hover:scale-125 transition-transform" />
                    <span className="font-bold text-xl text-white">{bookmarksCount}</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-white/60">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">{new Date(apod?.date).toLocaleDateString()}</span>
                  </div>
                  {apod?.copyright && (
                    <div className="flex items-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span className="font-medium">© {apod.copyright}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-lg prose-invert max-w-none">
              <div className="relative">
                <p className={`text-lg leading-relaxed text-gray-300 transition-all duration-500 ${
                  readMore ? '' : 'line-clamp-4'
                }`}>
                  {apod?.explanation}
                </p>
                
                {apod?.explanation && apod.explanation.length > 300 && (
                  <button
                    onClick={() => setReadMore(!readMore)}
                    className="mt-4 flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold group"
                  >
                    <span>{readMore ? 'Show Less' : 'Read More'}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      readMore ? 'rotate-180' : ''
                    }`} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-600/30 group hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-600/30 rounded-2xl flex items-center justify-center group-hover:bg-blue-600/50 transition-colors">
                    <Telescope className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Deep Space</h4>
                    <p className="text-blue-300 text-sm">Exploration Mission</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-900/30 to-red-600/20 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30 group hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-red-600/30 rounded-2xl flex items-center justify-center group-hover:bg-red-600/50 transition-colors">
                    <Award className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Scientific</h4>
                    <p className="text-red-300 text-sm">Discovery Program</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 group hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-purple-600/30 rounded-2xl flex items-center justify-center group-hover:bg-purple-600/50 transition-colors">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Cosmic</h4>
                    <p className="text-purple-300 text-sm">Phenomena Study</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pt-8 border-t border-white/10">
              <div className="flex items-center space-x-8">
                <button
                  onClick={downloadImage}
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/50"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Download className="w-6 h-6 group-hover:animate-bounce" />
                    <span>DOWNLOAD HD</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>

                <button
                  onClick={shareContent}
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/50"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Share2 className="w-6 h-6 group-hover:animate-pulse" />
                    <span>SHARE DISCOVERY</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
              </div>              
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Updated daily at 12:00 UTC</span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white">Your Cosmic Collection</h3>
                <p className="text-blue-300">Saved astronomical wonders</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite, index) => (
                <div key={favorite?.date || index} className="bg-gradient-to-br from-blue-900/20 to-red-900/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden group hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <img
                      src={favorite?.url}
                      alt={favorite?.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-white text-lg mb-2 line-clamp-2">{favorite?.title}</h4>
                    <p className="text-sm text-gray-400">{new Date(favorite?.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-red-600 rounded-2xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">NASA APOD</span>
                <p className="text-sm text-blue-300">Exploring the cosmos, one image at a time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-white/60">
              <span>Powered by NASA Open Data</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>© 2024 NASA/APOD</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
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

export default NasaApodViewer;