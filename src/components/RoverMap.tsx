import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import type { Rover } from '@/data/types';
import 'leaflet/dist/leaflet.css';

interface RoverMapProps {
  rovers: Rover[];
  districtCentroid: [number, number];
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10);
    map.invalidateSize();
  }, [map, center]);
  return null;
}

function createRoverIcon(status: Rover['status'], heading: number): L.DivIcon {
  const colors = {
    online: '#06B6D4',
    offline: '#EF4444',
    'low-battery': '#F59E0B',
  };

  return L.divIcon({
    className: 'rover-marker',
    html: `<svg width="14" height="14" viewBox="0 0 14 14" style="transform: rotate(${heading}deg);">
      <polygon points="7,0 14,14 7,10 0,14" fill="${colors[status]}" stroke="#0B0C10" stroke-width="1.5"/>
    </svg>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function RoverMap({ rovers, districtCentroid }: RoverMapProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <MapContainer
        center={districtCentroid}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: 'var(--map-bg)' }}
        zoomControl={true}
      >
        <MapController center={districtCentroid} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {rovers.map((rover) => (
          <Marker
            key={rover.id}
            position={[rover.lat, rover.lng]}
            icon={createRoverIcon(rover.status, rover.heading)}
            eventHandlers={{
              click: () => navigate(`/rover/${rover.id}`),
            }}
          >
            <Popup className="dark-popup">
              <div className="p-2" style={{ minWidth: '180px' }}>
                <h4 className="font-mono-data font-bold text-sm mb-1"
                  style={{ color: 'var(--primary-cyan)' }}>
                  {rover.id}
                </h4>
                <p className="text-xs mb-1 font-mono-data" style={{ color: 'var(--text-secondary)' }}>
                  {rover.ptsLicence}
                </p>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Battery: {rover.battery}%
                </p>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  Last sync: {getRelativeTime(rover.lastSync)}
                </p>
                <button
                  onClick={() => navigate(`/rover/${rover.id}`)}
                  className="text-xs font-mono-data uppercase tracking-wider"
                  style={{ color: 'var(--primary-cyan)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  View Rover &rarr;
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
