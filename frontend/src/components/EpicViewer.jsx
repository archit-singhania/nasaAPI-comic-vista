import { useEffect, useState, useCallback } from 'react';
import { 
  fetchEpicNatural, 
  fetchEpicEnhanced, 
  fetchEpicNaturalByDate, 
  fetchEpicEnhancedByDate,
  getEpicImageUrl 
} from '../api/nasaAPI';
import Loader from './common/Loader';

export default function EpicViewer() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageType, setImageType] = useState('natural'); 
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFormat, setImageFormat] = useState('jpg');

  const loadImages = useCallback(async () => {
    try {
        setLoading(true);
        setError('');
        
        let response;
        if (selectedDate) {
        console.log('📅 Fetching by date:', selectedDate);
        response = imageType === 'natural' 
            ? await fetchEpicNaturalByDate(selectedDate)
            : await fetchEpicEnhancedByDate(selectedDate);
        } else {
        console.log('📸 Fetching latest images');
        response = imageType === 'natural' 
            ? await fetchEpicNatural()
            : await fetchEpicEnhanced();
        }
        
        const data = response?.data || response;
        setImages(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error('❌ Frontend Error:', err);
        setError(`Failed to load images: ${err.message}`);
        setImages([]);
    } finally {
        setLoading(false);
    }
    }, [imageType, selectedDate]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const clearDate = () => {
    setSelectedDate('');
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const downloadImage = (image) => {
    const imageUrl = getEpicImageUrl(image, imageType, imageFormat);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${image.image}.${imageFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Images</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadImages}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setImageType('natural')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                imageType === 'natural' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Natural Color
            </button>
            <button
              onClick={() => setImageType('enhanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                imageType === 'enhanced' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Enhanced Color
            </button>
          </div>
          
          <div className="flex gap-2 items-center">
            <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              max={new Date().toISOString().split('T')[0]}
            />
            {selectedDate && (
              <button
                onClick={clearDate}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Show Latest
              </button>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Format:</span>
            <select
              value={imageFormat}
              onChange={(e) => setImageFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Available</h3>
            <p className="text-gray-600">
              {selectedDate 
                ? "No images are available for the selected date. Try choosing a different date."
                : "No recent images are available at the moment."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <div key={`${img.image}-${index}`} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative group">
                <img
                  src={getEpicImageUrl(img, imageType, imageFormat)}
                  alt={img.caption || `EPIC Earth image ${img.image}`}
                  className="w-full h-64 object-cover cursor-pointer"
                  onClick={() => handleImageClick(img)}
                  onError={(e) => {
                    if (e.target.src.includes('.jpg')) {
                      e.target.src = getEpicImageUrl(img, imageType, 'png');
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleImageClick(img)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-lg font-medium"
                  >
                    View Full Size
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-800">{img.image}</h3>
                  <button
                    onClick={() => downloadImage(img)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Download Image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
                {img.caption && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{img.caption}</p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>📅 {new Date(img.date).toLocaleString()}</p>
                  {img.centroid_coordinates && (
                    <p>📍 {img.centroid_coordinates.lat.toFixed(2)}°, {img.centroid_coordinates.lon.toFixed(2)}°</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">{selectedImage.image}</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <img
                src={getEpicImageUrl(selectedImage, imageType, imageFormat)}
                alt={selectedImage.caption || `EPIC Earth image ${selectedImage.image}`}
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 space-y-2">
                {selectedImage.caption && (
                  <p className="text-gray-700">{selectedImage.caption}</p>
                )}
                <p className="text-sm text-gray-500">
                  📅 {new Date(selectedImage.date).toLocaleString()}
                </p>
                {selectedImage.centroid_coordinates && (
                  <p className="text-sm text-gray-500">
                    📍 Coordinates: {selectedImage.centroid_coordinates.lat.toFixed(4)}°, {selectedImage.centroid_coordinates.lon.toFixed(4)}°
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}