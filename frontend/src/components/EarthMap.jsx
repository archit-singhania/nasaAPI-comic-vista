import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchEarthImagery } from '../api/nasaAPI'; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function EarthMap() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [imagery, setImagery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSatelliteImagery = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    setImagery(null);
    
    try {
      const data = await fetchEarthImagery({
        lat: lat,
        lon: lon,
        dim: 0.15
      });
      
      if (!data || !data.url) {
        throw new Error('Invalid response: missing image URL');
      }

      setImagery(data);
      
    } catch (err) {
      console.error('Error fetching satellite imagery:', err);
      
      let errorMessage = err.message || 'An error occurred while fetching satellite imagery';
      
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMessage = 'No satellite imagery available for this exact location. Try clicking on a different area.';
      } else if (errorMessage.includes('500') || errorMessage.includes('Server Error')) {
        errorMessage = 'NASA API is currently unavailable. Please try again later.';
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Make sure your backend is running.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMapClick = useCallback((latlng) => {
    const { lat, lng } = latlng;
    setSelectedLocation({ lat, lng });
    fetchSatelliteImagery(lat, lng);
  }, [fetchSatelliteImagery]);

  const testLocation = useCallback((lat, lng, name) => {
    setSelectedLocation({ lat, lng });
    fetchSatelliteImagery(lat, lng);
  }, [fetchSatelliteImagery]);

  const testBackendConnection = useCallback(async () => {
    try {
      await fetchEarthImagery({ lat: 1.5, lon: 100.75, dim: 0.15 });
      alert('🚀 Backend connection successful!');
    } catch (error) {
      alert('❌ Backend connection failed. Make sure your server is running.');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        animation: 'fadeInDown 1s ease-out'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #64748b, #475569, #334155, #1e293b, #0f172a)',
          backgroundSize: '400% 400%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'gradient 3s ease infinite',
          marginBottom: '15px',
          textShadow: '0 0 20px rgba(100,116,139,0.3)'
        }}>
          🌍 Earth Satellite Imagery
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(148,163,184,0.9)',
          fontWeight: '300',
          maxWidth: '600px',
          margin: '0 auto',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          Explore high-resolution satellite imagery of Earth from NASA's collection. 
          Click on any location to view detailed satellite images.
        </p>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'rgba(30,41,59,0.95)',
        borderRadius: '30px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(71,85,105,0.3)'
      }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #374151, #1f2937)',
          padding: '30px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            🛰️ Interactive Map
          </h2>
          <p style={{
            fontSize: '0.95rem',
            opacity: '0.8',
            margin: '0'
          }}>
            Click anywhere on Earth to view satellite imagery
          </p>
        </div>

        <div style={{ 
          position: 'relative',
          height: '700px',
          margin: '0',
          background: 'linear-gradient(45deg, #1e293b, #334155)'
        }}>
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ 
              height: '100%', 
              width: '100%',
              borderRadius: '0'
            }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
            
            <MapClickHandler onMapClick={handleMapClick} />
            
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup maxWidth={350} minWidth={300}>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #374151, #1f2937)',
                    borderRadius: '15px',
                    color: 'white',
                    margin: '-10px'
                  }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      marginBottom: '15px',
                      textAlign: 'center'
                    }}>
                      📍 Selected Location
                    </h3>
                    
                    <div style={{
                      background: 'rgba(71,85,105,0.3)',
                      padding: '15px',
                      borderRadius: '10px',
                      marginBottom: '15px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <p style={{ margin: '0', fontSize: '0.9rem' }}>
                        <strong>🌐 Latitude:</strong> {selectedLocation.lat.toFixed(6)}<br/>
                        <strong>🌐 Longitude:</strong> {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                    
                    {loading && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        background: 'rgba(71,85,105,0.3)',
                        borderRadius: '10px',
                        marginBottom: '15px'
                      }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          border: '3px solid rgba(148,163,184,0.3)',
                          borderTop: '3px solid #94a3b8',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '15px'
                        }}></div>
                        <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                          🛰️ Fetching satellite imagery...
                        </span>
                      </div>
                    )}
                    
                    {error && (
                      <div style={{
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '15px',
                        textAlign: 'center'
                      }}>
                        <strong>⚠️ Error:</strong> {error}
                        <button 
                          onClick={testBackendConnection}
                          style={{
                            display: 'block',
                            margin: '10px auto 0',
                            padding: '8px 16px',
                            background: 'rgba(71,85,105,0.3)',
                            border: 'none',
                            borderRadius: '20px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = 'rgba(71,85,105,0.5)'}
                          onMouseOut={(e) => e.target.style.background = 'rgba(71,85,105,0.3)'}
                        >
                          🔧 Test Connection
                        </button>
                      </div>
                    )}
                    
                    {imagery && !loading && !error && (
                      <div>
                        <img 
                          src={imagery.url} 
                          alt="Satellite imagery"
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            marginBottom: '15px',
                            border: '3px solid rgba(71,85,105,0.3)'
                          }}
                          onError={() => setError('Failed to load satellite image')}
                          crossOrigin="anonymous"
                        />
                        <div style={{
                          background: 'rgba(71,85,105,0.3)',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem'
                        }}>
                          <p style={{ margin: '5px 0' }}>
                            <strong>📅 Date:</strong> {imagery.date || 'Not specified'}
                          </p>
                          <a 
                            href={imagery.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: '#60a5fa',
                              textDecoration: 'none',
                              fontWeight: '600',
                              display: 'inline-block',
                              marginTop: '5px'
                            }}
                          >
                            🔍 View Full Resolution
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #374151, #1f2937)',
          padding: '40px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0'
            }}>
              🎮 Controls
            </h3>
            <button 
              onClick={testBackendConnection}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 6px 15px rgba(220,38,38,0.3)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(220,38,38,0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 15px rgba(220,38,38,0.3)';
              }}
            >
              🚀 Test Backend
            </button>
          </div>

          <div style={{
            background: 'rgba(71,85,105,0.3)',
            padding: '25px',
            borderRadius: '20px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <h4 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              📋 How to use:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              fontSize: '1rem'
            }}>
              <div>🖱️ Click anywhere on the map to select a location</div>
              <div>🛰️ Satellite imagery will be fetched automatically</div>
              <div>📍 Click on the marker to view the imagery popup</div>
              <div>🔍 Use mouse wheel to zoom, drag to pan around</div>
            </div>
          </div>
          
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '500',
              marginBottom: '15px'
            }}>
              🌟 Popular locations:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <button 
                onClick={() => testLocation(1.5, 100.75, 'Singapore')}
                style={{
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(71,85,105,0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🏙️ Singapore
              </button>
              <button 
                onClick={() => testLocation(53.3498, -6.2603, 'Dublin')}
                style={{
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(5,150,105,0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🍀 Dublin
              </button>
              <button 
                onClick={() => testLocation(40.7128, -74.0060, 'New York')}
                style={{
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(124,58,237,0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🗽 New York
              </button>
              <button 
                onClick={() => testLocation(34.0522, -118.2437, 'Los Angeles')}
                style={{
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(220,38,38,0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🌴 Los Angeles
              </button>
              <button 
                onClick={() => testLocation(51.5074, -0.1278, 'London')}
                style={{
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(30,64,175,0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🏰 London
              </button>
            </div>
          </div>
        </div>

        {selectedLocation && (
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            padding: '30px',
            color: 'white'
          }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '600',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              📊 Mission Status
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: 'rgba(71,85,105,0.3)',
                padding: '20px',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)'
              }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>🎯 Target Coordinates</h4>
                <p style={{ margin: '0', fontSize: '1rem' }}>
                  <strong>Lat:</strong> {selectedLocation.lat.toFixed(6)}<br/>
                  <strong>Lng:</strong> {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              
              {imagery && (
                <div style={{
                  background: 'rgba(71,85,105,0.3)',
                  padding: '20px',
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>📡 Satellite Data</h4>
                  <p style={{ margin: '0', fontSize: '1rem' }}>
                    <strong>Date:</strong> {imagery.date || 'Not available'}<br/>
                    <strong>Status:</strong> {loading ? '🔄 Loading...' : error ? '❌ Error' : '✅ Ready'}
                  </p>
                  {imagery.url && (
                    <a 
                      href={imagery.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#60a5fa',
                        textDecoration: 'none',
                        fontWeight: '600',
                        display: 'inline-block',
                        marginTop: '10px',
                        padding: '8px 16px',
                        background: 'rgba(71,85,105,0.3)',
                        borderRadius: '20px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🔍 View Full Resolution
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {error && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <strong>🚨 Mission Alert:</strong> {error}
                <div style={{ marginTop: '10px', fontSize: '0.9rem', opacity: '0.9' }}>
                  <strong>Using API function:</strong> fetchEarthImagery
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '40px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #374151, #1f2937)',
          padding: '40px',
          borderRadius: '25px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '12px' }}>
            High Resolution Imagery
          </h3>
          <p style={{ fontSize: '0.95rem', opacity: '0.8', lineHeight: '1.5' }}>
            Access detailed satellite imagery with incredible clarity and precision
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #374151, #1f2937)',
          padding: '40px',
          borderRadius: '25px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚡</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '12px' }}>
            Interactive Exploration
          </h3>
          <p style={{ fontSize: '0.95rem', opacity: '0.8', lineHeight: '1.5' }}>
            Click anywhere on the map for instant access to satellite data
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #374151, #1f2937)',
          padding: '40px',
          borderRadius: '25px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌍</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '12px' }}>
            NASA Data Source
          </h3>
          <p style={{ fontSize: '0.95rem', opacity: '0.8', lineHeight: '1.5' }}>
            Powered by NASA's comprehensive satellite imagery database
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function Earth() {
  return <EarthMap />;
}