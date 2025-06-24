import EarthMap from '../components/EarthMap';

export default function Earth() {
  return (
    <div className="earth-page">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Earth Satellite Imagery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore high-resolution satellite imagery of Earth from NASA's collection. 
            Click on any location to view detailed satellite images.
          </p>
        </header>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-700">
              Interactive Satellite Map
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click anywhere on the map to fetch satellite imagery for that location
            </p>
          </div>
          
          <EarthMap />
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              High Resolution
            </h3>
            <p className="text-blue-600">
              Access NASA's collection of high-resolution Earth imagery
            </p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Real-time Data
            </h3>
            <p className="text-green-600">
              Get the latest available satellite imagery for any location
            </p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Global Coverage
            </h3>
            <p className="text-purple-600">
              Explore satellite imagery from anywhere on Earth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}