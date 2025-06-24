import { useEffect, useState } from 'react';
import { fetchInsight } from '../api/nasaAPI';
import Loader from '../components/common/Loader';
import InsightWeather from '../components/InsightWeather';

export default function Insight() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('weather'); 

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔍 Loading InSight data...');
        
        const response = await fetchInsight();
        console.log('📡 InSight data loaded:', response);
        
        setData(response.data || response);
      } catch (err) {
        console.error('❌ Failed to load InSight data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🚀</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">NASA InSight Mars Weather</h1>
                <p className="text-gray-600">Real-time weather data from the Red Planet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('weather')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'weather'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Weather View
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Raw Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'weather' ? (
          <InsightWeather />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Raw API Response</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>🔍</span>
                <span>Developer Mode</span>
              </div>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600">ℹ️</span>
                <h3 className="font-semibold text-blue-800">Raw Data Information</h3>
              </div>
              <p className="text-sm text-blue-700">
                This view shows the unprocessed JSON response from NASA's InSight Weather API. 
                Use this for debugging or understanding the data structure. Switch to "Weather View" 
                for a user-friendly interface.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">About InSight</h3>
              <p className="text-gray-300 text-sm">
                NASA's InSight mission landed on Mars in November 2018 to study the planet's interior. 
                The mission officially ended in December 2022 but left behind a treasure trove of weather data.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Weather Instruments</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Temperature and Wind for InSight (TWINS)</li>
                <li>• Auxiliary Payload Sensor Suite (APSS)</li>
                <li>• Pressure sensor and magnetometer</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Data Details</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Sol: Martian solar day (~24h 37min)</li>
                <li>• Temperatures in Celsius</li>
                <li>• Pressure in Pascals</li>
                <li>• Wind speed in meters per second</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              Data provided by NASA's InSight Mars Mission • 
              <a href="https://mars.nasa.gov/insight/" className="text-blue-400 hover:text-blue-300 ml-1">
                Learn more about InSight
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}