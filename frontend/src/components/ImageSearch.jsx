// // src/components/ImageSearch.jsx
// import { useState } from 'react';
// import { fetchMediaLibrary } from '../api/nasaAPI';
// import Loader from './common/Loader';

// export default function ImageSearch() {
//   const [results, setResults] = useState([]);
//   const [q, setQ] = useState('');
//   const [loading, setLoading] = useState(false);

//   const onSearch = () => {
//     setLoading(true);
//     fetchMediaLibrary({ q }).then(res => setResults(res.data.collection.items))
//       .finally(() => setLoading(false));
//   };

//   return (
//     <div>
//       <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." />
//       <button onClick={onSearch}>Search</button>
//       {loading ? <Loader /> : (
//         <div className="grid grid-cols-3 gap-4 mt-4">
//           {results.map((item, i) => (
//             <img key={i} src={item.links?.[0]?.href} alt="" />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// placeholder code