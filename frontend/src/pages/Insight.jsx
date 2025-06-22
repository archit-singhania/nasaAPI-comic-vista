// // src/pages/Insight.jsx
// import { useEffect, useState } from 'react';
// import { fetchInsight } from '../api/nasaAPI';
// import Loader from '../components/common/Loader';

// export default function Insight() {
//   const [data, setData] = useState(null);
//   useEffect(() => {
//     fetchInsight().then(res => setData(res.data));
//   }, []);
//   return data ? <pre>{JSON.stringify(data, null,2)}</pre> : <Loader />;
// }
// placeholder code