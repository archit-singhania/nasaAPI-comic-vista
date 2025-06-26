import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCategoryIcon = (category, isActive = true) => {
  const categoryColors = {
    'Wildfires': '#FF4444',
    'Severe Storms': '#4444FF', 
    'Volcanoes': '#FF8800',
    'Sea and Lake Ice': '#00DDFF',
    'Earthquakes': '#8B4513',
    'Floods': '#0066CC',
    'Landslides': '#654321',
    'Manmade': '#800080',
    'Snow': '#FFFFFF',
    'Water Color': '#00FF88',
    'Dust and Haze': '#DAA520',
    'Drought': '#DEB887',
    'Temperature Extremes': '#FF69B4'
  };
  
  const color = categoryColors[category] || '#666666';
  const opacity = isActive ? 1.0 : 0.6;
  
  return L.divIcon({
    className: 'custom-event-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        opacity: ${opacity};
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function EonetMap() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    days: 30,
    showActive: true,
    showClosed: true
  });
  const [stats, setStats] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.category && filters.category !== '') queryParams.append('category', filters.category);
      if (filters.days) queryParams.append('days', filters.days);
      queryParams.append('limit', '200');

      console.log('Fetching events with filters:', filters);
      
      const response = await fetch(
        `https://nasaapi-comic-vista-backend.onrender.com/api/eonet/events?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (parseError) {
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Fetched events:', data.events?.length || 0);
      
      setEvents(data.events || []);
      
    } catch (err) {
      console.error('Error fetching events:', err);
      let errorMessage = err.message;
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Make sure your backend is running on port 5050.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and server status.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('https://nasaapi-comic-vista-backend.onrender.com/api/eonet/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      
      console.log('Categories response:', data);
      
      let categoriesArray;
      if (data.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      } else {
        throw new Error('Invalid categories response format');
      }
      
      setCategories(categoriesArray);
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      
      const fallbackCategories = [
        { id: 'drought', title: 'Drought' },
        { id: 'dustHaze', title: 'Dust and Haze' },
        { id: 'earthquakes', title: 'Earthquakes' },
        { id: 'floods', title: 'Floods' },
        { id: 'landslides', title: 'Landslides' },
        { id: 'manmade', title: 'Manmade' },
        { id: 'seaLakeIce', title: 'Sea and Lake Ice' },
        { id: 'severeStorms', title: 'Severe Storms' },
        { id: 'snow', title: 'Snow' },
        { id: 'tempExtremes', title: 'Temperature Extremes' },
        { id: 'volcanoes', title: 'Volcanoes' },
        { id: 'waterColor', title: 'Water Color' },
        { id: 'wildfires', title: 'Wildfires' }
      ];
      setCategories(fallbackCategories);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`https://nasaapi-comic-vista-backend.onrender.com/api/eonet/stats?days=${filters.days}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [filters.days]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchStats();
  }, [fetchEvents, fetchCategories, fetchStats]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!filters.showActive && event.isActive) return false;
      if (!filters.showClosed && !event.isActive) return false;
      
      return true;
    });
  }, [events, filters.showActive, filters.showClosed]);

  const eventsByCategory = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach(event => {
      event.categories.forEach(cat => {
        const categoryTitle = cat.title || 'Unknown';
        if (!grouped[categoryTitle]) {
          grouped[categoryTitle] = [];
        }
        grouped[categoryTitle].push(event);
      });
    });
    return grouped;
  }, [filteredEvents]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatEventDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventCoordinates = (event) => {
    if (!event.latestGeometry || !event.latestGeometry.coordinates) {
      return null;
    }
    
    const coords = event.latestGeometry.coordinates;
    
    if (event.latestGeometry.type === 'Point') {
      return [coords[1], coords[0]]; 
    } else if (event.latestGeometry.type === 'Polygon' && coords[0] && coords[0][0]) {
      return [coords[0][0][1], coords[0][0][0]];
    }
    
    return null;
  };

  const renderEventMarker = (event) => {
    const coordinates = getEventCoordinates(event);
    if (!coordinates) return null;

    const primaryCategory = event.categories[0]?.title || 'Unknown';
    const icon = createCategoryIcon(primaryCategory, event.isActive);

    return (
      <Marker
        key={event.id}
        position={coordinates}
        icon={icon}
      >
        <Popup maxWidth={400} minWidth={300}>
          <div className="p-3">
            <h3 className="font-bold text-lg mb-2 text-gray-800">{event.title}</h3>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  event.isActive 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Category:</span>
                <span className="ml-2">
                  {event.categories.map(cat => cat.title).join(', ')}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Started:</span>
                <span className="ml-2">{formatEventDate(event.date)}</span>
              </div>
              
              {!event.isActive && event.closed && (
                <div>
                  <span className="font-semibold text-gray-600">Ended:</span>
                  <span className="ml-2">{formatEventDate(event.closed)}</span>
                </div>
              )}
              
              <div>
                <span className="font-semibold text-gray-600">Coordinates:</span>
                <span className="ml-2 text-xs font-mono">
                  {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Data Points:</span>
                <span className="ml-2">{event.totalGeometries}</span>
              </div>
              
              {event.sources && event.sources.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600">Sources:</span>
                  <div className="mt-1 space-y-1">
                    {event.sources.slice(0, 3).map((source, idx) => (
                      <div key={idx} className="text-xs">
                        {source.url ? (
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {source.id}
                          </a>
                        ) : (
                          <span>{source.id}</span>
                        )}
                      </div>
                    ))}
                    {event.sources.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{event.sources.length - 3} more sources
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedEvent(event)}
              className="mt-3 w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              View Details
            </button>
          </div>
        </Popup>
      </Marker>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading natural events...</span>
      </div>
    );
  }

  return (
    <div className="eonet-map-container">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Events</option>
              <option value="open">Active Only</option>
              <option value="closed">Closed Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range (days)
            </label>
            <select
              value={filters.days}
              onChange={(e) => handleFilterChange('days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 2 weeks</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 2 months</option>
              <option value={90}>Last 3 months</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>
          
          <div className="flex flex-col justify-end">
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              {loading ? 'Loading...' : 'Refresh Events'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showActive"
              checked={filters.showActive}
              onChange={(e) => handleFilterChange('showActive', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showActive" className="text-gray-700">Show Active Events</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showClosed"
              checked={filters.showClosed}
              onChange={(e) => handleFilterChange('showClosed', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showClosed" className="text-gray-700">Show Closed Events</label>
          </div>
        </div>
      </div>

      {stats && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredEvents.length}</div>
            <div className="text-blue-800">Filtered Events</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{filteredEvents.filter(e => e.isActive).length}</div>
            <div className="text-red-800">Active Events</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">{filteredEvents.filter(e => !e.isActive).length}</div>
            <div className="text-gray-800">Closed Events</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {filters.category ? '1' : Object.keys(eventsByCategory).length}
            </div>
            <div className="text-green-800">Categories</div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-semibold">Error loading events:</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      )}

      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '600px', width: '100%' }}
        className="rounded-lg"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>
          
          {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
            <LayersControl.Overlay checked key={category} name={`${category} (${categoryEvents.length})`}>
              <LayerGroup>
                {categoryEvents.map(event => renderEventMarker(event))}
              </LayerGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
      </MapContainer>
      
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedEvent.isActive 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEvent.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-600">Started:</span>
                    <span className="ml-2">{formatEventDate(selectedEvent.date)}</span>
                  </div>
                  
                  {!selectedEvent.isActive && selectedEvent.closed && (
                    <div>
                      <span className="font-semibold text-gray-600">Ended:</span>
                      <span className="ml-2">{formatEventDate(selectedEvent.closed)}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-semibold text-gray-600">Data Points:</span>
                    <span className="ml-2">{selectedEvent.totalGeometries}</span>
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">Categories:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedEvent.categories.map((cat, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {cat.title}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedEvent.latestGeometry && (
                  <div>
                    <span className="font-semibold text-gray-600">Latest Location:</span>
                    <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">
                      {getEventCoordinates(selectedEvent)?.join(', ')} 
                      <span className="text-gray-500 ml-2">
                        ({selectedEvent.latestGeometry.type})
                      </span>
                    </div>
                  </div>
                )}
                
                {selectedEvent.sources && selectedEvent.sources.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-600">Data Sources:</span>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {selectedEvent.sources.map((source, idx) => (
                        <div key={idx} className="text-sm border rounded p-2">
                          <div className="font-medium">{source.id}</div>
                          {source.url && (
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-xs"
                            >
                              View Source
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.geometries && selectedEvent.geometries.length > 1 && (
                  <div>
                    <span className="font-semibold text-gray-600">
                      Event Timeline ({selectedEvent.geometries.length} updates):
                    </span>
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {selectedEvent.geometries.map((geo, idx) => (
                        <div key={idx} className="text-xs border-l-2 border-blue-200 pl-3 py-1">
                          <div className="font-medium">
                            {geo.date ? formatEventDate(geo.date) : 'Date unknown'}
                          </div>
                          <div className="text-gray-500">
                            {geo.type} at {geo.coordinates ? 
                              (geo.type === 'Point' ? 
                                `${geo.coordinates[1]?.toFixed(4)}, ${geo.coordinates[0]?.toFixed(4)}` :
                                'Multiple coordinates'
                              ) : 'No coordinates'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedEvent.sources?.[0]?.url && (
                  <a
                    href={selectedEvent.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
                  >
                    View Official Source
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {[
            { name: 'Wildfires', color: '#FF4444' },
            { name: 'Severe Storms', color: '#4444FF' },
            { name: 'Volcanoes', color: '#FF8800' },
            { name: 'Sea and Lake Ice', color: '#00DDFF' },
            { name: 'Earthquakes', color: '#8B4513' },
            { name: 'Floods', color: '#0066CC' },
            { name: 'Landslides', color: '#654321' },
            { name: 'Manmade', color: '#800080' },
            { name: 'Snow', color: '#FFFFFF' },
            { name: 'Water Color', color: '#00FF88' },
            { name: 'Dust and Haze', color: '#DAA520' },
            { name: 'Drought', color: '#DEB887' },
            { name: 'Temperature Extremes', color: '#FF69B4' }
          ].map(category => (
            <div key={category.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-gray-700">{category.name}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <p>
            <strong>Active events</strong> are shown with full opacity. 
            <strong> Closed events</strong> are shown with reduced opacity.
            Click on any marker for detailed information.
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Natural event data provided by 
        <a 
          href="https://eonet.gsfc.nasa.gov/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline ml-1"
        >
          NASA EONET (Earth Observatory Natural Event Tracker)
        </a>
      </div>
    </div>
  );
}