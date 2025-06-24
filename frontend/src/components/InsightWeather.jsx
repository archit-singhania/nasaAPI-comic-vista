import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchInsight } from '../api/nasaAPI';
import Loader from './common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function InsightWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [compareMode, setCompareMode] = useState(false);
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
      setLoading(true);
      setError('');
      
      console.log('📡 Fetching InSight weather data...');
      const response = await fetchInsight();
      const data = response?.data || response;
      
      console.log('🌡️ Weather data received:', data);
      
      let processedData = data;
      
      if (data && !data.sols && data.sol_keys) {
        processedData = processRawInsightData(data);
      }
      
      setWeatherData(processedData);
      
      if (processedData?.sols && processedData.sols.length > 0) {
        setSelectedSol(processedData.sols[0]);
      }
    } catch (err) {
      console.error('❌ InSight Weather Error:', err);
      setError(`Failed to load weather data: ${err.message}`);
    } finally {
      setLoading(false);
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

  const getSeasonIcon = (season) => {
    switch (season?.toLowerCase()) {
      case 'spring':
        return '🌱';
      case 'summer':
        return '☀️';
      case 'autumn':
      case 'fall':
        return '🍂';
      case 'winter':
        return '❄️';
      default:
        return '🪐';
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp === null || temp === undefined) return 'text-gray-500';
    if (temp < -80) return 'text-blue-600';
    if (temp < -60) return 'text-blue-500';
    if (temp < -40) return 'text-cyan-500';
    if (temp < -20) return 'text-green-500';
    if (temp < 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Weather Data</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadWeatherData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.sols || weatherData.sols.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Weather Data Available</h3>
          <p className="text-gray-600 mb-4">
            The InSight mission ended in December 2022. The API may have limited or no historical data available.
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p><strong>API Response:</strong></p>
            <p>Total sols: {weatherData?.metadata?.total_sols || 0}</p>
            <p>Latest sol: {weatherData?.metadata?.latest_sol || 'None'}</p>
            <p>Last processed: {weatherData?.processed_at ? new Date(weatherData.processed_at).toLocaleString() : 'Unknown'}</p>
          </div>
          <button 
            onClick={loadWeatherData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentSol = selectedSol || weatherData.sols[0];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">🚀</span>
          <div className="text-center">
            <h3 className="font-semibold">NASA InSight Mars Mission</h3>
            <p className="text-sm opacity-90">Historical weather data from Mars • Mission completed December 2022</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Sol:</span>
            <select
              value={currentSol?.sol || ''}
              onChange={(e) => {
                const sol = weatherData.sols.find(s => s.sol === parseInt(e.target.value));
                setSelectedSol(sol);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {weatherData.sols.map(sol => (
                <option key={sol.sol} value={sol.sol}>
                  Sol {sol.sol} {sol.earth_date ? `(${new Date(sol.earth_date).toLocaleDateString()})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Keyboard Shortcuts"
            >
              ⌨️ Help
            </button>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Temperature:</span>
              <button
                onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  tempUnit === 'C' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                °{tempUnit}
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Pressure:</span>
              <button
                onClick={() => setPressureUnit(pressureUnit === 'Pa' ? 'hPa' : 'Pa')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  pressureUnit === 'Pa' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pressureUnit}
              </button>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sols, dates, or seasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="current">Current Weather</option>
              <option value="chart">Data Visualization</option>
              <option value="compare">Compare Sols</option>
              <option value="favorites">Favorites</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                compareMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {compareMode ? 'Exit Compare' : 'Compare Mode'}
            </button>
            
            <button
              onClick={loadWeatherData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredSols.length} matching sols
          </div>
        )}
      </div>

      {viewMode === 'chart' && weatherData?.sols && weatherData.sols.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Weather Data Visualization</h3>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="temperature">Temperature Trends</option>
              <option value="pressure">Pressure Trends</option>
              <option value="wind">Wind Speed Trends</option>
              <option value="all">All Metrics</option>
            </select>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                
                {(chartType === 'temperature' || chartType === 'all') && (
                  <>
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Avg Temp (°C)" />
                    <Line type="monotone" dataKey="tempMin" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" name="Min Temp (°C)" />
                    <Line type="monotone" dataKey="tempMax" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="Max Temp (°C)" />
                  </>
                )}
                
                {(chartType === 'pressure' || chartType === 'all') && (
                  <Line type="monotone" dataKey="pressure" stroke="#10b981" strokeWidth={2} name="Pressure (hPa)" />
                )}
                
                {(chartType === 'wind' || chartType === 'all') && (
                  <Line type="monotone" dataKey="windSpeed" stroke="#8b5cf6" strokeWidth={2} name="Wind Speed (m/s)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'compare' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Compare Sols</h3>
            <div className="text-sm text-gray-600">
              Select up to 3 sols to compare ({selectedSolsForCompare.length}/3)
            </div>
          </div>
          
          {selectedSolsForCompare.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Selected Sols for Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSolsForCompare.map((sol) => (
                  <div key={sol.sol} className="bg-gray-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-blue-800">Sol {sol.sol}</h5>
                      <button
                        onClick={() => toggleCompareSelection(sol)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Date:</strong> {sol.earth_date ? new Date(sol.earth_date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Season:</strong> {sol.season}</p>
                      <p><strong>Avg Temp:</strong> {convertTemperature(sol.temperature.average)}</p>
                      <p><strong>Pressure:</strong> {convertPressure(sol.pressure.average)}</p>
                      <p><strong>Wind:</strong> {formatWindSpeed(sol.wind.speed.average)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {weatherData?.sols && weatherData.sols.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🤖</span>
            <h3 className="text-xl font-semibold text-gray-800">AI Weather Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Temperature Analysis</h4>
              <p className="text-sm text-gray-600">
                {weatherData.sols.length > 0 && weatherData.sols[0].temperature.average !== null
                  ? `Current temperature is ${convertTemperature(weatherData.sols[0].temperature.average)}, which is ${
                      weatherData.sols[0].temperature.average < -70 ? 'extremely cold' : 
                      weatherData.sols[0].temperature.average < -50 ? 'very cold' : 'typical'
                    } for Mars.`
                  : 'No recent temperature data available.'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Seasonal Patterns</h4>
              <p className="text-sm text-gray-600">
                {weatherData.sols.length > 0 
                  ? `Currently in ${weatherData.sols[0].season} season. Mars seasons last about twice as long as Earth seasons.`
                  : 'No seasonal data available.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-3xl">{getSeasonIcon(currentSol.season)}</span>
            <h2 className="text-2xl font-bold text-gray-800">
              Sol {currentSol.sol} Weather
            </h2>
          </div>
          <p className="text-gray-600">
            {currentSol.earth_date ? new Date(currentSol.earth_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Date unavailable'} • Season: {currentSol.season}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Temperature</h3>
              <span className="text-2xl">🌡️</span>
            </div>
            <div className="space-y-2">
              {currentSol.temperature.average !== null ? (
                <>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getTemperatureColor(currentSol.temperature.average)}`}>
                      {convertTemperature(currentSol.temperature.average)}
                    </div>
                    <div className="text-sm text-gray-500">Average</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className={`font-semibold ${getTemperatureColor(currentSol.temperature.minimum)}`}>
                        {convertTemperature(currentSol.temperature.minimum)}
                      </div>
                      <div className="text-gray-500">Low</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${getTemperatureColor(currentSol.temperature.maximum)}`}>
                        {convertTemperature(currentSol.temperature.maximum)}
                      </div>
                      <div className="text-gray-500">High</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">No temperature data available</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Pressure</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-2">
              {currentSol.pressure.average !== null ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {convertPressure(currentSol.pressure.average)}
                    </div>
                    <div className="text-sm text-gray-500">Average</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-500">
                        {convertPressure(currentSol.pressure.minimum)}
                      </div><div className="text-gray-500">Low</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-500">
                        {convertPressure(currentSol.pressure.maximum)}
                      </div>
                      <div className="text-gray-500">High</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">No pressure data available</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Wind</h3>
              <span className="text-2xl">💨</span>
            </div>
            <div className="space-y-2">
              {currentSol.wind.speed.average !== null ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatWindSpeed(currentSol.wind.speed.average)}
                    </div>
                    <div className="text-sm text-gray-500">Average Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">
                      {getWindDirection(currentSol.wind.direction)}
                    </div>
                    <div className="text-sm text-gray-500">Direction</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-500">
                        {formatWindSpeed(currentSol.wind.speed.minimum)}
                      </div>
                      <div className="text-gray-500">Min</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-500">
                        {formatWindSpeed(currentSol.wind.speed.maximum)}
                      </div>
                      <div className="text-gray-500">Max</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">No wind data available</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => toggleFavorite(currentSol)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              favorites.includes(currentSol.sol)
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {favorites.includes(currentSol.sol) ? '⭐ Favorited' : '☆ Add to Favorites'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Weather Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Data Quality</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temperature samples:</span>
                  <span className="font-medium">{currentSol.data_quality.temperature_samples}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pressure samples:</span>
                  <span className="font-medium">{currentSol.data_quality.pressure_samples}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind samples:</span>
                  <span className="font-medium">{currentSol.data_quality.wind_samples}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Mission Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sol:</span>
                  <span className="font-medium">{currentSol.sol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Earth date:</span>
                  <span className="font-medium">
                    {currentSol.earth_date ? new Date(currentSol.earth_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mars season:</span>
                  <span className="font-medium">{currentSol.season}</span>
                </div>
              </div>
            </div>
          </div>
          
          {currentSol.wind.direction.compass_rose && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-3">Wind Direction Distribution</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Wind rose data available</p>
                <div className="text-xs text-gray-500">
                  Most common direction: {currentSol.wind.direction.most_common} 
                  ({currentSol.wind.direction.most_common_degrees}°)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'favorites' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Favorite Sols</h3>
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">⭐</span>
              <p className="text-gray-600">No favorite sols yet. Add some by clicking the star button!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherData.sols
                .filter(sol => favorites.includes(sol.sol))
                .map(sol => (
                  <div key={sol.sol} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-yellow-800">⭐ Sol {sol.sol}</h5>
                      <button
                        onClick={() => toggleFavorite(sol)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Date:</strong> {sol.earth_date ? new Date(sol.earth_date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Season:</strong> {sol.season}</p>
                      <p><strong>Temp:</strong> {convertTemperature(sol.temperature.average)}</p>
                      <p><strong>Pressure:</strong> {convertPressure(sol.pressure.average)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSol(sol);
                        setViewMode('current');
                      }}
                      className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {compareMode && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Sols to Compare</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {processedSols.map(sol => (
              <div 
                key={sol.sol} 
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedSolsForCompare.find(s => s.sol === sol.sol)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleCompareSelection(sol)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-800">Sol {sol.sol}</h5>
                  {selectedSolsForCompare.find(s => s.sol === sol.sol) && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{sol.earth_date ? new Date(sol.earth_date).toLocaleDateString() : 'No date'}</p>
                  <p>{sol.season}</p>
                  <p>{convertTemperature(sol.temperature.average)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Ctrl/Cmd + R</span>
                <span>Refresh data</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ctrl/Cmd + F</span>
                <span>Focus search</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ctrl/Cmd + 1</span>
                <span>Current view</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ctrl/Cmd + 2</span>
                <span>Chart view</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ctrl/Cmd + 3</span>
                <span>Compare view</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Total sols available:</strong> {weatherData.metadata.total_sols}</p>
          <p><strong>Latest sol:</strong> {weatherData.metadata.latest_sol}</p>
          <p><strong>Oldest sol:</strong> {weatherData.metadata.oldest_sol}</p>
          <p><strong>Last updated:</strong> {new Date(weatherData.processed_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}