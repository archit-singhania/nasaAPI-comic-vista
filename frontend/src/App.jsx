import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Apod from './pages/Apod';
import MarsRover from './pages/MarsRover';
import Asteroids from './pages/Asteroids';
import Epic from './pages/Epic';
import Earth from './pages/Earth';
import Donki from './pages/Donki';
import Eonet from './pages/Eonet';
import Insight from './pages/Insight';
import Exoplanet from './pages/Exoplanet';
import Osdr from './pages/Osdr';
import MediaLibrary from './pages/MediaLibrary';
import TechTransfer from './pages/TechTransfer';
import Tle from './pages/Tle';
import Wmts from './pages/Wmts';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary';
import 'leaflet/dist/leaflet.css';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <AnimatePresence mode="wait">
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen relative">
            <div className="fixed inset-0 z-0">
              <div className="w-full h-full bg-gradient-to-br from-black via-gray-900 to-black" />
            </div>
            <Navbar />

            <main className="relative z-10">
              <div className="fixed inset-0 pointer-events-none z-5">
                <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div 
                  className="absolute inset-0 opacity-5" 
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }}
                />
              </div>

              <div className="relative z-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  
                  <Route path="/apod" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Apod />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/marsrover" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <MarsRover />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/asteroids" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Asteroids />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/epic" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Epic />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/earth" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Earth />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/donki" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Donki />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/eonet" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Eonet />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/insight" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Insight />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/exoplanet" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Exoplanet />
                      </div>
                    </div>
                  } />

                  <Route path="/osdr" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Osdr />
                      </div>
                    </div>
                  } />

                  <Route path="/media" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <MediaLibrary />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/techtransfer" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <TechTransfer />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/tle" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Tle />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/wmts" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <Wmts />
                      </div>
                    </div>
                  } />
                  
                  <Route path="*" element={
                    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                      <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl min-h-[calc(100vh-8rem)] p-8">
                        <NotFound />
                      </div>
                    </div>
                  } />
                </Routes>
              </div>
            </main>
            <div className="fixed inset-0 pointer-events-none z-40">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/0 to-pink-900/0 transition-all duration-1000" />
            </div>
          </div>
        </ErrorBoundary>
      </Router>
    </AnimatePresence>
  );
}

export default App;