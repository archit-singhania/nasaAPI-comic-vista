import EonetMap from '../components/EonetMap';

export default function Eonet() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Earth Natural Events
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Real-time tracking of natural events around the world including wildfires, 
            severe storms, earthquakes, volcanoes, and more. Data is sourced from NASA's 
            Earth Observatory Natural Event Tracker (EONET) system.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Source</p>
                <p className="text-lg font-semibold text-gray-900">NASA EONET</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-lg font-semibold text-gray-900">Loading...</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Update Frequency</p>
                <p className="text-lg font-semibold text-gray-900">Real-time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-lg font-semibold text-gray-900">13 Types</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <EonetMap />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About Natural Events</h2>
            <div className="space-y-3 text-gray-600">
              <p>
                This interactive map displays natural events occurring around the world in near real-time. 
                Events are categorized by type and shown with different colored markers on the map.
              </p>
              <p>
                Click on any marker to view detailed information about the event, including its status, 
                duration, data sources, and timeline of updates.
              </p>
              <p>
                Use the filters above the map to customize your view by event type, status, or time range.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Categories</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">🔥 Wildfires</span>
                <span className="text-gray-500">Forest and brush fires</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">⛈️ Severe Storms</span>
                <span className="text-gray-500">Hurricanes, cyclones, typhoons</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">🌋 Volcanoes</span>
                <span className="text-gray-500">Volcanic eruptions and activity</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">🧊 Sea and Lake Ice</span>
                <span className="text-gray-500">Ice formation and melting</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">🌍 Earthquakes</span>
                <span className="text-gray-500">Seismic activity</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">🌊 Floods</span>
                <span className="text-gray-500">Flooding events</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">⛄ Snow</span>
                <span className="text-gray-500">Significant snowfall</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">🏔️ Landslides</span>
                <span className="text-gray-500">Ground movement events</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Data provided by NASA's Earth Observatory Natural Event Tracker (EONET). 
            Events are updated continuously as new information becomes available.
          </p>
          <p className="mt-2">
            For more information, visit{' '}
            <a 
              href="https://eonet.gsfc.nasa.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              NASA EONET
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}