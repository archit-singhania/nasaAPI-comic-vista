// import React, { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// const WmtsMap = () => {
//   const mapRef = useRef(null);

//   useEffect(() => {
//     const map = L.map(mapRef.current).setView([0, 0], 2);

//     L.tileLayer('https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd/{z}/{x}/{y}.jpg', {
//       attribution: '&copy; NASA Moon Trek',
//       maxZoom: 7,
//     }).addTo(map);

//     return () => map.remove();
//   }, []);

//   return (
//     <div className="w-full h-[80vh]">
//       <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg border border-gray-700" />
//     </div>
//   );
// };

// export default WmtsMap;
// placeholder code