import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

export default function EarthMap() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [imagery, setImagery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSatelliteImagery = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    setImagery(null);
    
    try {
      console.log(`Fetching imagery for: ${lat}, ${lon}`);
      
      const response = await fetch(
        `http://localhost:5050/api/earth/imagery?lat=${lat}&lon=${lon}&dim=0.15`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (parseError) {
        }
        
        if (response.status === 404) {
          errorMessage = 'No satellite imagery available for this exact location. Try clicking on a different area.';
        } else if (response.status === 500) {
          errorMessage = 'NASA API is currently unavailable. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.url) {
        throw new Error('Invalid response: missing image URL');
      }

      try {
        const imageResponse = await fetch(data.url, { method: 'HEAD' });
        if (!imageResponse.ok) {
          throw new Error(`Image URL not accessible: ${imageResponse.status}`);
        }
      } catch (imageError) {
        console.warn('Image URL test failed:', imageError);
      }

      setImagery(data);
      
    } catch (err) {
        console.error('Error fetching satellite imagery:', err);
        
        let errorMessage = err.message;
        
        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
          errorMessage = 'Request timed out. The server is taking too long to respond.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to the server. Make sure your backend is running on port 5050.';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection and server status.';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'CORS error. Check if your backend allows requests from this origin.';
        } else if (err.message.includes('NASA API is currently')) {
          errorMessage = 'NASA servers are experiencing issues. Trying fallback imagery services...';
        } else if (err.message.includes('404')) {
          errorMessage = 'No satellite imagery available for this exact location. Try clicking on a different area or wait for fallback services.';
        }
        
        setError(errorMessage);
        
        if (err.message.includes('NASA API')) {
          setTimeout(() => {
            if (error === errorMessage) { 
              setError(null);
            }
          }, 5000);
        }
      } finally {
      setLoading(false);
    }
  }, []);

  const handleMapClick = useCallback((latlng) => {
    const { lat, lng } = latlng;
    console.log(`Map clicked at: ${lat}, ${lng}`);
    setSelectedLocation({ lat, lng });
    fetchSatelliteImagery(lat, lng);
  }, [fetchSatelliteImagery]);

  const testLocation = useCallback((lat, lng, name) => {
    console.log(`Testing ${name} at: ${lat}, ${lng}`);
    setSelectedLocation({ lat, lng });
    fetchSatelliteImagery(lat, lng);
  }, [fetchSatelliteImagery]);

  const testBackendConnection = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5050/api/earth/health');
      const data = await response.json();
      console.log('Backend health check:', data);
      alert('Backend connection successful!');
    } catch (error) {
      console.error('Backend connection failed:', error);
      alert('Backend connection failed. Make sure your server is running on port 3001.');
    }
  }, []);

  return (
    <div className="earth-map-container">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '600px', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup maxWidth={300} minWidth={250}>
              <div className="p-2">
                <h3 className="font-semibold mb-2">Selected Location</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Lat: {selectedLocation.lat.toFixed(6)}<br/>
                  Lng: {selectedLocation.lng.toFixed(6)}
                </p>
                
                {loading && (
                  <div className="flex items-center space-x-2 my-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm">Loading satellite imagery...</span>
                  </div>
                )}
                
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-2">
                    <strong>Error:</strong> {error}
                    <div className="mt-1 text-xs">
                      <button 
                        onClick={testBackendConnection}
                        className="text-blue-600 underline"
                      >
                        Test Backend Connection
                      </button>
                    </div>
                  </div>
                )}
                
                {imagery && !loading && !error && (
                  <div>
                    <img 
                      src={imagery.url} 
                      alt="Satellite imagery"
                      className="w-full max-w-xs h-48 object-cover rounded mb-2"
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        console.error('Failed URL:', imagery.url);
                        setError('Failed to load satellite image. The NASA API might be down or this location may not have available imagery.');
                      }}
                      crossOrigin="anonymous"
                    />
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Date:</strong> {imagery.date || 'Not specified'}</p>
                      <p><strong>Dimension:</strong> {imagery.dimension || 'N/A'}</p>
                      <a 
                        href={imagery.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline block"
                      >
                        View Full Resolution
                      </a>
                    </div>
                  </div>
                )}
                
                {!loading && !error && !imagery && (
                  <div className="text-gray-500 text-sm">
                    Click to load satellite imagery
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Instructions:</h3>
          <button 
            onClick={testBackendConnection}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Test Backend
          </button>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click anywhere on the map to select a location</li>
          <li>• Satellite imagery will be fetched for the selected coordinates</li>
          <li>• Click on the marker to view the imagery in a popup</li>
          <li>• Use mouse wheel to zoom in/out, drag to pan</li>
        </ul>
        
        <div className="mt-3 pt-3 border-t">
          <h4 className="font-medium text-gray-700 mb-2">Test Locations:</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => testLocation(1.5, 100.75, 'Singapore')}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Test Singapore
            </button>
            <button 
              onClick={() => testLocation(29.78, -95.33, 'Houston')}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
            >
              Test Houston
            </button>
            <button 
              onClick={() => testLocation(40.7128, -74.0060, 'New York')}
              className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
            >
              Test New York
            </button>
            <button 
              onClick={() => testLocation(51.5074, -0.1278, 'London')}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Test London
            </button>
          </div>
        </div>
      </div>
      
      {selectedLocation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Current Selection:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-600 text-sm">
                <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}<br/>
                <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
            {imagery && (
              <div>
                <p className="text-blue-600 text-sm">
                  <strong>Image Date:</strong> {imagery.date || 'Not available'}<br/>
                  <strong>Status:</strong> {loading ? 'Loading...' : error ? 'Error' : 'Loaded'}
                </p>
                {imagery.url && (
                  <a 
                    href={imagery.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 text-sm underline mt-1 block"
                  >
                    Open Full Resolution Image
                  </a>
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              <strong>Debug Info:</strong> {error}
              <div className="mt-1">
                <strong>Backend URL:</strong> http://localhost:5050/api/earth/imagery
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}