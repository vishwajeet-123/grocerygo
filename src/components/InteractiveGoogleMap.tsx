import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Compass,
  Crosshair,
  Layers,
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
  isDraggable?: boolean;
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
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  showControls?: boolean;
}

// Controller to smoothly pan to center when center prop changes
function MapCenterController({
  center,
  zoom,
}: {
  center?: { lat: number; lng: number };
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !center) return;
    map.panTo(center);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, center?.lat, center?.lng, zoom]);

  return null;
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
  }, [map, routeCoordinates]);

  return null;
}

/**
 * Interactive OpenStreetMap tile canvas fallback
 * Renders fully functional pan, zoom, click-to-pin, and marker dragging
 * across all cities, towns, and remote rural villages in India
 */
function FallbackInteractiveTileMap({
  center,
  zoom: initialZoom,
  markers = [],
  onSelectCoordinate,
  onMarkerDragEnd,
  interactive = true,
}: {
  center: { lat: number; lng: number };
  zoom: number;
  markers?: MapMarkerItem[];
  onSelectCoordinate?: (lat: number, lng: number) => void;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  interactive?: boolean;
}) {
  const [mapCenter, setMapCenter] = useState(center);
  const [zoomLevel, setZoomLevel] = useState(Math.max(10, Math.min(18, initialZoom)));
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync center when prop changes
  useEffect(() => {
    setMapCenter(center);
  }, [center.lat, center.lng]);

  // Convert lat/lng to tile numbers
  const lon2tile = (lon: number, zoom: number) => ((lon + 180) / 360) * Math.pow(2, zoom);
  const lat2tile = (lat: number, zoom: number) =>
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
        Math.PI) /
      2) *
    Math.pow(2, zoom);

  const tile2lon = (x: number, zoom: number) => (x / Math.pow(2, zoom)) * 360 - 180;
  const tile2lat = (y: number, zoom: number) => {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };

  const centerTileX = lon2tile(mapCenter.lng, zoomLevel);
  const centerTileY = lat2tile(mapCenter.lat, zoomLevel);

  // Handle map click to place pin
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onSelectCoordinate || isDraggingMap) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = e.clientY - rect.top - rect.height / 2;

    const tileSize = 256;
    const clickedTileX = centerTileX + clickX / tileSize;
    const clickedTileY = centerTileY + clickY / tileSize;

    const newLng = tile2lon(clickedTileX, zoomLevel);
    const newLat = tile2lat(clickedTileY, zoomLevel);

    onSelectCoordinate(
      Math.round(newLat * 100000) / 100000,
      Math.round(newLng * 100000) / 100000
    );
  };

  // Pan controls via dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDraggingMap(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMap || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const tileSize = 256;
    const newTileX = centerTileX - dx / tileSize;
    const newTileY = centerTileY - dy / tileSize;

    const newLng = tile2lon(newTileX, zoomLevel);
    const newLat = tile2lat(newTileY, zoomLevel);

    setMapCenter({ lat: newLat, lng: newLng });
  };

  const handleMouseUp = () => {
    setIsDraggingMap(false);
    setDragStart(null);
  };

  // Convert marker lat/lng to container pixel coordinates
  const getMarkerPixelOffset = (lat: number, lng: number) => {
    const mTileX = lon2tile(lng, zoomLevel);
    const mTileY = lat2tile(lat, zoomLevel);
    const tileSize = 256;

    const pixelX = (mTileX - centerTileX) * tileSize;
    const pixelY = (mTileY - centerTileY) * tileSize;

    return { x: pixelX, y: pixelY };
  };

  // Generate 3x3 surrounding tiles
  const baseTileX = Math.floor(centerTileX);
  const baseTileY = Math.floor(centerTileY);
  const tiles = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const tx = baseTileX + dx;
      const ty = baseTileY + dy;
      const maxTile = Math.pow(2, zoomLevel) - 1;
      if (tx >= 0 && tx <= maxTile && ty >= 0 && ty <= maxTile) {
        tiles.push({ tx, ty, dx, dy });
      }
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleContainerClick}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-100 ${
        interactive ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* Interactive Tile Canvas */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="relative"
          style={{
            transform: `translate(${-((centerTileX - baseTileX) * 256)}px, ${-(
              (centerTileY - baseTileY) *
              256
            )}px)`,
          }}
        >
          {tiles.map(({ tx, ty, dx, dy }) => (
            <img
              key={`${zoomLevel}-${tx}-${ty}`}
              src={`https://tile.openstreetmap.org/${zoomLevel}/${tx}/${ty}.png`}
              alt=""
              loading="lazy"
              className="absolute w-[256px] h-[256px] max-w-none opacity-90 transition-opacity"
              style={{
                left: `${dx * 256}px`,
                top: `${dy * 256}px`,
              }}
              onError={(e) => {
                // If offline or rate limited, gracefully display styled grid
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ))}
        </div>
      </div>

      {/* Render Markers */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {markers.map((marker) => {
          const { x, y } = getMarkerPixelOffset(marker.position.lat, marker.position.lng);
          const isStore = marker.type === 'store';
          const isRemote = marker.type === 'remote';
          const isDriver = marker.type === 'driver';
          const isCustomer = marker.type === 'customer';

          return (
            <div
              key={marker.id}
              className="absolute pointer-events-auto transition-transform group cursor-pointer"
              style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -100%)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (marker.isDraggable && onMarkerDragEnd) {
                  onMarkerDragEnd(marker.position.lat, marker.position.lng);
                }
              }}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white ring-2 transition-transform hover:scale-115 ${
                  isStore
                    ? 'bg-emerald-700 ring-emerald-500/50'
                    : isRemote
                    ? 'bg-purple-700 ring-purple-400/50'
                    : isDriver
                    ? 'bg-amber-500 text-slate-950 ring-amber-400/50 animate-pulse'
                    : 'bg-rose-600 ring-rose-400/50 shadow-rose-600/30'
                }`}
              >
                {isStore ? (
                  <StoreIcon className="w-4 h-4" />
                ) : isDriver ? (
                  <Navigation className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4 fill-white" />
                )}
              </div>

              {/* Title & Badge */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap z-20 flex flex-col items-center">
                <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md backdrop-blur-xs">
                  {marker.title}
                </span>
                {marker.badge && (
                  <span className="text-[9px] font-semibold text-emerald-300 mt-0.5 bg-emerald-950/80 px-1.5 py-0.2 rounded">
                    {marker.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Map Zoom & Recenter Controls */}
      {interactive && (
        <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-lg border border-slate-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.min(18, z + 1));
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.max(7, z - 1));
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMapCenter(center);
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Recenter Map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Helper click instructions badge */}
      {interactive && (
        <div className="absolute top-3 left-3 z-30 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Click anywhere to place delivery pin · Drag map to pan</span>
        </div>
      )}

      {/* Coordinates readout badge */}
      <div className="absolute bottom-3 left-3 z-30 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-lg shadow-sm border border-slate-800 flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          {mapCenter.lat.toFixed(4)}° N, {mapCenter.lng.toFixed(4)}° E · Zoom {zoomLevel}x
        </span>
      </div>
    </div>
  );
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
  onMarkerDragEnd,
  showControls = true,
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
            <MapCenterController center={center} zoom={zoom} />
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
        /* Full interactive tile map fallback with Pan, Zoom, and Pin Placement */
        <FallbackInteractiveTileMap
          center={center}
          zoom={zoom}
          markers={markers}
          onSelectCoordinate={onSelectCoordinate}
          onMarkerDragEnd={onMarkerDragEnd}
          interactive={interactive}
        />
      )}

      {/* Floating brand indicator */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs border border-slate-200 pointer-events-none">
        {isKeyValid && !hasApiError ? 'Google Maps' : 'Live Interactive Map'}
      </div>
    </div>
  );
};
