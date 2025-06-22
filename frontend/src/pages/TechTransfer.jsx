// // src/pages/TechTransfer.jsx
// import { useEffect, useState } from 'react';
// import { fetchTechTransfer } from '../api/nasaAPI';
// import Loader from '../components/common/Loader';

// export default function TechTransfer() {
//   const [items, setItems] = useState([]);
//   useEffect(() => {
//     fetchTechTransfer().then(res => setItems(res.data.results));
//   }, []);
//   return items.length ? (
//     <ul>{items.map(i => (
//       <li key={i.id}>{i.title} – <a href={i.pdf}>PDF</a></li>
//     ))}</ul>
//   ) : <Loader />;
// }
// placeholder code