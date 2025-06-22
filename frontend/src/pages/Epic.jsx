import EpicViewer from '../components/EpicViewer';

export default function Epic() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          EPIC Earth Images
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          View full-disc imagery of Earth from NASA's DSCOVR satellite, positioned at the
          Earth-Sun Lagrange point. Choose between natural and enhanced color images.
        </p>
      </div>
      <EpicViewer />
    </div>
  );
}