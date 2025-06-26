import React, { useEffect, useState } from 'react';
import WmtsMap from '../components/WmtsMap';
import axios from 'axios';

const categoryIcons = {
  Wildfires: '🔥',
  Volcanoes: '🌋',
  SevereStorms: '⛈️',
  Floods: '🌊',
  Icebergs: '🧊',
  Earthquakes: '🌍'
};

const WmtsVisualizer = () => {
  const [bodies, setBodies] = useState([]);
  const [layers, setLayers] = useState([]);
  const [formats] = useState(['jpg', 'png', 'webp']);
  const [selectedBody, setSelectedBody] = useState('Moon');
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('jpg');
  const [eonetEvents, setEonetEvents] = useState([]);
  const [eventFilters, setEventFilters] = useState({});
  const [layerInfo, setLayerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBodies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://nasaapi-comic-vista-backend.onrender.com/api/wmts/bodies');
        setBodies(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch celestial bodies');
        console.error('Error fetching bodies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBodies();
  }, []);

  useEffect(() => {
    const fetchLayers = async () => {
      if (!selectedBody) return;

      try {
        setLoading(true);
        const response = await axios.get(`https://nasaapi-comic-vista-backend.onrender.com/api/wmts/layers/${selectedBody}`);
        setLayers(response.data);
        setSelectedLayer(response.data[0] || '');
        setError(null);
      } catch (err) {
        setError('Failed to fetch layers');
        console.error('Error fetching layers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLayers();
  }, [selectedBody]);

  useEffect(() => {
    const fetchLayerInfo = async () => {
      if (!selectedBody || !selectedLayer) return;

      try {
        const response = await axios.get(`https://nasaapi-comic-vista-backend.onrender.com/api/wmts/info/${selectedBody}/${selectedLayer}`);
        setLayerInfo(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch layer info');
        console.error('Error fetching layer info:', err);
      }
    };

    fetchLayerInfo();
  }, [selectedBody, selectedLayer]);

  useEffect(() => {
    const fetchEonetEvents = async () => {
      try {
        const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events');
        setEonetEvents(response.data.events || []);
      } catch (err) {
        console.error('Error fetching EONET events:', err);
      }
    };

    fetchEonetEvents();
  }, []);

  const toggleFilter = (category) => {
    setEventFilters(prev => ({ 
      ...prev, 
      [category]: !prev[category] 
    }));
  };

  const filteredEvents = eonetEvents.filter(event => {
    if (Object.keys(eventFilters).length === 0 || Object.values(eventFilters).every(v => !v)) {
      return true;
    }
    return event.categories?.some(cat => eventFilters[cat.title]);
  });

  const handleBodyChange = (e) => {
    setSelectedBody(e.target.value);
    setSelectedLayer('');
    setLayerInfo(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white space-y-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-400 mb-8 text-center">
          🌌 NASA WMTS Explorer with EONET Overlays
        </h1>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded p-4 mb-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-900 border border-blue-700 rounded p-4 mb-4">
            <p className="text-blue-200">Loading...</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-300">Map Controls</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Celestial Body</label>
              <select 
                value={selectedBody} 
                onChange={handleBodyChange}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white min-w-32"
              >
                <option value="">Select Body</option>
                {bodies.map(body => (
                  <option key={body} value={body}>{body}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Layer</label>
              <select 
                value={selectedLayer} 
                onChange={e => setSelectedLayer(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white min-w-32"
                disabled={!layers.length}
              >
                <option value="">Select Layer</option>
                {layers.map(layer => (
                  <option key={layer} value={layer}>{layer}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Format</label>
              <select 
                value={selectedFormat} 
                onChange={e => setSelectedFormat(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white min-w-32"
              >
                {formats.map(format => (
                  <option key={format} value={format}>{format.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-3 text-indigo-300">Event Filters</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(categoryIcons).map(([category, icon]) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!eventFilters[category]} 
                    onChange={() => toggleFilter(category)}
                    className="rounded"
                  />
                  <span className="text-sm">{icon} {category}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {filteredEvents.length} events shown
            </p>
          </div>
        </div>

        {layerInfo && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-indigo-300 mb-2">Layer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Body:</strong> {layerInfo.body}
              </div>
              <div>
                <strong>Layer:</strong> {layerInfo.layer}
              </div>
              <div>
                <strong>Max Zoom:</strong> {layerInfo.maxZoom}
              </div>
            </div>
          </div>
        )}

        {selectedBody && selectedLayer && (
          <div className="bg-gray-800 rounded-lg p-4">
            <WmtsMap 
              body={selectedBody} 
              layer={selectedLayer} 
              format={selectedFormat} 
              events={filteredEvents} 
            />
          </div>
        )}

        {!selectedBody && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">Please select a celestial body to view the map</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WmtsVisualizer;