import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

async function geocodeLocation(placeName) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`
  );
  const data = await res.json();
  if (data.length === 0) throw new Error("Location not found.");
  const { lat, lon } = data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  return data.display_name || "Unknown location";
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      onMapClick({ lat, lng, address });
    },
  });
  return null;
}

export default function MapView() {
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const coords = await geocodeLocation(place);
      setLocation({ ...coords, address: `Search result for "${place}"` });
      setError(null);
    } catch (err) {
      setError(err.message);
      setLocation(null);
    }
  };

  const handleMapClick = (coords) => {
    setLocation(coords);
    setPlace(coords.address); // optional: update input
    console.log(coords);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Search or Click on the Map</h2>
      <input
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        placeholder="Enter a location"
        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
      />
      <button onClick={handleSearch} style={{ padding: '0.5rem' }}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {location && (
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: "400px", width: "100%", marginTop: '1rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={handleMapClick} />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              {location.address}
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
}
