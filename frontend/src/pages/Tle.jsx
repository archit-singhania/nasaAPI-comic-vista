// // src/pages/Tle.jsx
// import { useEffect, useState } from 'react';
// import { fetchTle } from '../api/nasaAPI';
// import Loader from '../components/common/Loader';

// export default function Tle() {
//   const [data, setData] = useState(null);
//   useEffect(() => {
//     fetchTle({ name: 'ISS' }).then(res => setData(res.data));
//   }, []);
//   return data ? <pre>{JSON.stringify(data, null,2)}</pre> : <Loader />;
// }
// placeholder code