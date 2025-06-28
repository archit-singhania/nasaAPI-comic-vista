import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  fetchTleBySearch,
  fetchTleByCategory,
  fetchTleBySatelliteId,
  fetchTleByPage,
  fetchTleFormat,
  fetchTleStats,
  parseTleData,
  parseApiTleData,
  calculateOrbitalPeriod,
  calculateApproximateAltitude,
  classifySatellite
} from '../api/nasaAPI';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';
import { Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TleVisualizer() {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchType, setSearchType] = useState('all'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSatellites, setTotalSatellites] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [tleStats, setTleStats] = useState(null);
  const [rawTleFormats, setRawTleFormats] = useState({});
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [selectedSatelliteIndex, setSelectedSatelliteIndex] = useState(null);
  const [filters, setFilters] = useState({
    minInclination: '',
    maxInclination: '',
    minEccentricity: '',
    maxEccentricity: '',
    launchYear: ''
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'stations', label: '🏠 Space Stations' },
    { value: 'visual', label: '👁️ Visible Satellites' },
    { value: 'active-geosynchronous', label: '🌍 Geostationary' },
    { value: 'weather', label: '🌤️ Weather Satellites' },
    { value: 'noaa', label: '📊 NOAA Satellites' },
    { value: 'goes', label: '🛰️ GOES Weather' },
    { value: 'resource', label: '📡 Earth Resources' },
    { value: 'cubesat', label: '📦 CubeSats' },
    { value: 'other', label: '🔧 Other Satellites' }
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#06B6D4', '#EAB308', '#14B8A6'];
  
  const processedData = useMemo(() => {
    let filtered = [...satellites];

    if (filters.minInclination) {
      filtered = filtered.filter(sat => sat.inclination >= parseFloat(filters.minInclination));
    }
    if (filters.maxInclination) {
      filtered = filtered.filter(sat => sat.inclination <= parseFloat(filters.maxInclination));
    }
    if (filters.minEccentricity) {
      filtered = filtered.filter(sat => sat.eccentricity >= parseFloat(filters.minEccentricity));
    }
    if (filters.maxEccentricity) {
      filtered = filtered.filter(sat => sat.eccentricity <= parseFloat(filters.maxEccentricity));
    }
    if (filters.launchYear) {
      filtered = filtered.filter(sat => sat.launchYear === parseInt(filters.launchYear));
    }

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [satellites, filters, sortBy, sortOrder]);

  const analyticsData = useMemo(() => {
    if (satellites.length === 0) return null;

    const parsedSatellites = satellites.map(sat => {
      try {
        const tleString = `${sat.name}\n${sat.line1}\n${sat.line2}`;
        const parsed = parseTleData(tleString);
        
        const intlDesignator = parsed.parsed.intlDesignator;
        let launchYear = null;
        if (intlDesignator && intlDesignator.length >= 2) {
          const yearStr = intlDesignator.substring(0, 2);
          const year = parseInt(yearStr);
          launchYear = year >= 57 ? 1900 + year : 2000 + year;
        }

        return {
          ...sat,
          inclination: parsed.parsed.inclination,
          eccentricity: parsed.parsed.eccentricity,
          meanMotion: parsed.parsed.meanMotion,
          raan: parsed.parsed.raan,
          argOfPerigee: parsed.parsed.argOfPerigee,
          meanAnomaly: parsed.parsed.meanAnomaly,
          launchYear: launchYear
        };
      } catch (error) {
        console.warn('Failed to parse TLE for satellite:', sat.name, error);
        return { ...sat, inclination: 0, eccentricity: 0, meanMotion: 0, launchYear: null };
      }
    });

    const inclinationBins = [
      { range: '0-30°', count: 0, satellites: [] },
      { range: '30-60°', count: 0, satellites: [] },
      { range: '60-90°', count: 0, satellites: [] },
      { range: '90-120°', count: 0, satellites: [] },
      { range: '120-180°', count: 0, satellites: [] }
    ];

    const eccentricityBins = [
      { range: '0-0.1', count: 0 },
      { range: '0.1-0.3', count: 0 },
      { range: '0.3-0.5', count: 0 },
      { range: '0.5-0.7', count: 0 },
      { range: '0.7-1.0', count: 0 }
    ];

    const launchYearData = {};
    const orbitalPeriods = [];

    parsedSatellites.forEach(sat => {
      if (sat.inclination !== undefined && sat.inclination > 0) {
        const inc = sat.inclination;
        if (inc >= 0 && inc < 30) inclinationBins[0].count++;
        else if (inc >= 30 && inc < 60) inclinationBins[1].count++;
        else if (inc >= 60 && inc < 90) inclinationBins[2].count++;
        else if (inc >= 90 && inc < 120) inclinationBins[3].count++;
        else if (inc >= 120 && inc <= 180) inclinationBins[4].count++;
      }

      if (sat.eccentricity !== undefined && sat.eccentricity >= 0) {
        const ecc = sat.eccentricity;
        if (ecc >= 0 && ecc < 0.1) eccentricityBins[0].count++;
        else if (ecc >= 0.1 && ecc < 0.3) eccentricityBins[1].count++;
        else if (ecc >= 0.3 && ecc < 0.5) eccentricityBins[2].count++;
        else if (ecc >= 0.5 && ecc < 0.7) eccentricityBins[3].count++;
        else if (ecc >= 0.7 && ecc <= 1.0) eccentricityBins[4].count++;
      }

      if (sat.launchYear && sat.launchYear > 1950 && sat.launchYear < 2030) {
        launchYearData[sat.launchYear] = (launchYearData[sat.launchYear] || 0) + 1;
      }

      if (sat.meanMotion && sat.meanMotion > 0) {
        const period = 24 / sat.meanMotion;
        orbitalPeriods.push({
          name: sat.name,
          period: period,
          inclination: sat.inclination || 0,
          eccentricity: sat.eccentricity || 0
        });
      }
    });

    const launchYearChart = Object.entries(launchYearData)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year)
      .slice(-15);

    const validSatellites = parsedSatellites.filter(sat => 
      sat.inclination > 0 && sat.eccentricity >= 0 && sat.meanMotion > 0
    );

    return {
      inclinationDistribution: inclinationBins,
      eccentricityDistribution: eccentricityBins,
      launchYearDistribution: launchYearChart,
      orbitalPeriods: orbitalPeriods.slice(0, 100),
      summary: {
        totalSatellites: satellites.length,
        avgInclination: validSatellites.length > 0 ? 
          validSatellites.reduce((sum, sat) => sum + sat.inclination, 0) / validSatellites.length : 0,
        avgEccentricity: validSatellites.length > 0 ? 
          validSatellites.reduce((sum, sat) => sum + sat.eccentricity, 0) / validSatellites.length : 0,
        avgMeanMotion: validSatellites.length > 0 ? 
          validSatellites.reduce((sum, sat) => sum + sat.meanMotion, 0) / validSatellites.length : 0
      }
    };
  }, [satellites]);

  const generateAIInsights = useCallback(async () => {
    if (!analyticsData || satellites.length === 0) return;

    setLoadingInsights(true);

    const payload = {
      totalSatellites: satellites.length,
      avgInclination: analyticsData.summary.avgInclination,
      inclinationBins: analyticsData.inclinationDistribution,
      launchYears: analyticsData.launchYearDistribution,
    };

    const mockInsights = {
      keyFindings: [
        "Over 60% of satellites operate in low Earth orbit (LEO).",
        "Recent years show a rapid increase in satellite deployments post-2020.",
        "High inclination satellites suggest polar or global coverage missions.",
      ],
      recommendations: [
        "Focus on LEO optimization for better bandwidth usage.",
        "Prepare infrastructure for increasing satellite traffic.",
        "Enhance monitoring for older satellites launched before 2010.",
      ],
      patterns: [
        "Annual satellite launches surged after 2018.",
        "Most missions prefer inclinations between 70–100 degrees.",
        "Geostationary satellites remain stable in orbital growth.",
      ],
    };

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort(); 
      }, 5000);

      const response = await axios.post(
        'https://nasaapi-comic-vista-backend.onrender.com/api/insights',
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        }
      );

      clearTimeout(timeout); 

      if (response.data?.insights) {
        setAiInsights(response.data.insights);
      } else {
        console.warn('No insights returned, using mock');
        setAiInsights(mockInsights);
      }
    } catch (error) {
      if (error.name === 'CanceledError') {
        console.warn('⏱️ AI request timed out — using mock insights.');
      } else {
        console.error('🚨 AI insights error:', error);
      }
      setAiInsights(mockInsights);
    } finally {
      setLoadingInsights(false);
    }
  }, [analyticsData, satellites]);

  const loadSatellites = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (searchType === 'search' && searchTerm.trim()) {
        response = await fetchTleBySearch(searchTerm.trim());
      } else if (searchType === 'category' && selectedCategory) {
        response = await fetchTleByCategory(selectedCategory);
      } else {
        response = await fetchTleByPage(currentPage, 50);
      }
      
      const data = response?.data || response;
      
      if (Array.isArray(data)) {
        setSatellites(data);
        setTotalSatellites(data.length);
      } else if (data && typeof data === 'object') {
        setSatellites(data.satellites || [data]);
        setTotalSatellites(data.totalCount || data.total || 1);
      } else {
        setSatellites([]);
        setTotalSatellites(0);
      }
      
    } catch (err) {
      console.error('❌ TLE Frontend Error:', err);
      setError(`Failed to load satellites: ${err.message}`);
      setSatellites([]);
      setTotalSatellites(0);
    } finally {
      setLoading(false);
    }
  }, [searchType, searchTerm, selectedCategory, currentPage]);

  useEffect(() => {
    loadSatellites();
  }, [loadSatellites]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await fetchTleStats();
        setTleStats(data);
      } catch (error) {
        console.error('Failed to load TLE stats:', error);
      }
    };
    
    loadStats();
  }, []);

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setSearchType(category ? 'category' : 'all');
    setCurrentPage(1);

    try {
      setLoading(true);
      setError('');

      let response = await fetchTleByCategory(category);
      setSatellites(response);
      setTotalSatellites(response.length);
    } catch (err) {
      console.error('❌ Category Load Error:', err);
      setError(`Failed to load category: ${err.message}`);
      setSatellites([]);
      setTotalSatellites(0);
    } finally {
      setLoading(false);
    }
  };

  const showAll = () => {
    setSearchType('all');
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
    setFilters({
      minInclination: '',
      maxInclination: '',
      minEccentricity: '',
      maxEccentricity: '',
      launchYear: ''
    });
  };
  
  const showSatelliteDetails = async (satellite, index) => {
    if (!satellite.satelliteNumber) {
      try {
        const fetched = await fetchTleBySatelliteId(satellite.satelliteId);

        if (!fetched?.line1 || !fetched?.line2) {
          console.error('❌ Error fetching or invalid TLE data:', fetched);
          return;
        }

        const tleString = `${fetched.name || 'Unnamed Satellite'}\n${fetched.line1}\n${fetched.line2}`;
        const parsedData = parseTleData(tleString);
        const { parsed } = parsedData;

        const meanMotion = parsed.meanMotion;
        const inclination = parsed.inclination;
        const eccentricity = parsed.eccentricity;

        const orbitalPeriod = calculateOrbitalPeriod(meanMotion);
        const altitude = calculateApproximateAltitude(meanMotion);
        const classification = classifySatellite(inclination, altitude, eccentricity);

        const enrichedSatellite = {
          ...satellite,
          ...parsedData,
          ...parsed,
          orbitalPeriod,
          altitude,
          classification: classification.type,
          objectType: classification.category
        };

        setSelectedSatellite(enrichedSatellite);
        setSelectedSatelliteIndex(index);
      } catch (error) {
        console.error('❌ Error fetching satellite details:', error);
      }
    } else {
      setSelectedSatellite(satellite);
      setSelectedSatelliteIndex(index);
    }
  };

  const closeModal = () => {
    setSelectedSatellite(null);
    setSelectedSatelliteIndex(null);
  };



  const copyTleData = (satellite) => {
    const tleText = `${satellite.name || 'UNKNOWN'}\n${satellite.tle?.line1 || ''}\n${satellite.tle?.line2 || ''}`;
    navigator.clipboard.writeText(tleText).then(() => {
    }).catch(err => {
      console.error('Failed to copy TLE data:', err);
    });
  };


  const toggleRawTleFormat = async (satelliteId) => {
    if (rawTleFormats[satelliteId]) {
      const newFormats = { ...rawTleFormats };
      delete newFormats[satelliteId];
      setRawTleFormats(newFormats);
    } else {
      try {
        const { data, error } = await fetchTleFormat(satelliteId);
        if (!error) {
          setRawTleFormats(prev => ({ ...prev, [satelliteId]: data }));
        }
      } catch (error) {
        console.error('Error fetching raw TLE format:', error);
      }
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-5 mb-6 relative">
          {[
            { mode: 'grid', label: '📊 Satellites', icon: '🛰️' },
            { mode: 'analytics', label: '📈 Analytics', icon: '📊' },
            { mode: 'insights', label: '🤖 AI Insights', icon: '🧠' }
          ].map(({ mode, label, icon }) => {
            const isActive = viewMode === mode;
            return (
              <div key={mode} className="relative">
                {isActive && (
                  <div className="absolute inset-0 rounded-full z-0 animate-pulse transition-all duration-300" style={{ background: 'rgba(0, 255, 255, 0.1)' }} />
                )}
                <button
                  onClick={() => setViewMode(mode)}
                  className={`px-6 sm:px-8 py-2.5 rounded-full font-semibold transition-all duration-300 border backdrop-blur-md relative z-10 shadow-lg`}
                  style={{
                    backgroundColor: isActive ? 'rgba(15, 23, 42, 0.8)' : 'rgba(30, 41, 59, 0.6)', 
                    borderColor: isActive ? '#0ff' : 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    boxShadow: isActive ? '0 0 8px #0ff' : '0 0 0 transparent',
                    textShadow: isActive ? '0 0 6px #0ff, 0 0 12px #0ff' : 'none'
                  }}
                >
                  <span className="hidden sm:inline">{icon}</span>{' '}
                  <span>{label}</span>
                </button>
              </div>
            );
          })}
        </div>

      <div className="w-full flex justify-center px-4">
        <div
            className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl"
            style={{ width: '100%', maxWidth: '1000px' }}
          >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row items-center justify-between gap-4 mx-auto mb-6 px-4"
            style={{ maxWidth: '900px' }}
          >
            <div className="relative w-40 mx-auto" style={{ height: '40px' }}>
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                strokeWidth={2.5} 
                style={{ color: '#f9fafb' }}
              />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
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
                  height: '40px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#60a5fa';
                  e.target.style.boxShadow =
                    '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 4px rgba(59,130,246,0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'transparent';
                  e.target.style.boxShadow =
                    '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.background = 'linear-gradient(90deg, white, white)';
                  e.target.style.boxShadow =
                    '0 8px 25px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.6)';
                  e.target.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = 'linear-gradient(135deg, #374151, #1f2937)';
                  e.target.style.boxShadow =
                    '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
                  e.target.style.color = 'white';
                }}
              >
                {categories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                    style={{
                      backgroundColor: 'white',
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSearchType('all');
                setCurrentPage(1);
                loadSatellites(); 
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
              }}
              className="w-full lg:w-auto flex-shrink-0"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.background = 'linear-gradient(135deg, #ffffff, #f4f4f5)';
                e.target.style.boxShadow =
                  '0 8px 25px rgba(147,51,234,0.2), inset 0 1px 0 rgba(255,255,255,0.6)';
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
                e.target.style.boxShadow =
                  '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)';
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
                  color: 'black',
                }}
              />
              <span>Reset</span>
            </button>
          </motion.div>
        </div>
      </div>

        {error && (
         <div className="bg-gradient-to-r from-gray-900/40 to-red-900/30 backdrop-blur-xl border border-red-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-3 sm:mr-4">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Error Loading Satellites</h3>
          </div>
          <p className="text-white mb-4 sm:mb-6 text-sm sm:text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{error}</p>
          <button 
            onClick={loadSatellites}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            🔁 Try Again
          </button>
        </div>
        )}

        {viewMode === 'details' && selectedSatellite && (
          <div className="min-h-screen bg-gray-900 p-6">
            <button
              onClick={() => {
                setSelectedSatellite(null);
                setViewMode('grid'); 
              }}
              className="mb-6 flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Sat Grid</span>
            </button>

            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {selectedSatellite.name || 'Unknown Satellite'}
                </h1>
                {selectedSatellite.launchYear && (
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded-full text-lg font-medium border border-blue-500/30">
                    {selectedSatellite.launchYear}
                  </span>
                )}
              </div>

              <div className="space-y-8">
                {(() => {
                  const satelliteData = parseApiTleData(selectedSatellite);
                  
                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                          { label: 'Satellite Number', value: typeof satelliteData.satelliteNumber === 'number' ? satelliteData.satelliteNumber : 'N/A', icon: '🆔' },
                          { label: 'Satellite ID', value: satelliteData.satelliteId || 'N/A', icon: '🔢' },
                          { label: 'Classification', value: satelliteData.classification || 'N/A', icon: '🗂️' },
                          { label: 'Intl Designator', value: satelliteData.intlDesignator || 'N/A', icon: '🌐' },
                          { label: 'Epoch Year', value: typeof satelliteData.epochYear === 'number' ? satelliteData.epochYear : 'N/A', icon: '📅' },
                          { label: 'Epoch Day', value: typeof satelliteData.epochDay === 'number' ? satelliteData.epochDay.toFixed(4) : 'N/A', icon: '🕓' },
                          { label: 'First Derivative', value: typeof satelliteData.firstDerivative === 'number' ? satelliteData.firstDerivative.toExponential(2) : 'N/A', icon: '📈' },
                          { label: 'Second Derivative', value: typeof satelliteData.secondDerivative === 'number' ? satelliteData.secondDerivative.toExponential(2) : 'N/A', icon: '📉' },
                          { label: 'BSTAR Drag', value: typeof satelliteData.bstarDrag === 'number' ? satelliteData.bstarDrag.toExponential(2) : 'N/A', icon: '💨' },
                          { label: 'Ephemeris Type', value: typeof satelliteData.ephemerisType === 'number' ? satelliteData.ephemerisType : 'N/A', icon: '📘' },
                          { label: 'Element Number', value: typeof satelliteData.elementNumber === 'number' ? satelliteData.elementNumber : 'N/A', icon: '🔣' },
                          { label: 'Inclination', value: typeof satelliteData.inclination === 'number' ? `${satelliteData.inclination.toFixed(2)}°` : 'N/A', icon: '📐' },
                          { label: 'RAAN', value: typeof satelliteData.raan === 'number' ? `${satelliteData.raan.toFixed(2)}°` : 'N/A', icon: '🌐' },
                          { label: 'Eccentricity', value: typeof satelliteData.eccentricity === 'number' ? satelliteData.eccentricity.toFixed(6) : 'N/A', icon: '⭕' },
                          { label: 'Arg of Perigee', value: typeof satelliteData.argOfPerigee === 'number' ? `${satelliteData.argOfPerigee.toFixed(2)}°` : 'N/A', icon: '📍' },
                          { label: 'Mean Anomaly', value: typeof satelliteData.meanAnomaly === 'number' ? `${satelliteData.meanAnomaly.toFixed(2)}°` : 'N/A', icon: '📊' },
                          { label: 'Mean Motion', value: typeof satelliteData.meanMotion === 'number' ? satelliteData.meanMotion.toFixed(4) : 'N/A', icon: '🔄' },
                          { label: 'Revolution #', value: typeof satelliteData.revolutionNumber === 'number' ? satelliteData.revolutionNumber : 'N/A', icon: '🔁' }
                        ]
                          .map((item, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                              <div className="flex items-center space-x-2 mb-3">
                                <span className="text-xl">{item.icon}</span>
                                <p className="text-white text-sm font-medium">{item.label}</p>
                              </div>
                              <p className="text-white font-semibold text-xl">{item.value}</p>
                            </div>
                        ))}
                      </div>

                      {(satelliteData.orbitalPeriod || satelliteData.altitude) && (
                        <div className="grid grid-cols-2 gap-4">
                          {satelliteData.orbitalPeriod && (
                            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">⏱️</span>
                                  <p className="text-white text-sm font-medium">Orbital Period</p>
                              </div>
                              <p className="text-white font-semibold text-lg">{satelliteData.orbitalPeriod.toFixed(2)} mins</p>
                            </div>
                          )}
                          {satelliteData.altitude && (
                            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">📏</span>
                                <p className="text-white text-sm font-medium">Altitude</p>
                              </div>
                              <p className="text-white font-semibold text-lg">{satelliteData.altitude.toFixed(0)} km</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <>
            {processedData.length === 0 && !loading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">No Satellites Found</h3>
                  <p className="text-slate-400 text-base sm:text-lg mb-6">
                    Try adjusting your filters to find satellites.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
               <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  style={{ width: '100%', maxWidth: '1000px' }}
                >
                {processedData.map((satellite, index) => {
                  const colorPalette = [
                    '#0a0e27', 
                    '#1a1a2e',
                    '#16213e', 
                    '#0f3460', 
                    '#533483', 
                    '#1e3a5f',
                    '#2c1810', 
                    '#0d1421',
                    '#1f1f3a', 
                    '#3d5a80', 
                  ];
                const bgColor = colorPalette[index % colorPalette.length];
                return (
                  <div
                    key={index}
                    className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl hover:scale-[1.015]"
                    style={{
                      backgroundColor: bgColor,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-bold text-white text-sm sm:text-lg mb-2 truncate group-hover:text-blue-200 transition-colors duration-300"
                          style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}
                        >
                          {satellite.name || 'Unknown Satellite'}
                        </h3>
                        <p
                          className="text-white text-xs sm:text-sm flex items-center gap-1"
                          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}
                        >
                          <span className="font-medium text-gray-100">Satellite Name:</span> 
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </p>
                        {satellite.launchYear && (
                          <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-white/10 text-white rounded-full text-xs sm:text-sm font-medium border border-white/20 shadow-md">
                            {satellite.launchYear}
                          </span>
                        )}
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3 mb-4">
                      {satellite.inclination !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-white text-xs sm:text-sm">Inclination</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">{satellite.inclination.toFixed(2)}°</span>
                        </div>
                      )}
                      {satellite.eccentricity !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-white text-xs sm:text-sm">Eccentricity</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">{satellite.eccentricity.toFixed(4)}</span>
                        </div>
                      )}
                      {satellite.meanMotion !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-white text-xs sm:text-sm">Mean Motion</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">{satellite.meanMotion.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <motion.div
                      className="mt-4 pt-4 border-t border-white/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div
                        className="cursor-pointer bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold px-4 py-2 rounded-full text-center shadow-md transition-all"
                        onClick={() => {
                          setSelectedSatellite(satellite);
                          setViewMode('details');
                        }}
                        whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textShadow = '0 0 6px #0ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textShadow = 'none';
                        }}
                      >
                        🚀 Tap for More Satellite Insights
                      </motion.div>
                    </motion.div>

                  </div>
                );
              })}

              </div>
             </div>
            )}
          </>
        )}

       {viewMode === 'analytics' && analyticsData && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 border border-slate-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Satellites', value: analyticsData.summary.totalSatellites, color: 'blue', icon: '🛰️', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Avg Inclination', value: `${analyticsData.summary.avgInclination.toFixed(1)}°`, color: 'purple', icon: '🌍', gradient: 'from-purple-500 to-purple-600' },
            { label: 'Avg Eccentricity', value: analyticsData.summary.avgEccentricity.toFixed(4), color: 'cyan', icon: '⭕', gradient: 'from-cyan-500 to-cyan-600' },
            { label: 'Avg Mean Motion', value: analyticsData.summary.avgMeanMotion.toFixed(2), color: 'green', icon: '🔄', gradient: 'from-green-500 to-green-600' }
          ].map((stat, index) => (
            <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center text-white text-center">
              
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
              
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white text-sm sm:text-base font-medium tracking-wide">{stat.label}</span>
                  <div className="text-lg sm:text-xl drop-shadow-lg">{stat.icon}</div>
                </div>
                
                <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Inclination Distribution</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.inclinationDistribution}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" strokeWidth={1} />
                    <XAxis 
                      dataKey="range" 
                      stroke="#FFFFFF" 
                      fontSize={12} 
                      fontWeight="600"
                      tick={{ fill: '#FFFFFF' }}
                      axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                    />
                    <YAxis 
                      stroke="#FFFFFF" 
                      fontSize={12} 
                      fontWeight="600"
                      tick={{ fill: '#FFFFFF' }}
                      axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '2px solid #3B82F6',
                        borderRadius: '16px',
                        color: '#1F2937',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        fontWeight: '600'
                      }}
                      labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                      <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1D4ED8" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <Bar 
                      dataKey="count" 
                      fill="url(#blueGradient)" 
                      radius={[8, 8, 0, 0]}
                      stroke="#1D4ED8"
                      strokeWidth={2}
                      filter="url(#barShadow)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Eccentricity Distribution</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <defs>
                      <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.15"/>
                      </filter>
                    </defs>
                    <Pie
                      data={analyticsData.eccentricityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="count"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      filter="url(#pieShadow)"
                    >
                      {analyticsData.eccentricityDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '2px solid #8B5CF6',
                        borderRadius: '16px',
                        color: '#1F2937',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        fontWeight: '600'
                      }}
                      labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        color: '#374151', 
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-violet-600 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Launch Year Trend</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                {analyticsData.launchYearDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analyticsData.launchYearDistribution}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" strokeWidth={1} />
                      <XAxis 
                        dataKey="year" 
                        stroke="#FFFFFF" 
                        fontSize={12} 
                        fontWeight="600"
                        tick={{ fill: '#FFFFFF' }}
                        axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                      />
                      <YAxis 
                        stroke="#FFFFFF" 
                        fontSize={12} 
                        fontWeight="600"
                        tick={{ fill: '#FFFFFF' }}
                        axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '2px solid #8B5CF6',
                          borderRadius: '16px',
                          color: '#1F2937',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          fontWeight: '600'
                        }}
                        labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                        cursor={{ stroke: '#8B5CF6', strokeWidth: 2, strokeDasharray: '5 5' }}
                      />
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#A78BFA" />
                          <stop offset="50%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                        <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#8B5CF6" floodOpacity="0.4"/>
                        </filter>
                      </defs>
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="url(#lineGradient)" 
                        strokeWidth={5}
                        dot={{ 
                          fill: '#FFFFFF', 
                          strokeWidth: 4, 
                          r: 6, 
                          stroke: '#8B5CF6',
                          filter: 'url(#lineShadow)'
                        }}
                        activeDot={{ 
                          r: 9, 
                          stroke: '#8B5CF6', 
                          strokeWidth: 4, 
                          fill: '#FFFFFF',
                          filter: 'url(#lineShadow)'
                        }}
                        filter="url(#lineShadow)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-5xl mb-3 opacity-50">📊</div>
                      <div className="font-semibold text-gray-500">No launch year data available</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Orbital Period vs Inclination</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                {analyticsData.orbitalPeriods.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" strokeWidth={1} />
                      <XAxis 
                        dataKey="inclination" 
                        stroke="#FFFFFF" 
                        fontSize={12} 
                        fontWeight="600" 
                        name="Inclination" 
                        unit="°"
                        tick={{ fill: '#FFFFFF' }}
                        axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                      />
                      <YAxis 
                        dataKey="period" 
                        stroke="#FFFFFF" 
                        fontSize={12} 
                        fontWeight="600" 
                        name="Period" 
                        unit="h"
                        tick={{ fill: '#FFFFFF' }}
                        axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3', stroke: '#06B6D4', strokeWidth: 2 }}
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '2px solid #06B6D4',
                          borderRadius: '16px',
                          color: '#1F2937',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          fontWeight: '600'
                        }}
                        labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                        formatter={(value, name) => [
                          name === 'period' ? `${value.toFixed(2)}h` : value,
                          name === 'period' ? 'Orbital Period' : 'Inclination'
                        ]}
                        labelFormatter={(label) => `Inclination: ${label}°`}
                      />
                      <defs>
                        <filter id="scatterShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#06B6D4" floodOpacity="0.4"/>
                        </filter>
                      </defs>
                      <Scatter 
                        name="Satellite" 
                        data={analyticsData.orbitalPeriods} 
                        fill="#06B6D4"
                        stroke="#0891B2"
                        strokeWidth={3}
                        r={5}
                        filter="url(#scatterShadow)"
                        fillOpacity={0.8}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-5xl mb-3 opacity-50">🛰️</div>
                      <div className="font-semibold text-gray-500">No orbital period data available</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {viewMode === 'insights' && (
          <div className="space-y-6 sm:space-y-8">
           <div className="text-center" style={{ marginTop: '4rem' }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">AI-Powered Insights</h2>
              <p className="text-white text-sm sm:text-lg max-w-2xl mx-auto">
                Advanced analysis and patterns discovered in the satellite data
              </p>
            </div>

            {!aiInsights && !loadingInsights && (
              <div className="text-center">
                <button
                  onClick={generateAIInsights}
                  disabled={satellites.length === 0}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base disabled:cursor-not-allowed"
                >
                  🧠 Generate AI Insights
                </button>
              </div>
            )}

            {loadingInsights && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Analyzing Satellite Data...</h3>
                <p className="text-white text-sm sm:text-base">AI is processing orbital patterns and generating insights</p>
              </div>
            )}

            {aiInsights && (
              <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10">
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 flex justify-center items-center">
                  <span className="mr-3">🔍</span>
                  Key Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-blue-300 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p
                        style={{
                          textShadow: '0 0 8px #00ffff, 0 0 12px #00ffff',
                          color: '#00ffff',
                        }}
                        className="text-sm sm:text-base bg-black rounded-lg p-4 shadow-md"
                      >
                        {finding}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10">
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 flex justify-center items-center">
                  <span className="mr-3">💡</span>
                  Recommendations
                </h3>
                <div className="space-y-4">
                  {aiInsights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-blue-300 text-sm font-bold">{index + 1}</span>
                      </div>
                     <p
                      style={{
                        textShadow: '0 0 8px #39ff14, 0 0 12px #39ff14',
                        color: '#39ff14',
                      }}
                      className="text-sm sm:text-base bg-black rounded-lg p-4 shadow-md"
                    >
                      {rec}
                    </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10">
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 flex justify-center items-center">
                  <span className="mr-3">🔄</span>
                  Detected Patterns
                </h3>
                <div className="space-y-4">
                  {aiInsights.patterns.map((pattern, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-purple-300 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p
                        style={{
                          textShadow: '0 0 8px #ff00ff, 0 0 12px #ff00ff',
                          color: '#ff00ff',
                        }}
                        className="text-sm sm:text-base bg-black rounded-lg p-4 shadow-md"
                      >
                        {pattern}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={generateAIInsights}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl sm:rounded-2xl font-medium transition-all duration-300 border border-white/20 hover:border-white/30 text-sm sm:text-base"
                >
                  🔄 Regenerate Insights
                </button>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}