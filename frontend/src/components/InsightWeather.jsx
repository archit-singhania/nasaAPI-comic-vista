import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchInsight } from '../api/nasaAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function InsightWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [selectedSol, setSelectedSol] = useState(null);
  const [tempUnit, setTempUnit] = useState('C'); 
  const [pressureUnit, setPressureUnit] = useState('Pa');
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('current'); 
  const [chartType, setChartType] = useState('temperature'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSols, setFilteredSols] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedSolsForCompare, setSelectedSolsForCompare] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  const processRawInsightData = useCallback((rawData) => {
    const sols = [];
    const solKeys = rawData.sol_keys || [];
    
    solKeys.forEach(solKey => {
      const solData = rawData[solKey];
      if (solData && typeof solData === 'object') {
        sols.push({
          sol: parseInt(solKey),
          earth_date: solData.First_UTC || solData.Last_UTC || null,
          season: solData.Season || 'Unknown',
          temperature: {
            average: solData.AT?.av || null,
            minimum: solData.AT?.mn || null,
            maximum: solData.AT?.mx || null,
          },
          pressure: {
            average: solData.PRE?.av || null,
            minimum: solData.PRE?.mn || null,
            maximum: solData.PRE?.mx || null,
          },
          wind: {
            speed: {
              average: solData.HWS?.av || null,
              minimum: solData.HWS?.mn || null,
              maximum: solData.HWS?.mx || null,
            },
            direction: {
              most_common: solData.WD?.most_common?.compass_point || null,
              most_common_degrees: solData.WD?.most_common?.compass_degrees || null,
              compass_rose: solData.WD?.compass_rose || null
            }
          },
          data_quality: {
            temperature_samples: solData.AT?.ct || 0,
            pressure_samples: solData.PRE?.ct || 0,
            wind_samples: solData.HWS?.ct || 0
          }
        });
      }
    });

    sols.sort((a, b) => b.sol - a.sol);

    return {
      sols: sols,
      metadata: {
        total_sols: sols.length,
        latest_sol: sols.length > 0 ? sols[0].sol : null,
        oldest_sol: sols.length > 0 ? sols[sols.length - 1].sol : null,
        validity_checks: rawData.validity_checks || null
      },
      processed_at: new Date().toISOString()
    };
  }, []);

  const loadWeatherData = useCallback(async () => {
    try {
      setError('');
      const response = await fetchInsight();
      const data = response?.data || response;
      let processedData = data;
      if (data && !data.sols && data.sol_keys) {
        processedData = processRawInsightData(data);
      }
      setWeatherData(processedData);
      if (processedData?.sols && processedData.sols.length > 0) {
        setSelectedSol(processedData.sols[0]);
      }
    } catch (err) {
      setError(`Failed to load weather data: ${err.message}`);
    }
  }, [processRawInsightData]);

  const processedSols = useMemo(() => {
    if (!weatherData?.sols) return [];
    return searchTerm ? filteredSols : weatherData.sols;
  }, [weatherData?.sols, searchTerm, filteredSols]);

  const filterSols = useCallback(() => {
    if (!weatherData?.sols) return [];
    
    return weatherData.sols.filter(sol => {
      const searchLower = searchTerm.toLowerCase();
      const dateMatch = sol.earth_date && sol.earth_date.toLowerCase().includes(searchLower);
      const solMatch = sol.sol.toString().includes(searchTerm);
      const seasonMatch = sol.season && sol.season.toLowerCase().includes(searchLower);
      
      return dateMatch || solMatch || seasonMatch;
    });
  }, [weatherData?.sols, searchTerm]);

  const prepareChartData = useCallback(() => {
    if (!weatherData?.sols) return [];
    
    return weatherData.sols.slice(0, 30).reverse().map(sol => ({
      sol: sol.sol,
      date: sol.earth_date ? new Date(sol.earth_date).toLocaleDateString() : `Sol ${sol.sol}`,
      temperature: sol.temperature.average,
      pressure: sol.pressure.average ? sol.pressure.average / 100 : null, 
      windSpeed: sol.wind.speed.average,
      tempMin: sol.temperature.minimum,
      tempMax: sol.temperature.maximum
    }));
  }, [weatherData?.sols]);

  const toggleFavorite = useCallback((sol) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(sol.sol);
      if (isFavorite) {
        return prev.filter(s => s !== sol.sol);
      } else {
        return [...prev, sol.sol];
      }
    });
  }, []);

  const toggleCompareSelection = useCallback((sol) => {
    setSelectedSolsForCompare(prev => {
      const isSelected = prev.find(s => s.sol === sol.sol);
      if (isSelected) {
        return prev.filter(s => s.sol !== sol.sol);
      } else if (prev.length < 3) { 
        return [...prev, sol];
      }
      return prev;
    });
  }, []);

  const isSolSelectedForCompare = useCallback((sol) => {
    return selectedSolsForCompare.find(s => s.sol === sol.sol);
  }, [selectedSolsForCompare]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            loadWeatherData();
            break;
          case 'f':
            e.preventDefault();
            document.querySelector('input[placeholder*="Search"]')?.focus();
            break;
          case '1':
            e.preventDefault();
            setViewMode('current');
            break;
          case '2':
            e.preventDefault();
            setViewMode('chart');
            break;
          case '3':
            e.preventDefault();
            setViewMode('compare');
            break;
        }
      }
    };

  window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loadWeatherData]);

  useEffect(() => {
    setFilteredSols(filterSols());
  }, [filterSols]);

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const convertTemperature = (celsius) => {
    if (celsius === null || celsius === undefined) return 'N/A';
    if (tempUnit === 'F') {
      return `${((celsius * 9/5) + 32).toFixed(1)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  };

  const convertPressure = (pascals) => {
    if (pascals === null || pascals === undefined) return 'N/A';
    if (pressureUnit === 'hPa') {
      return `${(pascals / 100).toFixed(1)} hPa`;
    }
    return `${pascals.toFixed(0)} Pa`;
  };

  const formatWindSpeed = (speed) => {
    if (speed === null || speed === undefined) return 'N/A';
    return `${speed.toFixed(1)} m/s`;
  };

  const getWindDirection = (direction) => {
    if (!direction || !direction.most_common) return 'N/A';
    return direction.most_common;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="border border-red-300 rounded-lg p-6 max-w-md mx-auto" style={{ backgroundColor: '#FEF2F2' }}>
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="#B91C1C" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold" style={{ color: '#7F1D1D' }}>⚠️ Error Loading Weather Data</h3>
          </div>
          <p className="mb-4" style={{ color: '#B91C1C' }}>{error}</p>
          <button 
            onClick={loadWeatherData}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{ backgroundColor: '#B91C1C', color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7F1D1D'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#B91C1C'}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.sols || weatherData.sols.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>🌫️ No Weather Data Available</h3>
          <p className="mb-4" style={{ color: '#6B7280' }}>
            The InSight mission ended in December 2022. The API may have limited or no historical data available.
          </p>
          <div className="text-sm rounded-lg p-3" style={{ color: '#6B7280', backgroundColor: '#F9FAFB' }}>
            <p><strong>📊 API Response:</strong></p>
            <p style={{ color: '#4B5563' }}>Total sols: {weatherData?.metadata?.total_sols || 0}</p>
            <p style={{ color: '#4B5563' }}>Latest sol: {weatherData?.metadata?.latest_sol || 'None'}</p>
            <p style={{ color: '#4B5563' }}>Last processed: {weatherData?.processed_at ? new Date(weatherData.processed_at).toLocaleString() : 'Unknown'}</p>
          </div>
          <button 
            onClick={loadWeatherData}
            className="mt-4 px-4 py-2 rounded font-medium transition-colors"
            style={{ backgroundColor: '#7C2D12', color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5B1A0F'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#7C2D12'}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const currentSol = selectedSol || weatherData.sols[0];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden border rounded-2xl p-8 shadow-2xl" style={{ 
        background: 'linear-gradient(135deg, #7C2D12 0%, #92400E 25%, #B45309 75%, #D97706 100%)',
        borderColor: '#EA580C'
      }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(124, 45, 18, 0.1), rgba(217, 119, 6, 0.1))' }}></div>
        <div className="relative flex items-center justify-center space-x-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl" style={{ 
            background: 'linear-gradient(135deg, #DC2626, #7C2D12)' 
          }}>
            <span className="text-4xl">🚀</span>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#FEF3C7' }}>
              🌌 NASA InSight Mars Mission
            </h1>
            <p className="text-lg font-medium" style={{ color: '#FDE68A' }}>
              ⭐ Historical weather data from Mars • Mission completed December 2022
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(234, 88, 12, 0.3), rgba(124, 45, 18, 0.2))' }}></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full blur-xl" style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3), rgba(217, 119, 6, 0.2))' }}></div>
      </div>

      <div className="border rounded-2xl p-6 shadow-xl" style={{ 
        backgroundColor: '#1C1917',
        borderColor: '#A16207'
      }}>
        <div className="flex flex-wrap gap-6 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-semibold" style={{ color: '#FBBF24' }}>🌅 Sol:</span>
              <select
                value={currentSol?.sol || ''}
                onChange={(e) => {
                  const sol = weatherData.sols.find(s => s.sol === parseInt(e.target.value));
                  setSelectedSol(sol);
                }}
                className="px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300"
                style={{ 
                  backgroundColor: '#0C0A09',
                  borderColor: '#A16207',
                  color: '#FBBF24'
                }}
              >
                {weatherData.sols.map(sol => (
                  <option key={sol.sol} value={sol.sol} style={{ backgroundColor: '#1C1917', color: '#FBBF24' }}>
                    Sol {sol.sol} {sol.earth_date ? `(${new Date(sol.earth_date).toLocaleDateString()})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #DC2626, #7C2D12)',
                color: '#FEF3C7'
              }}
              title="Keyboard Shortcuts"
            >
              💻 Help & Shortcuts
            </button>

            {showHelp && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div 
                  className="absolute inset-0 backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                  onClick={() => setShowHelp(false)}
                />
                <div className="relative z-10 border rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4" style={{ 
                  background: 'linear-gradient(135deg, #1C1917, #0C0A09)',
                  borderColor: '#A16207'
                }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: '#FBBF24' }}>⌨️ Keyboard Shortcuts</h3>
                    <button 
                      onClick={() => setShowHelp(false)}
                      className="w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#FCA5A5' }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 justify-center">
                      <div className="flex items-center gap-2 rounded-lg p-3" style={{ backgroundColor: 'rgba(12, 10, 9, 0.4)' }}>
                        <span className="font-mono text-sm font-bold px-2 py-1 rounded" style={{ 
                          color: '#FBBF24',
                          backgroundColor: 'rgba(161, 98, 7, 0.2)'
                        }}>
                          Ctrl/Cmd + R
                        </span>
                        <span style={{ color: '#FBBF24' }}>🔄 Refresh data</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg p-3" style={{ backgroundColor: 'rgba(12, 10, 9, 0.4)' }}>
                        <span className="font-mono text-sm font-bold px-2 py-1 rounded" style={{ 
                          color: '#FBBF24',
                          backgroundColor: 'rgba(161, 98, 7, 0.2)'
                        }}>
                          Ctrl/Cmd + F
                        </span>
                        <span style={{ color: '#FBBF24' }}>🔍 Focus search</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <div className="flex items-center gap-2 rounded-lg p-3" style={{ backgroundColor: 'rgba(12, 10, 9, 0.4)' }}>
                        <span className="font-mono text-sm font-bold px-2 py-1 rounded" style={{ 
                          color: '#FBBF24',
                          backgroundColor: 'rgba(161, 98, 7, 0.2)'
                        }}>
                          Ctrl/Cmd + 1
                        </span>
                        <span style={{ color: '#FBBF24' }}>🏠 Current view</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg p-3" style={{ backgroundColor: 'rgba(12, 10, 9, 0.4)' }}>
                        <span className="font-mono text-sm font-bold px-2 py-1 rounded" style={{ 
                          color: '#FBBF24',
                          backgroundColor: 'rgba(161, 98, 7, 0.2)'
                        }}>
                          Ctrl/Cmd + 2
                        </span>
                        <span style={{ color: '#FBBF24' }}>📊 Chart view</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <div className="flex items-center gap-2 rounded-lg p-3" style={{ backgroundColor: 'rgba(12, 10, 9, 0.4)' }}>
                        <span className="font-mono text-sm font-bold px-2 py-1 rounded" style={{ 
                          color: '#FBBF24',
                          backgroundColor: 'rgba(161, 98, 7, 0.2)'
                        }}>
                          Ctrl/Cmd + 3
                        </span>
                        <span style={{ color: '#FBBF24' }}>⚖️ Compare view</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-6 items-center">
            <div className="flex gap-3 items-center">
              <span className="text-sm font-semibold" style={{ color: '#FBBF24' }}>🌡️ Temperature:</span>
              <button
                onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                style={{
                  background: tempUnit === 'C' 
                    ? 'linear-gradient(135deg, #1E40AF, #0E7490)' 
                    : 'linear-gradient(135deg, #0C0A09, #1C1917)',
                  color: tempUnit === 'C' ? 'white' : '#FBBF24',
                  border: tempUnit === 'C' ? 'none' : '1px solid #A16207'
                }}
              >
                <span style={{ color: '#EF4444', textDecoration: 'underline' }}>°{tempUnit}</span>
              </button>
            </div>

            <div className="flex gap-3 items-center">
              <span className="text-sm font-semibold" style={{ color: '#FBBF24' }}>📊 Pressure:</span>
              <button
                onClick={() => setPressureUnit(pressureUnit === 'Pa' ? 'hPa' : 'Pa')}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                style={{
                  background: pressureUnit === 'Pa' 
                    ? 'linear-gradient(135deg, #059669, #047857)' 
                    : 'linear-gradient(135deg, #0C0A09, #1C1917)',
                  color: pressureUnit === 'Pa' ? 'white' : '#FBBF24',
                  border: pressureUnit === 'Pa' ? 'none' : '1px solid #A16207'
                }}
              >
                <span style={{ color: '#EF4444', textDecoration: 'underline' }}>{pressureUnit}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-6 shadow-xl" style={{ 
        backgroundColor: '#1C1917',
        borderColor: '#A16207'
      }}>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative group">
              <input
                type="text"
                placeholder="🔍 Search sols, dates, or seasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-xl transition-all duration-300 min-w-72"
                style={{ 
                  backgroundColor: '#0C0A09',
                  borderColor: '#A16207',
                  color: '#D97706',
                  fontSize: '14px'
                }}
              />
              <svg
                className="w-4 h-4 absolute left-3 top-3 transition-colors duration-300"
                style={{ transform: 'scale(0.6)', color: '#A16207' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-4 py-2 border rounded-xl transition-all duration-300"
              style={{ 
                backgroundColor: '#0C0A09',
                borderColor: '#A16207',
                color: '#D97706',
                fontSize: '14px'
              }}
            >
              <option value="current" style={{ backgroundColor: '#1C1917', color: '#D97706' }}>🏠 Current Weather</option>
              <option value="chart" style={{ backgroundColor: '#1C1917', color: '#D97706' }}>📊 Data Visualization</option>
              <option value="compare" style={{ backgroundColor: '#1C1917', color: '#D97706' }}>⚖️ Compare Sols</option>
              <option value="favorites" style={{ backgroundColor: '#1C1917', color: '#D97706' }}>⭐ Favorites</option>
            </select>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-4 px-4 py-2 border rounded-lg" style={{ 
            backgroundColor: 'rgba(217, 119, 6, 0.2)',
            borderColor: 'rgba(161, 98, 7, 0.3)'
          }}>
            <span className="font-medium" style={{ color: '#FBBF24' }}>
              🎯 Found {filteredSols.length} matching sols
            </span>
          </div>
        )}
      </div>

      {viewMode === 'chart' && weatherData?.sols && weatherData.sols.length > 0 && (
        <div className="shadow-2xl rounded-2xl p-8 border" style={{ 
          background: 'linear-gradient(135deg, #1F2937, #111827)',
          borderColor: '#6B7280'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: '#F3F4F6' }}>📈 Weather Data Visualization</h3>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 border rounded-lg transition-all"
              style={{ 
                backgroundColor: '#111827',
                borderColor: '#6B7280',
                color: '#F3F4F6'
              }}
            >
              <option value="temperature" style={{ backgroundColor: '#1F2937' }}>🌡️ Temperature Trends</option>
              <option value="pressure" style={{ backgroundColor: '#1F2937' }}>📊 Pressure Trends</option>
              <option value="wind" style={{ backgroundColor: '#1F2937' }}>💨 Wind Speed Trends</option>
              <option value="all" style={{ backgroundColor: '#1F2937' }}>🌍 All Metrics</option>
            </select>
          </div>
          
          <div className="h-96 p-4 rounded-xl" style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #6B7280',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Legend />
                
                {(chartType === 'temperature' || chartType === 'all') && (
                  <>
                    <Line type="monotone" dataKey="temperature" stroke="#DC2626" strokeWidth={3} name="🌡️ Avg Temp (°C)" />
                    <Line type="monotone" dataKey="tempMin" stroke="#2563EB" strokeWidth={2} strokeDasharray="5 5" name="❄️ Min Temp (°C)" />
                    <Line type="monotone" dataKey="tempMax" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="🔥 Max Temp (°C)" />
                  </>
                )}
                
                {(chartType === 'pressure' || chartType === 'all') && (
                  <Line type="monotone" dataKey="pressure" stroke="#059669" strokeWidth={3} name="📊 Pressure (hPa)" />
                )}
                
                {(chartType === 'wind' || chartType === 'all') && (
                  <Line type="monotone" dataKey="windSpeed" stroke="#7C3AED" strokeWidth={3} name="💨 Wind Speed (m/s)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {weatherData?.sols && weatherData.sols.length > 0 && (
        <div className="border rounded-2xl p-8 shadow-2xl" style={{ 
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          borderColor: '#B91C1C'
        }}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#FBBF24' }}>
            📊 Mission Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg" style={{ 
              background: 'linear-gradient(135deg, #7F1D1D, #5F1F1F)',
              borderColor: '#DC2626'
            }}>
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#FEF3C7' }}>
                {weatherData.metadata.total_sols}
              </div>
              <div className="text-sm font-medium" style={{ color: '#FCD34D' }}>Total Sols Recorded</div>
            </div>
            
            <div className="border rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg" style={{ 
              background: 'linear-gradient(135deg, #92400E, #B45309)',
              borderColor: '#EA580C'
            }}>
              <div className="text-3xl mb-2">🌅</div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#FEF3C7' }}>
                {weatherData.metadata.latest_sol}
              </div>
              <div className="text-sm font-medium" style={{ color: '#FCD34D' }}>Latest Sol Available</div>
            </div>
            
            <div className="border rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg" style={{ 
              background: 'linear-gradient(135deg, #6B21A8, #7C2D12)',
              borderColor: '#9333EA'
            }}>
              <div className="text-3xl mb-2">🕰️</div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#FEF3C7' }}>
                {weatherData.metadata.oldest_sol}
              </div>
              <div className="text-sm font-medium" style={{ color: '#FCD34D' }}>Oldest Sol Available</div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'current' && currentSol && (
        <div className="border rounded-2xl p-8 shadow-2xl" style={{ 
          background: 'linear-gradient(135deg, #0F172A, #1E293B, #0F172A)',
          borderColor: '#B91C1C'
        }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl" style={{ 
                background: 'linear-gradient(135deg, #DC2626, #7C2D12)' 
              }}>
                <span className="text-2xl">🌅</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: '#FBBF24' }}>
                  Sol {currentSol.sol}
                </h3>
                <p className="text-sm font-medium" style={{ color: '#FCD34D' }}>
                  {currentSol.earth_date ? new Date(currentSol.earth_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Date unavailable'} • Season: {currentSol.season}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => toggleFavorite(currentSol)}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                  favorites.includes(currentSol.sol) 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' 
                    : 'bg-gradient-to-r from-gray-700 to-gray-800'
                }`}
                style={{ 
                  color: favorites.includes(currentSol.sol) ? '#FEF3C7' : '#9CA3AF'
                }}
              >
                {favorites.includes(currentSol.sol) ? '⭐' : '☆'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300" style={{ 
              background: 'linear-gradient(135deg, #7F1D1D, #991B1B, #7F1D1D)',
              borderColor: '#DC2626'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, #FEF3C7, #FCD34D)' 
                  }}>
                    <span className="text-xl">🌡️</span>
                  </div>
                  <h4 className="font-bold text-lg" style={{ color: '#FEF3C7' }}>Temperature</h4>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#FCD34D' }}>Average:</span>
                  <span className="text-xl font-bold" style={{ color: '#FEF3C7' }}>
                    {convertTemperature(currentSol.temperature.average)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#FCD34D' }}>High:</span>
                  <span className="text-lg font-semibold" style={{ color: '#FCA5A5' }}>
                    {convertTemperature(currentSol.temperature.maximum)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#FCD34D' }}>Low:</span>
                  <span className="text-lg font-semibold" style={{ color: '#DBEAFE' }}>
                    {convertTemperature(currentSol.temperature.minimum)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300" style={{ 
              background: 'linear-gradient(135deg, #065F46, #047857, #065F46)',
              borderColor: '#10B981'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' 
                  }}>
                    <span className="text-xl">📊</span>
                  </div>
                  <h4 className="font-bold text-lg" style={{ color: '#D1FAE5' }}>Pressure</h4>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#A7F3D0' }}>Average:</span>
                  <span className="text-xl font-bold" style={{ color: '#D1FAE5' }}>
                    {convertPressure(currentSol.pressure.average)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#A7F3D0' }}>High:</span>
                  <span className="text-lg font-semibold" style={{ color: '#FCA5A5' }}>
                    {convertPressure(currentSol.pressure.maximum)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#A7F3D0' }}>Low:</span>
                  <span className="text-lg font-semibold" style={{ color: '#DBEAFE' }}>
                    {convertPressure(currentSol.pressure.minimum)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300" style={{ 
              background: 'linear-gradient(135deg, #581C87, #6B21A8, #581C87)',
              borderColor: '#A855F7'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, #E9D5FF, #C4B5FD)' 
                  }}>
                    <span className="text-xl">💨</span>
                  </div>
                  <h4 className="font-bold text-lg" style={{ color: '#E9D5FF' }}>Wind</h4>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#C4B5FD' }}>Speed:</span>
                  <span className="text-xl font-bold" style={{ color: '#E9D5FF' }}>
                    {formatWindSpeed(currentSol.wind.speed.average)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#C4B5FD' }}>Direction:</span>
                  <span className="text-lg font-semibold" style={{ color: '#FCA5A5' }}>
                    {getWindDirection(currentSol.wind.direction)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#C4B5FD' }}>Max Speed:</span>
                  <span className="text-lg font-semibold" style={{ color: '#FEF3C7' }}>
                    {formatWindSpeed(currentSol.wind.speed.maximum)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="border rounded-2xl p-6 shadow-xl" style={{ 
              background: 'linear-gradient(135deg, #1E293B, #334155)',
              borderColor: '#64748B'
            }}>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                📋 Detailed Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4" style={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderColor: '#475569'
                  }}>
                    <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
                      🔬 Data Quality Metrics
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: '#94A3B8' }}>Temperature samples:</span>
                        <span style={{ color: '#F1F5F9' }}>{currentSol.data_quality.temperature_samples}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#94A3B8' }}>Pressure samples:</span>
                        <span style={{ color: '#F1F5F9' }}>{currentSol.data_quality.pressure_samples}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#94A3B8' }}>Wind samples:</span>
                        <span style={{ color: '#F1F5F9' }}>{currentSol.data_quality.wind_samples}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4" style={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderColor: '#475569'
                  }}>
                    <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
                      🌪️ Wind Direction Details
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: '#94A3B8' }}>Most common direction:</span>
                        <span style={{ color: '#F1F5F9' }}>{currentSol.wind.direction.most_common || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#94A3B8' }}>Degrees:</span>
                        <span style={{ color: '#F1F5F9' }}>
                          {currentSol.wind.direction.most_common_degrees ? 
                            `${currentSol.wind.direction.most_common_degrees}°` : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'compare' && (
        <div className="space-y-6">
          <div className="border rounded-2xl p-6 shadow-xl" style={{ 
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            borderColor: '#B91C1C'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: '#FBBF24' }}>
                ⚖️ Compare Sols
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium" style={{ color: '#FCD34D' }}>
                  Selected: {selectedSolsForCompare.length}/3
                </span>
                <button
                  onClick={() => setSelectedSolsForCompare([])}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    background: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
                    color: '#FEF3C7'
                  }}
                >
                  🗑️ Clear Selection
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-64 overflow-y-auto">
              {processedSols.slice(0, 20).map(sol => (
                <div
                  key={sol.sol}
                  onClick={() => toggleCompareSelection(sol)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isSolSelectedForCompare(sol) ? 'ring-2' : ''
                  }`}
                  style={{ 
                    background: isSolSelectedForCompare(sol) 
                      ? 'linear-gradient(135deg, #059669, #047857)' 
                      : 'linear-gradient(135deg, #374151, #4B5563)',
                    borderColor: isSolSelectedForCompare(sol) ? '#10B981' : '#6B7280',
                    ringColor: isSolSelectedForCompare(sol) ? '#10B981' : 'transparent'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold" style={{ color: '#F3F4F6' }}>Sol {sol.sol}</div>
                      <div className="text-sm" style={{ color: '#D1D5DB' }}>
                        {sol.earth_date ? new Date(sol.earth_date).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    <div className="text-xl">
                      {isSolSelectedForCompare(sol) ? '✅' : '⭕'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSolsForCompare.length > 1 && (
              <div className="border rounded-2xl p-6 shadow-xl" style={{ 
                background: 'linear-gradient(135deg, #1E293B, #334155)',
                borderColor: '#64748B'
              }}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                  📊 Comparison Results
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '2px solid #475569' }}>
                        <th className="text-left py-3 px-4" style={{ color: '#CBD5E1' }}>Sol</th>
                        <th className="text-left py-3 px-4" style={{ color: '#CBD5E1' }}>🌡️ Avg Temp</th>
                        <th className="text-left py-3 px-4" style={{ color: '#CBD5E1' }}>📊 Avg Pressure</th>
                        <th className="text-left py-3 px-4" style={{ color: '#CBD5E1' }}>💨 Wind Speed</th>
                        <th className="text-left py-3 px-4" style={{ color: '#CBD5E1' }}>🍂 Season</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSolsForCompare.map((sol, index) => (
                        <tr key={sol.sol} style={{ 
                          borderBottom: index < selectedSolsForCompare.length - 1 ? '1px solid #475569' : 'none'
                        }}>
                          <td className="py-3 px-4 font-semibold" style={{ color: '#F1F5F9' }}>
                            Sol {sol.sol}
                          </td>
                          <td className="py-3 px-4" style={{ color: '#F1F5F9' }}>
                            {convertTemperature(sol.temperature.average)}
                          </td>
                          <td className="py-3 px-4" style={{ color: '#F1F5F9' }}>
                            {convertPressure(sol.pressure.average)}
                          </td>
                          <td className="py-3 px-4" style={{ color: '#F1F5F9' }}>
                            {formatWindSpeed(sol.wind.speed.average)}
                          </td>
                          <td className="py-3 px-4" style={{ color: '#F1F5F9' }}>
                            {sol.season}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'favorites' && (
        <div className="border rounded-2xl p-6 shadow-xl" style={{ 
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          borderColor: '#B91C1C'
        }}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#FBBF24' }}>
            ⭐ Favorite Sols
          </h3>
          
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h4 className="text-lg font-semibold mb-2" style={{ color: '#FCD34D' }}>
                No favorites yet
              </h4>
              <p style={{ color: '#94A3B8' }}>
                Click the star icon on any sol to add it to your favorites!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weatherData.sols.filter(sol => favorites.includes(sol.sol)).map(sol => (
                <div key={sol.sol} className="border rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300" style={{ 
                  background: 'linear-gradient(135deg, #7C2D12, #92400E)',
                  borderColor: '#EA580C'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg" style={{ color: '#FEF3C7' }}>
                      Sol {sol.sol}
                    </h4>
                    <button
                      onClick={() => toggleFavorite(sol)}
                      className="text-2xl transition-transform duration-300 hover:scale-125"
                    >
                      ⭐
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: '#FCD34D' }}>Date:</span>
                      <span style={{ color: '#FEF3C7' }}>
                        {sol.earth_date ? new Date(sol.earth_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#FCD34D' }}>Avg Temp:</span>
                      <span style={{ color: '#FEF3C7' }}>
                        {convertTemperature(sol.temperature.average)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#FCD34D' }}>Season:</span>
                      <span style={{ color: '#FEF3C7' }}>{sol.season}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedSol(sol);
                      setViewMode('current');
                    }}
                    className="w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
                      color: 'white'
                    }}
                  >
                    🔍 View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border rounded-2xl p-6 text-center shadow-xl" style={{ 
        background: 'linear-gradient(135deg, #0F172A, #1E293B)',
        borderColor: '#64748B'
      }}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
            background: 'linear-gradient(135deg, #DC2626, #7C2D12)' 
          }}>
            <span className="text-lg">🚀</span>
          </div>
          <h4 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>
            NASA InSight Mars Weather Data
          </h4>
        </div>
        <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>
          Data from NASA's InSight Mars lander mission (2018-2022)
        </p>
      </div>
    </div>
  );
}