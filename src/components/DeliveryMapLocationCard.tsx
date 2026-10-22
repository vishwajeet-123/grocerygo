import React, { useMemo } from 'react';
import { Navigation, ArrowRight, ArrowLeft, MapPin, Store, Route } from 'lucide-react';
import { Store as StoreType, DeliveryLocation } from '../types';
import { SavedAddress } from './AddressSelector';
import { InteractiveGoogleMap } from './InteractiveGoogleMap';

interface DeliveryMapLocationCardProps {
  store: StoreType;
  selectedAddress: SavedAddress | undefined;
  deliveryLocationObj?: DeliveryLocation | null;
  onBackToCart: () => void;
  onContinueToPayment: () => void;
}

// Distance helper
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

export const DeliveryMapLocationCard: React.FC<DeliveryMapLocationCardProps> = ({
  store,
  selectedAddress,
  deliveryLocationObj,
  onBackToCart,
  onContinueToPayment,
}) => {
  const addressText = selectedAddress
    ? (selectedAddress.streetAddress.includes(selectedAddress.pincode)
        ? selectedAddress.streetAddress
        : `${selectedAddress.streetAddress}, Mysuru - ${selectedAddress.pincode}`)
    : deliveryLocationObj?.address || '#123, 5th Cross, Hootagalli, Mysuru - 570018';

  const addressLabel = selectedAddress ? selectedAddress.label : deliveryLocationObj?.name || 'Home';

  // Exact coordinates
  const storePos = useMemo(() => {
    return {
      lat: store.lat ?? 12.3392,
      lng: store.lng ?? 76.5927,
    };
  }, [store.lat, store.lng]);

  const customerPos = useMemo(() => {
    if (selectedAddress?.lat && selectedAddress?.lng) {
      return { lat: selectedAddress.lat, lng: selectedAddress.lng };
    }
    if (deliveryLocationObj?.lat && deliveryLocationObj?.lng) {
      return { lat: deliveryLocationObj.lat, lng: deliveryLocationObj.lng };
    }
    if (selectedAddress?.label === 'College') {
      return { lat: 12.285, lng: 76.645 };
    }
    if (selectedAddress?.streetAddress?.toLowerCase().includes('ring road')) {
      return { lat: 12.3150, lng: 76.6120 };
    }
    return { lat: 12.3375, lng: 76.598 };
  }, [selectedAddress, deliveryLocationObj]);

  // Compute straight-line and estimated road distance
  const straightLineKm = useMemo(() => {
    return calculateDistanceKm(storePos.lat, storePos.lng, customerPos.lat, customerPos.lng);
  }, [storePos, customerPos]);

  const roadFactor = straightLineKm < 5 ? 1.25 : straightLineKm < 20 ? 1.3 : 1.35;
  const roadKm = Math.round(straightLineKm * roadFactor * 10) / 10;
  const transitMins = Math.max(15, Math.round((roadKm / 28) * 60) + 10);

  // Generate intermediate road polyline waypoints between store and customer
  const routeWaypoints = useMemo(() => {
    const points = [storePos];
    const midLat = (storePos.lat + customerPos.lat) / 2 + 0.0012;
    const midLng = (storePos.lng + customerPos.lng) / 2 - 0.0008;
    points.push({ lat: midLat, lng: midLng });
    points.push(customerPos);
    return points;
  }, [storePos, customerPos]);

  const isRemote = roadKm > 5;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
      {/* Heading */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          4. Map & Delivery Route
        </h2>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            isRemote
              ? 'text-purple-700 bg-purple-50 border-purple-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-100'
          }`}
        >
          {isRemote ? 'Remote Area Delivery' : 'Hyperlocal Road Route'}
        </span>
      </div>

      {/* Interactive Google Map Preview */}
      <div className="mt-3.5">
        <InteractiveGoogleMap
          center={storePos}
          zoom={13}
          height="240px"
          markers={[
            {
              id: 'store-origin',
              title: store.name,
              subtitle: `${store.type} · Fulfilling Location`,
              position: storePos,
              type: 'store',
              badge: store.name.split(' ')[0],
            },
            {
              id: 'customer-dest',
              title: `${addressLabel}: ${addressText}`,
              subtitle: 'Delivery Destination',
              position: customerPos,
              type: 'customer',
              badge: `Deliver to ${addressLabel}`,
            },
          ]}
          routeCoordinates={routeWaypoints}
        />

        {/* Real routing info: road vs straight line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mt-2 px-1 gap-1.5">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Route: {store.name} ➔ {addressLabel}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Straight-line: <strong className="text-slate-800">{straightLineKm} km</strong>
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Road: {roadKm} km (~{transitMins} mins)
            </span>
          </div>
        </div>
      </div>

      {/* Buttons Row Below Map */}
      <div className="flex items-center justify-between gap-3 pt-5 mt-2 border-t border-slate-100">
        {/* Back to Cart button */}
        <button
          type="button"
          onClick={onBackToCart}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        {/* Continue to Payment button */}
        <button
          type="button"
          onClick={onContinueToPayment}
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer shadow-emerald-600/20"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
