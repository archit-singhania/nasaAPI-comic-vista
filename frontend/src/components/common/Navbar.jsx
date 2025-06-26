import { NavLink } from 'react-router-dom';

const links = [
  { name: 'Home', path: '/' },
  { name: 'APOD', path: '/apod' },
  { name: 'Mars Rover', path: '/marsrover' },
  { name: 'Asteroids', path: '/asteroids' },
  { name: 'EPIC', path: '/epic' },
  { name: 'Earth', path: '/earth' },
  { name: 'DONKI', path: '/donki' },
  { name: 'EONET', path: '/eonet' },
  { name: 'Insight', path: '/insight' },
  { name: 'Exoplanet', path: '/exoplanet' },
  { name: 'OSDR', path: '/osdr' },
  { name: 'Media', path: '/media' },
  { name: 'TechTransfer', path: '/techtransfer' },
  { name: 'TLE', path: '/tle' },
  { name: 'WMTS', path: '/wmts' }
];

const Navbar = () => {
  return (
    <nav className="bg-black border-b border-gray-800 shadow">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
        <span className="text-xl font-bold text-white">☄️🔭NASA Explorer🧑‍🚀🚀🛰️</span>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
          {links.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm ${isActive ? 'text-indigo-400 font-bold' : 'text-gray-400'} hover:text-white`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
