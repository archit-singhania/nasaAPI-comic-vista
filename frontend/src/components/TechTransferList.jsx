import { useState } from 'react';

export default function TechTransferList({ items, category, loading, onItemSelect }) {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'patents':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'software':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'spinoffs':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const renderPatentItem = (item, index) => {
    const itemId = item.id || `patent-${index}`;
    const isExpanded = expandedItems.has(itemId);
    
    return (
      <div key={itemId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600">
                {getCategoryIcon('patents')}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title || item[0] || 'Untitled Patent'}
                </h3>
                {item.patent_number && (
                  <p className="text-sm text-gray-500">Patent #: {item.patent_number}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {item.pdf && (
                <a
                  href={item.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="View PDF"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
              )}
              <button
                onClick={() => toggleExpanded(itemId)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg 
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {item.abstract && (
              <p>{isExpanded ? item.abstract : truncateText(item.abstract)}</p>
            )}
            
            {isExpanded && (
              <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                {item.inventor && (
                  <p><span className="font-medium">Inventor:</span> {item.inventor}</p>
                )}
                {item.issued_date && (
                  <p><span className="font-medium">Issued:</span> {formatDate(item.issued_date)}</p>
                )}
                {item.expiration_date && (
                  <p><span className="font-medium">Expires:</span> {formatDate(item.expiration_date)}</p>
                )}
                {item.categories && item.categories.length > 0 && (
                  <div>
                    <span className="font-medium">Categories: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.categories.map((cat, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSoftwareItem = (item, index) => {
    const itemId = item.id || `software-${index}`;
    const isExpanded = expandedItems.has(itemId);
    
    return (
      <div key={itemId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-green-600">
                {getCategoryIcon('software')}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title || item.software_title || item[0] || 'Untitled Software'}
                </h3>
                {item.version && (
                  <p className="text-sm text-gray-500">Version: {item.version}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleExpanded(itemId)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {item.description && (
              <p>{isExpanded ? item.description : truncateText(item.description)}</p>
            )}
            
            {isExpanded && (
              <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                {item.release_date && (
                  <p><span className="font-medium">Released:</span> {formatDate(item.release_date)}</p>
                )}
                {item.license && (
                  <p><span className="font-medium">License:</span> {item.license}</p>
                )}
                {item.programming_language && (
                  <div>
                    <span className="font-medium">Language: </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {item.programming_language}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSpinoffItem = (item, index) => {
    const itemId = item.id || `spinoff-${index}`;
    const isExpanded = expandedItems.has(itemId);
    
    return (
      <div key={itemId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-purple-600">
                {getCategoryIcon('spinoffs')}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title || item.spinoff_title || item[0] || 'Untitled Spinoff'}
                </h3>
                {item.company && (
                  <p className="text-sm text-gray-500">Company: {item.company}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleExpanded(itemId)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {item.description && (
              <p>{isExpanded ? item.description : truncateText(item.description)}</p>
            )}
            
            {isExpanded && (
              <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                {item.publication_year && (
                  <p><span className="font-medium">Year:</span> {item.publication_year}</p>
                )}
                {item.nasa_center && (
                  <p><span className="font-medium">NASA Center:</span> {item.nasa_center}</p>
                )}
                {item.benefits && item.benefits.length > 0 && (
                  <div>
                    <span className="font-medium">Benefits: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.benefits.map((benefit, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                <div className="h-3 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">
            No {category} were found matching your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 capitalize">
          {category} ({items.length} results)
        </h2>
        <div className="text-sm text-gray-500">
          Click to expand details
        </div>
      </div>
      
      <div className="space-y-4">
        {items.map((item, index) => {
          const processedItem = Array.isArray(item) ? {
            title: item[0],
            description: item[1],
            id: index
          } : item;

          switch (category) {
            case 'patents':
              return renderPatentItem(processedItem, index);
            case 'software':
              return renderSoftwareItem(processedItem, index);
            case 'spinoffs':
              return renderSpinoffItem(processedItem, index);
            default:
              return renderPatentItem(processedItem, index);
          }
        })}
      </div>
    </div>
  );
}