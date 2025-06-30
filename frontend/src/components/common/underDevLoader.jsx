const UnderDevelopmentLoader = ({ 
  title = "This Page is Under Development", 
  subtitle = "We're working hard to bring you something amazing!",
  estimatedTime = "Coming Soon"
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="relative mb-12">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-8">
              <div 
                className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"
                style={{ animationDuration: '2s' }}
              ></div>
              <div 
                className="absolute inset-2 rounded-full border-2 border-purple-400 border-b-transparent animate-spin"
                style={{ animationDuration: '3s', animationDirection: 'reverse' }}
              ></div>
              <div 
                className="absolute inset-4 rounded-full border-2 border-cyan-400 border-l-transparent animate-spin"
                style={{ animationDuration: '1.5s' }}
              ></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-float"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 4}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-pulse">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto">
            {subtitle}
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{estimatedTime}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
            {[
              { icon: "🚀", title: "Advanced Features", desc: "Next-gen functionality" },
              { icon: "⚡", title: "Lightning Fast", desc: "Optimized performance" },
              { icon: "🎨", title: "Beautiful UI", desc: "Stunning interface" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  animationFillMode: 'both'
                }}
              >
                <div 
                  className="text-3xl mb-3 animate-bounce" 
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm font-medium">
                Building something extraordinary...
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg 
            className="w-full h-24 text-blue-500/20 animate-wave" 
            preserveAspectRatio="none" 
            viewBox="0 0 1200 120"
          >
            <path d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
          }
        }
        
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%); 
          }
          100% { 
            transform: translateX(100%); 
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes wave {
          0%, 100% { 
            transform: translateX(0%); 
          }
          50% { 
            transform: translateX(-25%); 
          }
        }
      `}</style>
    </div>
  );
};

export default UnderDevelopmentLoader;