// import { useEffect, useState } from 'react';
// import { fetchEpicNatural } from '../api/nasaAPI';
// import Loader from './common/Loader';

// export default function EpicViewer() {
//   const [images, setImages] = useState([]);
//   useEffect(() => {
//     fetchEpicNatural().then(res => setImages(res.data));
//   }, []);
//   if (!images.length) return <Loader />;
//   return (
//     <div className="grid grid-cols-3 gap-4">
//       {images.map(img => (
//         <img
//           key={img.image}
//           src={`https://api.nasa.gov/EPIC/archive/natural/${img.date.slice(0,10).replace(/-/g,'/')}/jpg/${img.image}.jpg?api_key=${import.meta.env.REACT_APP_BACKEND_URL}`}
//           alt={img.caption}
//         />
//       ))}
//     </div>
//   );
// }
// placeholder code