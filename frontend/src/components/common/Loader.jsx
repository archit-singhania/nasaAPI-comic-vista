import { motion } from 'framer-motion';

export default function Loader() {
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
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.5, duration: 0.8 }}
       className="text-center"
     >
      <h2 
        className="text-2xl sm:text-4xl font-extrabold text-white mb-2"
        style={{ fontFamily: `'Orbitron', sans-serif'` }}
      >
        Celestial Data Nexus
      </h2>
      <p 
        className="text-lg sm:text-xl text-gray-300 font-light mb-2"
        style={{ fontFamily: `'Source Code Pro', monospace'` }}
      >
        Fetching real-time data from the edge of the universe — one API call at a time.
      </p>
      <p 
        className="text-sm sm:text-base text-white italic"
        style={{ fontFamily: `'Source Code Pro', monospace'` }}
      >
        ⚙️ Initial launch sequence includes a short 2-second delay to load cosmic assets...
      </p>
     </motion.div>
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