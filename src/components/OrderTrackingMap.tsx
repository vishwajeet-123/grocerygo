import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Store,
  DeliveryLocation,
  DeliveryPartner,
  OrderStatus,
  ServiceAreaConfig,
} from '../types';
import {
  MYSURU_LOCALITIES,
  calculateDistanceKm,
  evaluateDeliveryEligibility,
} from '../data/orders';
import {
  MapPin,
  Store as StoreIcon,
  Navigation,
  Clock,
  Compass,
  AlertCircle,
  Layers,
  Sparkles,
  Phone,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
  Truck,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

// Mysuru Coordinates fallback: Shree Lakshmi Kirana in Hootagalli
const DEFAULT_STORE_COORDS = { lat: 12.3392, lng: 76.5927 };

interface OrderTrackingMapProps {
  store: Store;
  deliveryLocation: DeliveryLocation;
  deliveryPartner?: DeliveryPartner;
  orderStatus: OrderStatus;
  serviceConfig: ServiceAreaConfig;
  onSelectLocation?: (location: DeliveryLocation) => void;
  onUpdateConfig?: (config: ServiceAreaConfig) => void;
  allowPickLocation?: boolean;
}

// Internal map controller for camera fitting and route polylines
function MapRouteRenderer({
  storeCoords,
  deliveryCoords,
  partnerCoords,
  status,
}: {
  storeCoords: { lat: number; lng: number };
  deliveryCoords: { lat: number; lng: number };
  partnerCoords?: { lat: number; lng: number };
  status: OrderStatus;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Bounds fitting to encapsulate store, partner, and customer
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(storeCoords);
    bounds.extend(deliveryCoords);
    if (partnerCoords) bounds.extend(partnerCoords);

    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

    // Clean previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    // Attempt modern Routes API if available via routesLib
    if (routesLib && (routesLib as any).Route) {
      const request = {
        origin: storeCoords,
        destination: deliveryCoords,
        travelMode: 'DRIVING',
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
      };

      (routesLib as any).Route.computeRoutes(request)
        .then(({ routes }: { routes: any[] }) => {
          if (routes && routes[0] && routes[0].createPolylines) {
            const lines = routes[0].createPolylines();
            lines.forEach((line: google.maps.Polyline) => {
              line.setOptions({
                strokeColor: '#059669', // Emerald 600
                strokeWeight: 5,
                strokeOpacity: 0.85,
              });
              line.setMap(map);
            });
            polylinesRef.current = lines;
          } else {
            drawFallbackPolyline();
          }
        })
        .catch(() => {
          drawFallbackPolyline();
        });
    } else {
      drawFallbackPolyline();
    }

    function drawFallbackPolyline() {
      // Connect coordinates with smooth styled polyline
      const path = [
        storeCoords,
        ...(partnerCoords ? [partnerCoords] : []),
        deliveryCoords,
      ];
      const poly = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#059669',
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map,
      });
      polylinesRef.current = [poly];
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, storeCoords, deliveryCoords, partnerCoords, status]);

  return null;
}

export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  store,
  deliveryLocation,
  deliveryPartner,
  orderStatus,
  serviceConfig,
  onSelectLocation,
  onUpdateConfig,
  allowPickLocation = true,
}) => {
  const [mapError, setMapError] = useState(false);
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<
    'store' | 'partner' | 'customer' | null
  >(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customRadius, setCustomRadius] = useState(serviceConfig.remoteMaxKm);

  // Store coordinates (Shree Lakshmi Kirana in Hootagalli, or matched store)
  const storeCoords = useMemo(() => {
    return DEFAULT_STORE_COORDS;
  }, []);

  const deliveryCoords = useMemo(() => {
    return { lat: deliveryLocation.lat, lng: deliveryLocation.lng };
  }, [deliveryLocation]);

  // Live driver animated simulation coordinates
  const [livePartnerCoords, setLivePartnerCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(
    deliveryPartner
      ? { lat: deliveryPartner.currentLat, lng: deliveryPartner.currentLng }
      : null
  );

  // Driver motion effect along route when order is out_for_delivery
  useEffect(() => {
    if (orderStatus !== 'out_for_delivery' || !deliveryPartner) return;

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 100;
      const progress = 0.35 + (step / 100) * 0.45; // between 35% and 80% to customer
      const lat = storeCoords.lat + (deliveryCoords.lat - storeCoords.lat) * progress;
      const lng = storeCoords.lng + (deliveryCoords.lng - storeCoords.lng) * progress;
      setLivePartnerCoords({ lat, lng });
    }, 2500);

    return () => clearInterval(interval);
  }, [orderStatus, deliveryPartner, storeCoords, deliveryCoords]);

  // Calculate live distance & delivery quote
  const liveDistanceKm = useMemo(() => {
    return calculateDistanceKm(
      storeCoords.lat,
      storeCoords.lng,
      deliveryCoords.lat,
      deliveryCoords.lng
    );
  }, [storeCoords, deliveryCoords]);

  const deliveryEvaluation = useMemo(() => {
    return evaluateDeliveryEligibility(liveDistanceKm, serviceConfig);
  }, [liveDistanceKm, serviceConfig]);

  // Map click handler to pick any location (including distant rural towns)
  const handleMapClick = (e: any) => {
    if (!allowPickLocation) return;
    if (e.detail && e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      const distance = calculateDistanceKm(storeCoords.lat, storeCoords.lng, lat, lng);
      const isRemote = distance > serviceConfig.suburbMaxKm;

      const newLoc: DeliveryLocation = {
        id: `custom-loc-${Date.now()}`,
        name: `Pin Location (${distance} km from ${store.name})`,
        address: `Custom Mysuru Delivery Coordinate [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
        landmark: isRemote ? 'Remote Outskirts Delivery Zone' : 'Standard Delivery Zone',
        lat,
        lng,
        distanceKm: distance,
        estimatedMins: Math.round(20 + distance * 2.5),
        isRemote,
        localityType: isRemote ? 'remote_village' : distance > 5 ? 'suburb' : 'hyperlocal',
        deliveryFee: isRemote ? 65 + Math.round((distance - 12) * 3) : distance > 5 ? 35 : 0,
        areaTag: isRemote ? 'Remote Rural Locality' : distance > 5 ? 'Extended Suburb' : 'Hyperlocal Core',
      };
      onSelectLocation?.(newLoc);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Top Controls Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Interactive Delivery Route & Live Tracking
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Google Maps Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              From <strong className="text-slate-700">{store.name}</strong> to{' '}
              <strong className="text-slate-700">{deliveryLocation.name}</strong>
            </p>
          </div>
        </div>

        {/* Dynamic Distance & Remote Area Tag */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
              deliveryEvaluation.isDeliverable
                ? deliveryLocation.isRemote
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              {liveDistanceKm} km ·{' '}
              {deliveryEvaluation.isDeliverable
                ? deliveryEvaluation.tierName
                : 'Outside Range'}
            </span>
          </div>

          {/* Configurable Radius Button */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Configure Remote Delivery Service Area"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service Radius: {serviceConfig.remoteMaxKm} km</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-100">
        {!mapError && GOOGLE_MAPS_API_KEY ? (
          <APIProvider
            apiKey={GOOGLE_MAPS_API_KEY}
            onError={(err) => {
              console.warn('Google Maps API load issue, using vector map:', err);
              setMapError(true);
            }}
          >
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={storeCoords}
              defaultZoom={13}
              gestureHandling="greedy"
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              onClick={handleMapClick}
              className="w-full h-full"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              {/* Route line & bounds controller */}
              <MapRouteRenderer
                storeCoords={storeCoords}
                deliveryCoords={deliveryCoords}
                partnerCoords={livePartnerCoords || undefined}
                status={orderStatus}
              />

              {/* 1. Store Advanced Marker */}
              <AdvancedMarker
                position={storeCoords}
                title={store.name}
                onClick={() => setActiveMarkerInfo('store')}
              >
                <div className="relative group cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-500/40 transform transition-transform group-hover:scale-110">
                    <StoreIcon className="w-4 h-4" />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Store
                  </span>
                </div>
              </AdvancedMarker>

              {/* 2. Delivery Partner Live Marker (Out for delivery) */}
              {livePartnerCoords && orderStatus === 'out_for_delivery' && (
                <AdvancedMarker
                  position={livePartnerCoords}
                  title={deliveryPartner?.name || 'Delivery Partner'}
                  onClick={() => setActiveMarkerInfo('partner')}
                >
                  <div className="relative group cursor-pointer animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-amber-400/50">
                      <Truck className="w-5 h-5 text-slate-950" />
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Driver (Live)
                    </span>
                  </div>
                </AdvancedMarker>
              )}

              {/* 3. Customer Destination Marker */}
              <AdvancedMarker
                position={deliveryCoords}
                title={deliveryLocation.name}
                onClick={() => setActiveMarkerInfo('customer')}
              >
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-9 h-9 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ${
                      deliveryLocation.isRemote
                        ? 'bg-purple-700 ring-purple-400/50'
                        : 'bg-rose-600 ring-rose-400/50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {deliveryLocation.isRemote ? 'Remote Locality' : 'Destination'}
                  </span>
                </div>
              </AdvancedMarker>

              {/* InfoWindows */}
              {activeMarkerInfo === 'store' && (
                <InfoWindow
                  position={storeCoords}
                  onCloseClick={() => setActiveMarkerInfo(null)}
                >
                  <div className="p-1 text-slate-800 text-xs">
                    <p className="font-bold text-emerald-800">{store.name}</p>
                    <p className="text-[11px] text-slate-500">{store.address}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      Dispatch Origin · Open now
                    </p>
                  </div>
                </InfoWindow>
              )}

              {activeMarkerInfo === 'partner' && livePartnerCoords && (
                <InfoWindow
                  position={livePartnerCoords}
                  onCloseClick={() => setActiveMarkerInfo(null)}
                >
                  <div className="p-1 text-slate-800 text-xs">
                    <p className="font-bold text-amber-900">
                      {deliveryPartner?.name || 'Ramesh Kumar'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Vehicle: {deliveryPartner?.vehicleNumber}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      En route: ETA ~12 mins
                    </p>
                  </div>
                </InfoWindow>
              )}

              {activeMarkerInfo === 'customer' && (
                <InfoWindow
                  position={deliveryCoords}
                  onCloseClick={() => setActiveMarkerInfo(null)}
                >
                  <div className="p-1 text-slate-800 text-xs">
                    <p className="font-bold text-slate-900">{deliveryLocation.name}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {deliveryLocation.address}
                    </p>
                    <p className="text-[11px] text-purple-700 font-semibold mt-1">
                      Distance: {liveDistanceKm} km ({deliveryLocation.areaTag})
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* High-Fidelity Interactive Vector Route Map Fallback */
          <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none">
            {/* Vector Map Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Stylized Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-slate-800/90 backdrop-blur-xs border border-slate-700 text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400">Mysuru Smart Routing Engine</span>
                <span className="text-slate-400">|</span>
                <span>Active Geodesic Vector Tracking</span>
              </div>
              <div className="bg-slate-800/90 border border-slate-700 text-xs text-amber-300 px-2.5 py-1 rounded-lg">
                Coverage: Up to {serviceConfig.remoteMaxKm} km
              </div>
            </div>

            {/* Visual SVG Route Representation */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <svg
                viewBox="0 0 700 240"
                className="w-full max-w-2xl h-auto drop-shadow-2xl"
              >
                {/* Defs for gradients */}
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Curved road route */}
                <path
                  d="M 80 140 Q 240 40, 380 120 T 620 100"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 80 140 Q 240 40, 380 120 T 620 100"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="5"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                />

                {/* Store Pin (Hootagalli) */}
                <g transform="translate(80, 140)">
                  <circle r="22" fill="#047857" stroke="#ffffff" strokeWidth="3" />
                  <text y="5" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                    STORE
                  </text>
                  <text y="40" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">
                    {store.name}
                  </text>
                </g>

                {/* Live Driver (Out for delivery) */}
                {orderStatus === 'out_for_delivery' && (
                  <g transform="translate(360, 115)">
                    <circle r="18" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                    <circle r="26" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                    <text y="4" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">
                      PARTNER
                    </text>
                    <text y="36" textAnchor="middle" fill="#fcd34d" fontSize="10" fontWeight="600">
                      Ramesh Kumar (Live)
                    </text>
                  </g>
                )}

                {/* Destination Pin (Local or Remote) */}
                <g transform="translate(620, 100)">
                  <circle
                    r="22"
                    fill={deliveryLocation.isRemote ? '#7c3aed' : '#e11d48'}
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <text y="5" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                    {deliveryLocation.isRemote ? 'REMOTE' : 'HOME'}
                  </text>
                  <text y="40" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
                    {deliveryLocation.name}
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Status Info in Vector Map */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>
                  Delivery Address:{' '}
                  <strong className="text-white">{deliveryLocation.address}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">
                  Distance: {liveDistanceKm} km
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-300 font-bold">
                  Est. Delivery: {deliveryEvaluation.estimatedMins} mins
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Quick Remote Locality Picker Overlay */}
        {allowPickLocation && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-3 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Select Locality in Mysuru (Local & Remote)
              </span>
              <span className="text-[10px] text-slate-500">
                Click map or select below
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {MYSURU_LOCALITIES.slice(0, 6).map((loc) => {
                const isSelected = loc.id === deliveryLocation.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => onSelectLocation?.(loc)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : loc.isRemote
                        ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-semibold">{loc.name}</span>
                    <span className="text-[9px] opacity-80">
                      {loc.distanceKm} km · {loc.isRemote ? 'Remote' : 'Local'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delivery Feasibility & Remote Area Summary Banner */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Estimated Travel Time</span>
            <span className="font-bold text-slate-900 text-sm">
              {deliveryEvaluation.estimatedMins} mins
            </span>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              Live calculated for {liveDistanceKm} km
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              deliveryLocation.isRemote
                ? 'bg-purple-100 text-purple-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Service Area Classification</span>
            <span className="font-bold text-slate-900 text-sm">
              {deliveryEvaluation.tierName}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {deliveryLocation.isRemote
                ? 'Remote rural partner dispatched'
                : 'Local kirana store runner assigned'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Delivery Fee Breakdown</span>
            <span className="font-bold text-slate-900 text-sm">
              {deliveryEvaluation.deliveryFee === 0
                ? 'FREE'
                : `₹${deliveryEvaluation.deliveryFee}`}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {liveDistanceKm > 3
                ? `Includes remote transit surcharge`
                : 'Free local delivery under 3 km'}
            </p>
          </div>
        </div>
      </div>

      {/* Configurable Service Area Radius Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Remote Service Area Configurator
                  </h3>
                  <p className="text-xs text-slate-500">
                    No hardcoded 3 km limit — customize radius
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                GroceryGo empowers rural kirana stores to service customers beyond
                traditional limits. Adjust the store’s allowable delivery boundary
                below:
              </p>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-800">
                    Maximum Delivery Boundary:
                  </span>
                  <span className="text-base font-extrabold text-emerald-800">
                    {customRadius} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={customRadius}
                  onChange={(e) => setCustomRadius(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 km (Local)</span>
                  <span>15 km (Suburban)</span>
                  <span>25 km (Rural)</span>
                  <span>35 km (Max Remote)</span>
                </div>
              </div>

              {/* Service Tiers Visualizer */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Tier 1: Hyperlocal Core</span>
                  <span className="text-emerald-700 font-bold">0 to 5 km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Tier 2: Extended Suburbs</span>
                  <span className="text-slate-700 font-bold">5 to 12 km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-700">
                    Tier 3: Remote Rural Outskirts
                  </span>
                  <span className="text-purple-700 font-bold">
                    12 to {customRadius} km
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig?.({
                    ...serviceConfig,
                    remoteMaxKm: customRadius,
                  });
                  setShowConfigModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Apply Service Boundary ({customRadius} km)
              </button>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
