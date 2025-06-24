import OsdrDashboard from '../components/OsdrDashboard';

export default function Osdr() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            NASA Open Science Data Repository
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Explore and analyze space biology and life sciences data from NASA's Open Science Data Repository. 
            Search through experiments, missions, and research studies to discover insights from space-based research.
          </p>
        </div>
        <OsdrDashboard />
      </div>
    </div>
  );
}