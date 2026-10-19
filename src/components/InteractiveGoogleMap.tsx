import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Store as StoreIcon,
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import {
  getEffectiveGoogleMapsApiKey,
  isValidGoogleMapsApiKey,
} from '../utils/googleMaps';


export interface MapMarkerItem {
  id: string;
  title: string;
  subtitle?: string;
  position: { lat: number; lng: number };
  type?: 'store' | 'customer' | 'driver' | 'remote';
  badge?: string;
}

interface InteractiveGoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerItem[];
  routeCoordinates?: { lat: number; lng: number }[];
  height?: string;
  className?: string;
  onSelectCoordinate?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

// Subcomponent to fit map bounds and draw route polyline
function MapBoundsAndPolyline({
  markers,
  routeCoordinates,
}: {
  markers?: MapMarkerItem[];
  routeCoordinates?: { lat: number; lng: number }[];
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    // Bounds fitting
    if (markers && markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend(m.position));
      if (routeCoordinates) {
        routeCoordinates.forEach((c) => bounds.extend(c));
      }
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }

    // Polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      const poly = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: '#059669', // Emerald 600
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map,
      });
      polylineRef.current = poly;
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, markers, routeCoordinates]);

  return null;
}

export const InteractiveGoogleMap: React.FC<InteractiveGoogleMapProps> = ({
  center = { lat: 12.3392, lng: 76.5927 }, // Hootagalli Mysuru
  zoom = 13,
  markers = [],
  routeCoordinates,
  height = '320px',
  className = '',
  onSelectCoordinate,
  interactive = true,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => getEffectiveGoogleMapsApiKey());
  const [hasApiError, setHasApiError] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);

  useEffect(() => {
    const handleAuthFailed = () => {
      setHasApiError(true);
    };
    const handleKeyUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setApiKey(customEvent.detail || getEffectiveGoogleMapsApiKey());
      setHasApiError(false);
    };

    window.addEventListener('gmp-auth-failed', handleAuthFailed);
    window.addEventListener('gmp-key-updated', handleKeyUpdated);
    return () => {
      window.removeEventListener('gmp-auth-failed', handleAuthFailed);
      window.removeEventListener('gmp-key-updated', handleKeyUpdated);
    };
  }, []);

  const isKeyValid = isValidGoogleMapsApiKey(apiKey);

  const handleMapClick = (e: any) => {
    if (!interactive || !onSelectCoordinate) return;
    if (e.detail && e.detail.latLng) {
      onSelectCoordinate(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  };

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100 ${className}`}
    >
      {!hasApiError && isKeyValid ? (
        <APIProvider
          apiKey={apiKey}
          onError={(err) => {
            console.warn('Google Maps API fallback activated:', err);
            setHasApiError(true);
          }}
        >
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={center}
            defaultZoom={zoom}
            gestureHandling={interactive ? 'greedy' : 'none'}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
            onClick={handleMapClick}
            className="w-full h-full"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <MapBoundsAndPolyline
              markers={markers}
              routeCoordinates={routeCoordinates}
            />

            {markers.map((marker) => {
              const isStore = marker.type === 'store';
              const isRemote = marker.type === 'remote';
              const isDriver = marker.type === 'driver';

              return (
                <AdvancedMarker
                  key={marker.id}
                  position={marker.position}
                  title={marker.title}
                  onClick={() => setSelectedMarker(marker)}
                >
                  <div className="relative group cursor-pointer">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white ring-2 transition-transform group-hover:scale-115 ${
                        isStore
                          ? 'bg-emerald-700 ring-emerald-500/40'
                          : isRemote
                          ? 'bg-purple-700 ring-purple-400/40'
                          : isDriver
                          ? 'bg-amber-500 text-slate-950 ring-amber-400/40 animate-pulse'
                          : 'bg-rose-600 ring-rose-400/40'
                      }`}
                    >
                      {isStore ? (
                        <StoreIcon className="w-4 h-4" />
                      ) : isDriver ? (
                        <Navigation className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    {marker.badge && (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow">
                        {marker.badge}
                      </span>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 text-slate-800 text-xs max-w-[200px]">
                  <p className="font-bold text-slate-900">{selectedMarker.title}</p>
                  {selectedMarker.subtitle && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedMarker.subtitle}
                    </p>
                  )}
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                    [{selectedMarker.position.lat.toFixed(4)},{' '}
                    {selectedMarker.position.lng.toFixed(4)}]
                  </p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      ) : (
        /* Vector interactive map fallback */
        <div className="relative w-full h-full bg-slate-900 p-4 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-emerald-400">Mysuru Location Service</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {markers.length} points mapped
            </span>
          </div>

          <div className="relative z-10 my-auto text-center space-y-2">
            <div className="flex justify-center items-center gap-8">
              {markers.slice(0, 3).map((m) => (
                <div key={m.id} className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
                    {m.type === 'store' ? (
                      <StoreIcon className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] text-white font-bold mt-1 max-w-[90px] truncate">
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 bg-slate-800/80 p-2 rounded-lg border border-slate-700">
            <span>Hootagalli & Mysuru Delivery Network</span>
            <span className="text-emerald-400 font-bold">Live Geodesic</span>
          </div>
        </div>
      )}

      {/* Floating brand indicator */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs border border-slate-200 pointer-events-none">
        Google Maps
      </div>
    </div>
  );
};
