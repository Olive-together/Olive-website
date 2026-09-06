import { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import '@/lib/leaflet-init';

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (val: { lat: number; lng: number }) => void;
  className?: string;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null; setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export function MapPicker({ value, onChange, className = "h-[300px] w-full rounded-2xl overflow-hidden shadow-inner border border-olive-100" }: MapPickerProps) {
  // Default to a central location (e.g. New Delhi, India) if no value is provided
  const defaultCenter = { lat: 28.6139, lng: 77.2090 };
  const center = value ?? defaultCenter;

  const [position, setPosition] = useState<L.LatLng | null>(value ? (L.latLng(value.lat, value.lng)) : null);

  useEffect(() => {
    if (position) {
      onChange({ lat: position.lat, lng: position.lng });
    }
  }, [position, onChange]);

  return (
    <div className={className}>
      <MapContainer center={center} zoom={value ? 13 : 4} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
