import { useState } from 'react';

export default function ExoplanetTable({ exoplanets }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedExoplanets = [...exoplanets].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const aNum = parseFloat(aValue);
    const bNum = parseFloat(bValue);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (sortConfig.direction === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  const formatValue = (value, type = 'default') => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-500">N/A</span>;
    }
    
    switch (type) {
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? <span className="text-gray-500">N/A</span> : num.toFixed(3);
      case 'integer':
        const int = parseInt(value);
        return isNaN(int) ? <span className="text-gray-500">N/A</span> : int;
      case 'year':
        const year = parseInt(value);
        return isNaN(year) ? <span className="text-gray-500">N/A</span> : year;
      default:
        return String(value);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const PlanetModal = ({ planet, onClose }) => {
    if (!planet) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{planet.pl_name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Host Star:</span>
                  <span className="text-white ml-2">{formatValue(planet.hostname)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Discovery Method:</span>
                  <span className="text-white ml-2">{formatValue(planet.discoverymethod)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Discovery Year:</span>
                  <span className="text-white ml-2">{formatValue(planet.disc_year, 'year')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Orbital Period (days):</span>
                  <span className="text-white ml-2">{formatValue(planet.pl_orbper, 'number')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Planet Radius (Earth radii):</span>
                  <span className="text-white ml-2">{formatValue(planet.pl_rade, 'number')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Planet Mass (Earth masses):</span>
                  <span className="text-white ml-2">{formatValue(planet.pl_masse, 'number')}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Equilibrium Temperature (K):</span>
                  <span className="text-white ml-2">{formatValue(planet.pl_eqt, 'number')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Stellar Spectral Type:</span>
                  <span className="text-white ml-2">{formatValue(planet.st_spectype)}</span>
                </div>
                <div>
                  <span className="text-gray-400">System Distance (parsecs):</span>
                  <span className="text-white ml-2">{formatValue(planet.sy_dist, 'number')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Number of Stars:</span>
                  <span className="text-white ml-2">{formatValue(planet.sy_snum, 'integer')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Number of Planets:</span>
                  <span className="text-white ml-2">{formatValue(planet.sy_pnum, 'integer')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tableHeaders = [
    { key: 'pl_name', label: 'Planet Name', sortable: true },
    { key: 'hostname', label: 'Host Star', sortable: true },
    { key: 'discoverymethod', label: 'Discovery Method', sortable: true },
    { key: 'disc_year', label: 'Year', sortable: true },
    { key: 'pl_orbper', label: 'Orbital Period (days)', sortable: true },
    { key: 'pl_rade', label: 'Radius (R⊕)', sortable: true },
    { key: 'pl_masse', label: 'Mass (M⊕)', sortable: true },
    { key: 'sy_dist', label: 'Distance (pc)', sortable: true }
  ];

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                      header.sortable ? 'cursor-pointer hover:bg-gray-600' : ''
                    }`}
                    onClick={header.sortable ? () => handleSort(header.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {header.label}
                      {header.sortable && (
                        <span className="text-gray-400 text-sm">
                          {getSortIcon(header.key)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedExoplanets.map((planet, index) => (
                <tr
                  key={planet.pl_name || index}
                  className="hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {formatValue(planet.pl_name)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatValue(planet.hostname)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                      {formatValue(planet.discoverymethod)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatValue(planet.disc_year, 'year')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatValue(planet.pl_orbper, 'number')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatValue(planet.pl_rade, 'number')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatValue(planet.pl_masse, 'number')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatValue(planet.sy_dist, 'number')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => setSelectedPlanet(planet)}
                      className="text-blue-400 hover:text-blue-300 text-xs bg-blue-900 hover:bg-blue-800 px-2 py-1 rounded transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedExoplanets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No exoplanets to display</p>
          </div>
        )}
      </div>

      <PlanetModal
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />
    </>
  );
}