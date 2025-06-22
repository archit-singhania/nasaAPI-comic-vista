// import { useEffect, useState } from 'react';
// import { fetchExoplanet } from '../api/nasaAPI';
// import Loader from '../components/common/Loader';

// export default function Exoplanet() {
//   const [rows, setRows] = useState([]);
//   useEffect(() => {
//     fetchExoplanet({ query: "select+*+from+ps" }).then(res => setRows(res.data));
//   }, []);
//   return rows.length === 0 ? <Loader /> : (
//     <table className="table-auto">
//       <thead><tr><th>Name</th><th>Period</th></tr></thead>
//       <tbody>{rows.map(r => <tr key={r.pl_name}><td>{r.pl_name}</td><td>{r.pl_orbper}</td></tr>)}</tbody>
//     </table>
//   );
// }
// placeholder code