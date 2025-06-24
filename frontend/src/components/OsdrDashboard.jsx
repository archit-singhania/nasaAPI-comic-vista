import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Filter, Download, Eye, BarChart3, Rocket, Database, FileText, 
  Beaker, Users, Settings, TrendingUp, Globe, Calendar, Tag, AlertCircle, 
  RefreshCw, ChevronDown, ChevronUp, Star, BookOpen, Microscope, Atom,
  ExternalLink, Clock, MapPin, Activity, Layers, Zap, Shield, Award,
  ChevronLeft, ChevronRight, X, Plus, Minus
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area 
} from 'recharts';

import {
  fetchStudyFiles,
  fetchStudyFilesByDateRange,
  fetchStudyMetadata,
  searchStudies as apiSearchStudies,
  advancedSearchStudies,
  fetchExperiments,
  fetchExperimentById,
  fetchMissions,
  fetchMissionById,
  fetchPayloads,
  fetchPayloadById,
  fetchHardware,
  fetchHardwareById,
  fetchVehicles,
  fetchVehicleById,
  fetchSubjects,
  fetchSubjectById,
  fetchBiospecimens,
  fetchBiospecimenById,
  fetchAnalytics,
  fetchAvailableDates,
  fetchStudyTypes,
  fetchOrganisms,
  fetchPlatforms,
  fetchHealthStatus,
  buildSearchQuery,
  formatDate,
  formatDateTime,
  formatFileSize,
  downloadFile,
  DATA_TYPES,
  STUDY_TYPES,
  PLATFORMS,
  ORGANISMS
} from '../api/nasaAPI';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

const OsdrDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('cgene');
  const [studies, setStudies] = useState([]);
  const [studyMetadata, setStudyMetadata] = useState(null);
  const [studyFiles, setStudyFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [missions, setMissions] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [filters, setFilters] = useState({
    organism: '',
    studyType: '',
    platform: '',
    dateRange: ''
  });
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [favoriteStudies, setFavoriteStudies] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [organisms, setOrganisms] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [payloads, setPayloads] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [biospecimens, setBiospecimens] = useState([]);

  const dataTypes = DATA_TYPES.map(type => ({
    ...type,
    icon: type.value === 'cgene' ? <Rocket className="w-4 h-4" /> :
          type.value === 'nih_geo_gse' ? <Database className="w-4 h-4" /> :
          type.value === 'ebi_pride' ? <Beaker className="w-4 h-4" /> :
          <Microscope className="w-4 h-4" />,
    color: type.value === 'cgene' ? 'bg-blue-500' :
           type.value === 'nih_geo_gse' ? 'bg-green-500' :
           type.value === 'ebi_pride' ? 'bg-purple-500' :
           'bg-orange-500'
  }));

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [
          analyticsData, 
          experimentsData, 
          missionsData, 
          studyTypesData, 
          organismsData, 
          platformsData,
          payloadsData,
          hardwareData,
          vehiclesData
        ] = await Promise.all([
          fetchAnalytics(),
          fetchExperiments(),
          fetchMissions(),
          fetchStudyTypes(),
          fetchOrganisms(),
          fetchPlatforms(),
          fetchPayloads(),
          fetchHardware(),
          fetchVehicles()
        ]);

       setAnalytics({
          totalStudies: analyticsData?.totalStudies?.total || 0,
          totalExperiments: analyticsData?.totalExperiments || 0,
          totalMissions: analyticsData?.totalMissions || 0
        });
        setExperiments(Array.isArray(experimentsData?.experiments) ? experimentsData.experiments.slice(0, 10) : []);
        setMissions(Array.isArray(missionsData?.missions) ? missionsData.missions.slice(0, 10) : []);
        setStudyTypes(studyTypesData?.studyTypes || STUDY_TYPES);
        setOrganisms(organismsData?.organisms || ORGANISMS);
        setPlatforms(platformsData?.platforms || PLATFORMS);
        setPayloads(Array.isArray(payloadsData?.payloads) ? payloadsData.payloads.slice(0, 10) : []);
        setHardware(Array.isArray(hardwareData?.hardware) ? hardwareData.hardware.slice(0, 10) : []);
        setVehicles(Array.isArray(vehiclesData?.vehicles) ? vehiclesData.vehicles.slice(0, 10) : []);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError('Failed to load initial data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const searchStudies = useCallback(async (term = searchTerm, type = selectedDataType) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = buildSearchQuery({
        term,
        from: currentPage * pageSize,
        size: pageSize,
        type,
        ...filters
      });

      const response = await apiSearchStudies(searchParams);
      setStudies(response?.payload || []);
      setTotalResults(response?.hits || 0);
    } catch (err) {
      setError('Failed to search studies: ' + err.message);
      setStudies([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDataType, currentPage, pageSize, filters]);

  const handleFetchStudyMetadata = useCallback(async (studyId) => {
    setLoading(true);
    try {
      const response = await fetchStudyMetadata(studyId);
      setStudyMetadata(response);
      setSelectedStudy(studyId);
    } catch (err) {
      setError('Failed to fetch study metadata: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchStudyFiles = useCallback(async (studyId) => {
    setLoading(true);
    try {
      const response = await fetchStudyFiles(studyId);
      setStudyFiles(response?.studies || {});
    } catch (err) {
      setError('Failed to fetch study files: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudyRecommendations = useMemo(() => {
    if (!studies.length) return [];
    
    return studies
      .filter(study => study.title && study.description)
      .slice(0, 5)
      .map(study => ({
        ...study,
        relevanceScore: Math.random() * 100
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [studies]);

  const processAnalyticsData = useMemo(() => {
    if (!analytics) return null;

    const dataTypeDistribution = [
      { name: 'NASA OSDR', value: analytics.totalStudies * 0.6, color: '#3B82F6' },
      { name: 'NIH GEO', value: analytics.totalStudies * 0.25, color: '#10B981' },
      { name: 'EBI PRIDE', value: analytics.totalStudies * 0.1, color: '#8B5CF6' },
      { name: 'MG-RAST', value: analytics.totalStudies * 0.05, color: '#F59E0B' }
    ];

    const timeSeriesData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
      studies: Math.floor(Math.random() * 50) + 20,
      experiments: Math.floor(Math.random() * 30) + 10,
      missions: Math.floor(Math.random() * 10) + 5
    }));

    const studyTypeDistribution = studyTypes.slice(0, 6).map(type => ({
      name: type,
      value: Math.floor(Math.random() * 100) + 20,
      color: COLORS[studyTypes.indexOf(type) % COLORS.length]
    }));

    const organismDistribution = organisms.slice(0, 6).map(organism => ({
      name: organism.split(' ')[0],
      value: Math.floor(Math.random() * 80) + 10,
      color: COLORS[organisms.indexOf(organism) % COLORS.length]
    }));

    return {
      dataTypeDistribution,
      timeSeriesData,
      studyTypeDistribution,
      organismDistribution
    };
  }, [analytics, studyTypes, organisms]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    searchStudies();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      organism: '',
      studyType: '',
      platform: '',
      dateRange: ''
    });
  };

  const toggleFavoriteStudy = (studyId) => {
    setFavoriteStudies(prev => 
      prev.includes(studyId) 
        ? prev.filter(id => id !== studyId)
        : [...prev, studyId]
    );
  };

  const totalPages = Math.ceil(totalResults / pageSize);
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    if (searchTerm || Object.values(filters).some(f => f)) {
      const timer = setTimeout(() => {
        searchStudies();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filters, currentPage, pageSize, selectedDataType, searchStudies]);

  const handleDownloadFile = async (fileUrl, filename) => {
    try {
      await downloadFile(fileUrl, filename);
    } catch (err) {
      setError('Failed to download file: ' + err.message);
    }
  };

  if (loading && !studies.length && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading OSDR data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">NASA OSDR Dashboard</h1>
            <p className="text-blue-100">Explore space biology and life sciences data</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {typeof analytics?.totalStudies === 'object' ? analytics?.totalStudies?.total : analytics?.totalStudies}
              </div>
              <div className="text-sm text-blue-100">Studies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics?.totalExperiments || 0}</div>
              <div className="text-sm text-blue-100">Experiments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics?.totalMissions || 0}</div>
              <div className="text-sm text-blue-100">Missions</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'search', label: 'Search Studies', icon: <Search className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'experiments', label: 'Experiments', icon: <Beaker className="w-4 h-4" /> },
            { id: 'missions', label: 'Missions', icon: <Rocket className="w-4 h-4" /> },
            { id: 'resources', label: 'Resources', icon: <Database className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {dataTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedDataType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDataType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${type.color} text-white`}>
                        {type.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search studies, experiments, or keywords..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Filter className="w-4 h-4" />
                <span>Advanced Filters</span>
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organism</label>
                    <select
                      value={filters.organism}
                      onChange={(e) => handleFilterChange('organism', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Organisms</option>
                      {organisms.map(organism => (
                        <option key={organism} value={organism}>{organism}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Study Type</label>
                    <select
                      value={filters.studyType}
                      onChange={(e) => handleFilterChange('studyType', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Study Types</option>
                      {studyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                    <select
                      value={filters.platform}
                      onChange={(e) => handleFilterChange('platform', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Platforms</option>
                      {platforms.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {getStudyRecommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Recommended Studies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getStudyRecommendations.map((study, index) => (
                  <div key={study.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2">{study.title || 'Untitled Study'}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{study.description || 'No description available'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium">
                        {Math.round(study.relevanceScore)}% match
                      </span>
                      <button
                        onClick={() => handleFetchStudyMetadata(study.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <div className="text-sm text-gray-500">
                  {totalResults} results found
                </div>
              </div>
            </div>

            {studies.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {studies.map((study, index) => (
                  <div key={study.id || index} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {study.title || study.name || 'Untitled Study'}
                          </h3>
                          <button
                            onClick={() => toggleFavoriteStudy(study.id)}
                            className={`p-1 rounded ${
                              favoriteStudies.includes(study.id)
                                ? 'text-yellow-500'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-3">
                          {study.description || study.summary || 'No description available'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {study.organism && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Users className="w-3 h-3 mr-1" />
                              {study.organism}
                            </span>
                          )}
                          {study.studyType && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Tag className="w-3 h-3 mr-1" />
                              {study.studyType}
                            </span>
                          )}
                          {study.date && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(study.date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleFetchStudyMetadata(study.id)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFetchStudyFiles(study.id)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                          title="View Files"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(study.url || `https://osdr.nasa.gov/bio/data/${study.id}`, '_blank')}
                          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                          title="Open External Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalResults)} of {totalResults} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && processAnalyticsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Studies</p>
                  <p className="text-2xl font-bold text-blue-600">{typeof analytics?.totalStudies || 0}</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Experiments</p>
                  <p className="text-2xl font-bold text-green-600">{typeof analytics?.totalExperiments || 0}</p>
                </div>
                <Beaker className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Missions</p>
                  <p className="text-2xl font-bold text-purple-600">{typeof analytics?.totalMissions || 0}</p>
                </div>
                <Rocket className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Platforms</p>
                  <p className="text-2xl font-bold text-orange-600">{platforms?.length || 0}</p>
                </div>
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Data Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processAnalyticsData.dataTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {processAnalyticsData.dataTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Activity Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processAnalyticsData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="studies" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="experiments" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="missions" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Study Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processAnalyticsData.studyTypeDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Organism Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={processAnalyticsData.organismDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'experiments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Recent Experiments</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {experiments.map((experiment, index) => (
                <div key={experiment.id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {experiment.title || experiment.name || `Experiment ${index + 1}`}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {experiment.description || experiment.summary || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {experiment.type && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Beaker className="w-3 h-3 mr-1" />
                            {experiment.type}
                          </span>
                        )}
                        {experiment.status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            experiment.status === 'Active' ? 'bg-green-100 text-green-800' :
                            experiment.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <Activity className="w-3 h-3 mr-1" />
                            {experiment.status}
                          </span>
                        )}
                        {experiment.startDate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(experiment.startDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => fetchExperimentById(experiment.id)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Space Missions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {missions.map((mission, index) => (
                <div key={mission.id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {mission.name || mission.title || `Mission ${index + 1}`}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {mission.description || mission.summary || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {mission.type && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Rocket className="w-3 h-3 mr-1" />
                            {mission.type}
                          </span>
                        )}
                        {mission.status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            mission.status === 'Active' ? 'bg-green-100 text-green-800' :
                            mission.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {mission.status}
                          </span>
                        )}
                        {mission.launchDate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(mission.launchDate)}
                          </span>
                        )}
                        {mission.duration && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            {mission.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => fetchMissionById(mission.id)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Payloads
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {payloads.slice(0, 5).map((payload, index) => (
                <div key={payload.id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {payload.name || payload.title || `Payload ${index + 1}`}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {payload.description || payload.summary || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {payload.type && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Zap className="w-3 h-3 mr-1" />
                            {payload.type}
                          </span>
                        )}
                        {payload.mission && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Rocket className="w-3 h-3 mr-1" />
                            {payload.mission}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => fetchPayloadById(payload.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Hardware
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {hardware.slice(0, 5).map((item, index) => (
                <div key={item.id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {item.name || item.title || `Hardware ${index + 1}`}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {item.description || item.summary || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {item.type && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Settings className="w-3 h-3 mr-1" />
                            {item.type}
                          </span>
                        )}
                        {item.status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Active' ? 'bg-green-100 text-green-800' :
                            item.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <Activity className="w-3 h-3 mr-1" />
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => fetchHardwareById(item.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <Rocket className="w-5 h-5 mr-2" />
                Vehicles
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {vehicles.slice(0, 5).map((vehicle, index) => (
                <div key={vehicle.id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {vehicle.name || vehicle.title || `Vehicle ${index + 1}`}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {vehicle.description || vehicle.summary || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {vehicle.type && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Rocket className="w-3 h-3 mr-1" />
                            {vehicle.type}
                          </span>
                        )}
                        {vehicle.agency && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Award className="w-3 h-3 mr-1" />
                            {vehicle.agency}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => fetchVehicleById(vehicle.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {studyMetadata && selectedStudy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Study Details</h2>
                <button
                  onClick={() => {
                    setStudyMetadata(null);
                    setSelectedStudy(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                {studyMetadata.title || studyMetadata.name || 'Study Information'}
              </h3>
              <div className="space-y-4">
                {studyMetadata.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{studyMetadata.description}</p>
                  </div>
                )}
                {studyMetadata.organism && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Organism</h4>
                    <p className="text-gray-600">{studyMetadata.organism}</p>
                  </div>
                )}
                {studyMetadata.studyType && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Study Type</h4>
                    <p className="text-gray-600">{studyMetadata.studyType}</p>
                  </div>
                )}
                {studyMetadata.platforms && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {studyMetadata.platforms.map((platform, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {studyMetadata.publications && studyMetadata.publications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Publications</h4>
                    <ul className="space-y-2">
                      {studyMetadata.publications.map((pub, index) => (
                        <li key={index} className="text-blue-600 hover:text-blue-700">
                          <a href={pub.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            {pub.title || pub.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {Object.keys(studyFiles).length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Study Files</h2>
          </div>
          <div className="p-6">
            {Object.entries(studyFiles).map(([category, files]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-medium mb-3 capitalize">{category}</h3>
                <div className="space-y-2">
                  {Array.isArray(files) ? files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{file.name || `File ${index + 1}`}</div>
                          {file.size && (
                            <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file.url, file.name)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )) : (
                    <div className="text-gray-500">No files available in this category</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OsdrDashboard;