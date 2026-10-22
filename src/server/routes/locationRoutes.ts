import { Router, Request, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { realtimeHub } from '../realtime.js';
import { RemoteAreaRequest, NearbyLocality } from '../../types.js';

const router = Router();

// Haversine formula for straight-line distance in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Estimate road distance and transit time based on Indian road conditions
export function estimateRoadMetrics(straightDistanceKm: number) {
  // Road factor typically 1.25 - 1.35x
  const roadFactor = straightDistanceKm < 5 ? 1.25 : straightDistanceKm < 20 ? 1.3 : 1.35;
  const roadDistanceKm = Math.round(straightDistanceKm * roadFactor * 10) / 10;

  // Average speed: ~25 km/h in dense local kirana areas, ~40 km/h on suburban/highway connectors
  const avgSpeedKmh = straightDistanceKm < 5 ? 22 : straightDistanceKm < 15 ? 30 : 42;
  const transitMins = Math.round((roadDistanceKm / avgSpeedKmh) * 60);
  const packingAndPrepMins = 10;
  const totalEstimatedMins = packingAndPrepMins + transitMins;

  return {
    roadDistanceKm,
    estimatedMins: Math.max(15, totalEstimatedMins),
    transitMins,
  };
}

// Known localities, villages, and regional landmarks with authentic coordinates
const KNOWN_AREAS: NearbyLocality[] = [
  { name: 'Hootagalli', type: 'locality', district: 'Mysuru', state: 'Karnataka', pincode: '570018', lat: 12.3392, lng: 76.5927, distanceKm: 0, registeredStoresCount: 4 },
  { name: 'Koorgalli Village', type: 'village', district: 'Mysuru', state: 'Karnataka', pincode: '570018', lat: 12.3470, lng: 76.5810, distanceKm: 0, registeredStoresCount: 2 },
  { name: 'Belavadi', type: 'suburb', district: 'Mysuru', state: 'Karnataka', pincode: '570018', lat: 12.3310, lng: 76.5880, distanceKm: 0, registeredStoresCount: 2 },
  { name: 'Gokulam 3rd Stage', type: 'locality', district: 'Mysuru', state: 'Karnataka', pincode: '570002', lat: 12.3290, lng: 76.6230, distanceKm: 0, registeredStoresCount: 3 },
  { name: 'Vijayanagar 2nd Stage', type: 'locality', district: 'Mysuru', state: 'Karnataka', pincode: '570017', lat: 12.3380, lng: 76.6080, distanceKm: 0, registeredStoresCount: 3 },
  { name: 'Metagalli / KRS Road', type: 'locality', district: 'Mysuru', state: 'Karnataka', pincode: '570016', lat: 12.3550, lng: 76.6200, distanceKm: 0, registeredStoresCount: 2 },
  { name: 'KRS Dam & Village', type: 'village', district: 'Mandya', state: 'Karnataka', pincode: '571607', lat: 12.4240, lng: 76.5720, distanceKm: 0, registeredStoresCount: 1 },
  { name: 'Yelwal Rural Outskirt', type: 'village', district: 'Mysuru', state: 'Karnataka', pincode: '571130', lat: 12.3580, lng: 76.5290, distanceKm: 0, registeredStoresCount: 1 },
  { name: 'Srirangapatna Town', type: 'town', district: 'Mandya', state: 'Karnataka', pincode: '571438', lat: 12.4210, lng: 76.6950, distanceKm: 0, registeredStoresCount: 2 },
  { name: 'Nanjangud Town', type: 'town', district: 'Mysuru', state: 'Karnataka', pincode: '571301', lat: 12.1210, lng: 76.6830, distanceKm: 0, registeredStoresCount: 1 },
  { name: 'Bilikere Village', type: 'village', district: 'Mysuru', state: 'Karnataka', pincode: '571103', lat: 12.3510, lng: 76.4320, distanceKm: 0, registeredStoresCount: 0 },
  { name: 'Bannur Rural', type: 'village', district: 'Mysuru', state: 'Karnataka', pincode: '571101', lat: 12.3320, lng: 76.8610, distanceKm: 0, registeredStoresCount: 0 },
  { name: 'Kuvempunagar', type: 'locality', district: 'Mysuru', state: 'Karnataka', pincode: '570023', lat: 12.2890, lng: 76.6290, distanceKm: 0, registeredStoresCount: 2 },
  { name: 'Saraswathipuram', type: 'locality', district: 'Mysuru', state: 'Karnataka', pincode: '570009', lat: 12.3050, lng: 76.6340, distanceKm: 0, registeredStoresCount: 2 },
  { name: 'Jayalakshmipuram', type: 'locality', district: 'Mysuru', state: 'Karnataka', pincode: '570012', lat: 12.3210, lng: 76.6280, distanceKm: 0, registeredStoresCount: 3 },
  { name: 'Bogadi 2nd Stage', type: 'suburb', district: 'Mysuru', state: 'Karnataka', pincode: '570026', lat: 12.3020, lng: 76.5980, distanceKm: 0, registeredStoresCount: 2 },
];

/**
 * GET /api/location/nearby-stores
 * Dynamic store discovery based on customer coordinates and radius
 */
router.get('/nearby-stores', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radiusKm = parseFloat(req.query.radius as string) || 25;
  const storeType = req.query.type as string; // 'all', 'Supermarket', 'Local Kirana Store'

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: 'Valid lat and lng query parameters are required' });
    return;
  }

  const db = getDb();
  const config = db.config;

  // Process all registered stores
  const storeResults = db.stores.map((store) => {
    const sLat = store.lat ?? 12.3392;
    const sLng = store.lng ?? 76.5927;
    const straightDist = calculateHaversineDistanceKm(lat, lng, sLat, sLng);
    const { roadDistanceKm, estimatedMins } = estimateRoadMetrics(straightDist);

    const maxRadius = store.maxDeliveryRadiusKm || (store.type === 'Supermarket' ? 25 : 12);
    const withinStoreRadius = roadDistanceKm <= maxRadius;
    const withinPlatformRemote = config.allowRemoteDelivery
      ? roadDistanceKm <= config.remoteMaxKm
      : roadDistanceKm <= config.hyperlocalMaxKm;

    const isDeliveryEligible = withinStoreRadius && withinPlatformRemote && store.isOpen;

    let deliveryEligibilityReason = 'Delivery available to your location';
    if (!store.isOpen) {
      deliveryEligibilityReason = 'Store is currently closed';
    } else if (!withinStoreRadius) {
      deliveryEligibilityReason = `Outside store max delivery range (${maxRadius} km)`;
    } else if (!withinPlatformRemote) {
      deliveryEligibilityReason = `Beyond platform maximum service limit (${config.remoteMaxKm} km)`;
    }

    // Dynamic remote fee
    const isRemote = roadDistanceKm > 5;
    const remoteSurcharge = isRemote ? Math.round((roadDistanceKm - 5) * (config.baseRemoteFeePerKm || 3.5)) : 0;
    const deliveryFeeNum = isRemote ? 25 + remoteSurcharge : (roadDistanceKm > 2 ? 15 : 0);

    return {
      ...store,
      distance: `${roadDistanceKm} km`,
      distanceKm: roadDistanceKm,
      straightLineDistanceKm: straightDist,
      roadDistanceKm,
      deliveryTime: `${estimatedMins - 5}–${estimatedMins + 10} mins`,
      minDeliveryMins: estimatedMins,
      isDeliveryEligible,
      deliveryEligibilityReason,
      isRemote,
      remoteSurcharge,
      calculatedDeliveryFee: `₹${deliveryFeeNum}`,
      calculatedDeliveryFeeNum: deliveryFeeNum,
    };
  });

  // Filter by requested radius
  let filtered = storeResults.filter((s) => s.roadDistanceKm <= radiusKm);

  // Filter by store type if specified
  if (storeType && storeType !== 'all') {
    filtered = filtered.filter((s) => s.type === storeType);
  }

  // Sort by road distance
  filtered.sort((a, b) => a.roadDistanceKm - b.roadDistanceKm);

  // Identify nearby villages and localities
  const surroundingLocalities = KNOWN_AREAS.map((loc) => {
    const dist = calculateHaversineDistanceKm(lat, lng, loc.lat, loc.lng);
    const matchingStores = db.stores.filter((st) => {
      const sDist = calculateHaversineDistanceKm(loc.lat, loc.lng, st.lat ?? 12.3392, st.lng ?? 76.5927);
      return sDist <= (st.maxDeliveryRadiusKm || 15);
    });
    return {
      ...loc,
      distanceKm: dist,
      registeredStoresCount: matchingStores.length,
    };
  })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);

  const deliveringStores = filtered.filter((s) => s.isDeliveryEligible);
  const nearestStore = storeResults.sort((a, b) => a.roadDistanceKm - b.roadDistanceKm)[0];

  res.json({
    selectedCoordinates: { lat, lng },
    requestedRadiusKm: radiusKm,
    totalStoresFound: filtered.length,
    deliveringStoresCount: deliveringStores.length,
    hasDeliveringStores: deliveringStores.length > 0,
    nearestStore: nearestStore
      ? {
          name: nearestStore.name,
          distanceKm: nearestStore.roadDistanceKm,
          isDeliveryEligible: nearestStore.isDeliveryEligible,
        }
      : null,
    stores: filtered,
    surroundingLocalities,
    serviceConfig: {
      hyperlocalMaxKm: config.hyperlocalMaxKm,
      suburbMaxKm: config.suburbMaxKm,
      remoteMaxKm: config.remoteMaxKm,
      allowRemoteDelivery: config.allowRemoteDelivery,
    },
  });
});

/**
 * GET /api/location/geocode
 * Search any village, town, city, landmark or PIN code in India
 * Also supports reverse geocoding via lat,lng
 */
router.get('/geocode', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;

  // Reverse geocoding
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    // Find closest known locality
    let bestLoc = KNOWN_AREAS[0];
    let minDist = 99999;
    for (const loc of KNOWN_AREAS) {
      const d = calculateHaversineDistanceKm(lat, lng, loc.lat, loc.lng);
      if (d < minDist) {
        minDist = d;
        bestLoc = loc;
      }
    }

    // Try external Nominatim reverse geocode with safe timeout & fallback
    try {
      const fetchResp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: { 'User-Agent': 'GroceryGo-LocalDelivery-App/1.0' },
          signal: AbortSignal.timeout(2000),
        }
      );
      if (fetchResp.ok) {
        const data = await fetchResp.json();
        const address = data.address || {};
        const village = address.village || address.suburb || address.neighbourhood || address.town || address.city_district || bestLoc.name;
        const district = address.state_district || address.county || bestLoc.district || 'Mysuru';
        const state = address.state || bestLoc.state || 'Karnataka';
        const pincode = address.postcode || bestLoc.pincode || '570018';
        const displayName = data.display_name || `${village}, ${district}, ${state} - ${pincode}`;

        res.json({
          address: displayName,
          locality: village,
          district,
          state,
          pincode,
          lat,
          lng,
          isRemote: minDist > 10,
        });
        return;
      }
    } catch {
      // Fallback to local geographic database
    }

    res.json({
      address: `${bestLoc.name}, ${bestLoc.district}, ${bestLoc.state} - ${bestLoc.pincode}`,
      locality: bestLoc.name,
      district: bestLoc.district,
      state: bestLoc.state,
      pincode: bestLoc.pincode,
      lat,
      lng,
      isRemote: minDist > 10,
    });
    return;
  }

  // Forward search query
  if (!query) {
    res.status(400).json({ error: 'Search query string "q" is required' });
    return;
  }

  // Check local known areas first
  const localMatches = KNOWN_AREAS.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    (a.pincode && a.pincode.includes(query)) ||
    (a.district && a.district.toLowerCase().includes(query.toLowerCase()))
  ).map((a) => ({
    name: `${a.name}, ${a.district}, ${a.state} - ${a.pincode}`,
    locality: a.name,
    district: a.district,
    state: a.state,
    pincode: a.pincode,
    lat: a.lat,
    lng: a.lng,
    type: a.type,
  }));

  // Try external geocoding for any place across India
  let externalResults: any[] = [];
  try {
    const fetchResp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', India'
      )}&limit=5&addressdetails=1&countrycodes=in`,
      {
        headers: { 'User-Agent': 'GroceryGo-LocalDelivery-App/1.0' },
        signal: AbortSignal.timeout(2500),
      }
    );
    if (fetchResp.ok) {
      const data = await fetchResp.json();
      externalResults = data.map((item: any) => {
        const address = item.address || {};
        const locality =
          address.village ||
          address.suburb ||
          address.town ||
          address.neighbourhood ||
          address.city ||
          item.name;
        return {
          name: item.display_name,
          locality: locality || query,
          district: address.state_district || address.county || address.city || '',
          state: address.state || 'India',
          pincode: address.postcode || '',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'locality',
        };
      });
    }
  } catch {
    // Continue with local matches if offline or rate limited
  }

  // Deduplicate and combine results
  const combined = [...localMatches, ...externalResults];
  const uniqueResults = combined.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          Math.abs(t.lat - item.lat) < 0.005 &&
          Math.abs(t.lng - item.lng) < 0.005
      )
  );

  res.json({
    query,
    count: uniqueResults.length,
    results: uniqueResults.slice(0, 8),
  });
});

/**
 * POST /api/location/remote-request
 * Submit remote delivery request when no store serves the chosen location
 */
router.post('/remote-request', (req: Request, res: Response) => {
  const { customerName, customerPhone, address, locality, district, state, pincode, lat, lng, notes } = req.body;

  if (!address || lat === undefined || lng === undefined) {
    res.status(400).json({ error: 'Address and valid coordinates (lat, lng) are required' });
    return;
  }

  const db = getDb();

  // Find nearest store for reporting
  let nearestStoreName = 'Shree Lakshmi Kirana';
  let minDistance = 999;
  for (const st of db.stores) {
    const d = calculateHaversineDistanceKm(lat, lng, st.lat ?? 12.3392, st.lng ?? 76.5927);
    if (d < minDistance) {
      minDistance = d;
      nearestStoreName = st.name;
    }
  }

  const newRequest: RemoteAreaRequest = {
    id: `req-${Date.now().toString().slice(-6)}`,
    customerName: customerName || 'Valued Customer',
    customerPhone: customerPhone || '+91 98765 00000',
    address,
    locality: locality || 'Remote Village / Outskirt',
    district: district || 'Mysuru',
    state: state || 'Karnataka',
    pincode: pincode || '',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    distanceToNearestStoreKm: minDistance,
    nearestStoreName,
    notes: notes || 'Delivery requested in unserviced remote area.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.remoteAreaRequests = [newRequest, ...(db.remoteAreaRequests || [])];
  saveDb(db);

  realtimeHub.broadcast('announcement', {
    type: 'remote_area_requested',
    requestId: newRequest.id,
    locality: newRequest.locality,
    address: newRequest.address,
    customerName: newRequest.customerName,
    message: `New remote delivery coverage requested for ${newRequest.locality} (${minDistance} km from nearest store).`,
  });

  res.status(201).json({
    success: true,
    message: 'Your remote area delivery request has been recorded. Our platform team is reviewing store expansion for your region.',
    request: newRequest,
  });
});

/**
 * GET /api/location/remote-requests
 * View all unserviced remote area requests (Admin or analytics)
 */
router.get('/remote-requests', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.remoteAreaRequests || []);
});

/**
 * PATCH /api/location/remote-requests/:id
 * Admin updates status of remote request
 */
router.patch('/remote-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = getDb();
  const idx = (db.remoteAreaRequests || []).findIndex((r) => r.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Remote area request not found' });
    return;
  }

  db.remoteAreaRequests[idx].status = status;
  saveDb(db);

  res.json({
    success: true,
    request: db.remoteAreaRequests[idx],
  });
});

/**
 * POST /api/location/compute-route
 * Computes road route, distance, and duration using Google Routes API
 * or high-fidelity road modeling if Routes API is not configured or unavailable.
 */
router.post('/compute-route', async (req: Request, res: Response) => {
  const { origin, destination } = req.body;

  if (
    !origin ||
    !destination ||
    typeof origin.lat !== 'number' ||
    typeof destination.lat !== 'number' ||
    typeof origin.lng !== 'number' ||
    typeof destination.lng !== 'number'
  ) {
    res.status(400).json({ error: 'Origin and destination coordinates are required' });
    return;
  }

  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey && apiKey.startsWith('AIza')) {
    try {
      const routesUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
      const response = await fetch(routesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.viewport',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.lat,
                longitude: origin.lng,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.lng,
              },
            },
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
          polylineQuality: 'HIGH_QUALITY',
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const encoded = route.polyline?.encodedPolyline;
          const distanceMeters = route.distanceMeters || 0;
          const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
          const durationMins = Math.max(1, Math.round(durationSeconds / 60));

          res.json({
            success: true,
            source: 'google_routes_api',
            encodedPolyline: encoded,
            distanceKm,
            distanceText: `${distanceKm} km`,
            durationMins,
            durationText: `${durationMins} mins`,
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Google Routes API request failed, falling back to road modeling:', err);
    }
  }

  // Realistic road calculation fallback based on authentic Karnataka road conditions
  const straightDist = calculateHaversineDistanceKm(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );
  const roadMetrics = estimateRoadMetrics(straightDist);

  res.json({
    success: true,
    source: 'road_metrics_engine',
    distanceKm: roadMetrics.roadDistanceKm,
    distanceText: `${roadMetrics.roadDistanceKm} km`,
    durationMins: roadMetrics.estimatedMins,
    durationText: `${roadMetrics.estimatedMins} mins`,
  });
});

export default router;
