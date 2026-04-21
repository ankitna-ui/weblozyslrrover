import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { districts } from '@/data/districts';
import { allRovers } from '@/data/rovers';
import type { District } from '@/data/types';
import 'leaflet/dist/leaflet.css';

interface DistrictMapProps {
  onDistrictSelect?: (districtId: string) => void;
}

function MapController() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function getDistrictActiveCount(districtId: string): number {
  return allRovers.filter(r => r.districtId === districtId && r.status === 'online').length;
}

function getMarkerRadius(count: number): number {
  return Math.sqrt(count) * 1.5;
}

export default function DistrictMap({ onDistrictSelect }: DistrictMapProps) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const maxActiveDistrict = useMemo(() => {
    return districts.reduce((max, d) => {
      const active = getDistrictActiveCount(d.id);
      return active > max.count ? { id: d.id, count: active } : max;
    }, { id: '', count: 0 });
  }, []);

  const handleMarkerClick = (district: District) => {
    if (onDistrictSelect) {
      onDistrictSelect(district.id);
    } else {
      navigate(`/district/${district.id}`);
    }
  };

  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <MapContainer
        ref={mapRef}
        center={[17.8, 79.2]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: 'var(--map-bg)' }}
        zoomControl={true}
      >
        <MapController />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {districts.map((district) => {
          const activeCount = getDistrictActiveCount(district.id);
          const radius = getMarkerRadius(district.roverCount);
          const isMaxActive = district.id === maxActiveDistrict.id;

          return (
            <CircleMarker
              key={district.id}
              center={district.centroid}
              radius={radius}
              pathOptions={{
                fillColor: 'var(--primary-cyan)',
                fillOpacity: isMaxActive ? 0.4 : 0.25,
                color: 'var(--primary-cyan)',
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => handleMarkerClick(district),
                mouseover: (e) => {
                  e.target.setStyle({ fillOpacity: 0.4, radius: radius * 1.2 });
                },
                mouseout: (e) => {
                  e.target.setStyle({ fillOpacity: isMaxActive ? 0.4 : 0.25, radius });
                },
              }}
            >
              <Popup className="dark-popup">
                <div className="p-2" style={{ minWidth: '180px' }}>
                  <h4 className="font-display font-medium text-sm mb-1"
                    style={{ color: 'var(--text-primary)' }}>
                    {district.name}
                  </h4>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Rovers: {district.roverCount}
                  </p>
                  <p className="text-xs mb-2" style={{
                    color: activeCount === district.roverCount ? 'var(--success)' : 'var(--warning)'
                  }}>
                    Active: {activeCount}
                  </p>
                  <button
                    onClick={() => handleMarkerClick(district)}
                    className="text-xs font-mono-data uppercase tracking-wider"
                    style={{ color: 'var(--primary-cyan)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    View District &rarr;
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
