import { useState } from 'react';
import UnderDevelopmentLoader from '../components/common/underDevLoader';

export default function TechTransfer() {
  const IN_DEVELOPMENT = true;  

  const [category, setCategory] = useState('patents');
  const [searchQuery, setSearchQuery] = useState('');

  if (IN_DEVELOPMENT) {
    console.error = () => {}; 

    return (
      <UnderDevelopmentLoader 
        title="Tech Transfer Portal"
        subtitle="Building an amazing experience for exploring NASA's technology innovations!"
        estimatedTime="Q3 2025"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NASA Technology Transfer
            </h1>
            <p className="text-gray-600">
              {getCategoryDescription(category)}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {['patents', 'software', 'spinoffs'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${category}...`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          <UnderDevelopmentLoader 
            title="Tech Transfer Portal"
            subtitle="We're building an amazing experience for exploring NASA's technology innovations!"
            estimatedTime="Q2 2025"
          />
        </div>
      </div>
    </div>
  );
}

const getCategoryDescription = (cat) => {
  switch (cat) {
    case 'patents':
      return 'Explore NASA\'s patent portfolio - innovations available for licensing and technology transfer.';
    case 'software':
      return 'Discover NASA software packages available for download and use.';
    case 'spinoffs':
      return 'Learn about NASA technologies that have been successfully commercialized.';
    default:
      return 'Explore NASA\'s technology transfer opportunities.';
  }
};