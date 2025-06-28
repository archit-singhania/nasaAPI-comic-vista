import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
 { name: 'Home', path: '/' },
 { name: 'APOD', path: '/apod' },
 { name: 'Mars Rover', path: '/marsrover' },
 { name: 'Asteroids', path: '/asteroids' },
 { name: 'TLE', path: '/tle' },
 { name: 'Earth', path: '/earth' },
 { name: 'EONET', path: '/eonet' },
 { name: 'DONKI', path: '/donki' },
 { name: 'Insight', path: '/insight' },
 { name: 'EPIC', path: '/epic' },
 { name: 'OSDR', path: '/osdr' },
 { name: 'Exoplanet', path: '/exoplanet' },
 { name: 'Media', path: '/media' },
 { name: 'TechTransfer', path: '/techtransfer' },
 { name: 'WMTS', path: '/wmts' }
];

const Navbar = ({ isLoading = false }) => {
 if (isLoading) {
   return (
     <motion.div
       initial={{ opacity: 1 }}
       className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
     >
       <motion.div
         className="relative w-48 h-48 mb-8"
         initial="hidden"
         animate="visible"
         variants={{
           hidden: {},
           visible: {
             transition: {
               staggerChildren: 0.1,
               delayChildren: 0.2
             }
           }
         }}
       >
         {[...Array(20)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute rounded-full"
             style={{
               width: '4px',
               height: '4px',
               backgroundColor: '#fff',
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`
             }}
             variants={{
               hidden: { opacity: 0, scale: 0 },
               visible: {
                 opacity: [0, 1, 0],
                 scale: [0, 1.4, 0],
                 transition: {
                   duration: 1.5,
                   repeat: Infinity,
                   repeatDelay: Math.random() * 1.5
                 }
               }
             }}
           />
         ))}
       </motion.div>
     </motion.div>
   );
 }

 return (
   <motion.nav 
     initial={{ y: -100, opacity: 0 }}
     animate={{ y: 0, opacity: 1 }}
     transition={{ duration: 0.8, ease: "easeOut" }}
     className="bg-black border-b border-gray-800 shadow"
   >
     <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
       <motion.span 
         initial={{ x: -50, opacity: 0 }}
         animate={{ x: 0, opacity: 1 }}
         transition={{ delay: 0.3, duration: 0.6 }}
         className="text-xl font-bold text-white"
       >
         ☄️🔭AetherLink🧑‍🚀🚀🛰️
       </motion.span>
       <motion.div 
         initial={{ x: 50, opacity: 0 }}
         animate={{ x: 0, opacity: 1 }}
         transition={{ delay: 0.4, duration: 0.6 }}
         className="flex flex-wrap gap-3 mt-2 sm:mt-0"
       >
         {links.map((link, index) => (
          <motion.div
            key={link.name}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.4, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="inline-block"
            >
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `text-sm ${
                    isActive ? 'text-indigo-400 font-bold' : 'text-gray-400'
                  } hover:text-white transition-colors duration-200`
                }
              >
                {link.name}
              </NavLink>
            </motion.div>
          </motion.div>
        ))}
       </motion.div>
     </div>
   </motion.nav>
 );
};

export default Navbar;