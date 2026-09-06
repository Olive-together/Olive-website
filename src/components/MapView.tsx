import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Users, MapPin, CalendarDays } from 'lucide-react';
import type { Activity } from '@/lib/api/types';
import '@/lib/leaflet-init';

interface MapViewProps {
  activities: Activity[];
  center?: { lat: number; lng: number };
  className?: string;
}

export function MapView({ activities, center = { lat: 28.6139, lng: 77.2090 }, className = "h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-olive-100" }: MapViewProps) {
  // Filter activities that actually have coordinates (for safety, though backend should only return ones with coords)
  const mapActivities = activities.filter(a => (a as any).coordinates || (a as any).lat);

  // If there are activities, center on the first one, else use default center
  const mapCenter = mapActivities.length > 0 
    ? { 
        lat: (mapActivities[0] as any).lat ?? center.lat, 
        lng: (mapActivities[0] as any).lng ?? center.lng 
      } 
    : center;

  return (
    <div className={className}>
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapActivities.map(activity => {
          // In a real app we'd map the PostGIS coordinates from backend
          // Here we assume the backend returns lat/lng flat or inside coordinates
          const lat = (activity as any).lat;
          const lng = (activity as any).lng;
          
          if (!lat || !lng) return null;

          return (
            <Marker key={activity.id} position={{ lat, lng }}>
              <Popup className="rounded-2xl">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-olive-900 mb-1 leading-tight">{activity.title}</h3>
                  <p className="text-xs text-olive-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activity.address}
                  </p>
                  <p className="text-xs text-olive-500 mb-3 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {new Date(activity.startTime).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-olive-100">
                    <span className="text-xs font-semibold text-olive-600 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {activity._count?.participants ?? 0} joining
                    </span>
                    <Link to={`/activities/${activity.id}`} className="text-xs font-bold text-olive-700 bg-olive-100 px-3 py-1 rounded-full hover:bg-olive-200 transition-colors">
                      View
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
