import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryColors = {
  Wildfires: 'red',
  Volcanoes: 'orange',
  SevereStorms: 'blue',
  Floods: 'cyan',
  Icebergs: 'lightblue',
  Earthquakes: 'purple'
};

const WmtsMap = ({ body, layer, format = 'jpg', events = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [mouseCoords, setMouseCoords] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
      });

      mapInstance.current = map;

      tileLayerRef.current = L.tileLayer(getTileUrl(body, layer, format), {
        attribution: '&copy; NASA Trek',
        maxZoom: 7,
      }).addTo(map);

      L.control.scale().addTo(map);

      map.on('zoomend', () => setZoomLevel(map.getZoom()));
      map.on('mousemove', e => setMouseCoords({ 
        lat: e.latlng.lat, 
        lng: e.latlng.lng 
      }));

      window.addEventListener('centerMap', e => {
        const { lat, lng } = e.detail;
        map.setView([lat, lng], map.getZoom());
      });
    }

    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(body, layer, format));
    }
  }, [body, layer, format]);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach(marker => {
      mapInstance.current.removeLayer(marker);
    });
    markersRef.current = [];

    const markers = events.map(event => {
      const latest = event.geometry?.[event.geometry.length - 1];
      if (!latest) return null;

      const [lng, lat] = latest.coordinates;
      const category = event.categories?.[0]?.title || 'Other';
      const color = categoryColors[category] || 'gray';

      const icon = L.divIcon({
        html: `<div style="background:${color}; width:12px; height:12px; border-radius:50%; border: 2px solid white;"></div>`,
        className: 'custom-event-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>${event.title}</strong><br/>
            <em>Category: ${category}</em><br/>
            <em>Date: ${new Date(latest.date).toLocaleString()}</em><br/>
            ${event.link ? `<a href="${event.link}" target="_blank" style="color:#3b82f6">View Details</a>` : ''}
          </div>
        `);

      return marker;
    }).filter(Boolean);

    markers.forEach(marker => {
      marker.addTo(mapInstance.current);
      markersRef.current.push(marker);
    });
  }, [events]);

  const getTileUrl = (body, layer, format) =>
    `https://nasaapi-comic-vista-backend.onrender.com/api/wmts/tile/${body}/${layer}/{z}/{x}/{y}?format=${format}`;

  return (
    <div className="w-full h-[70vh] relative">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow border border-gray-700" />
      <div className="absolute bottom-2 left-2 bg-black/70 text-gray-200 text-sm p-2 rounded shadow">
        <div><strong>Zoom:</strong> {zoomLevel}</div>
        <div>
          <strong>Lat:</strong> {mouseCoords.lat.toFixed(4)} | 
          <strong>Lng:</strong> {mouseCoords.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};

export default WmtsMap;