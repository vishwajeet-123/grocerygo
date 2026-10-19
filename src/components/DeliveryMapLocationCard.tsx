import React from 'react';
import { Navigation, ArrowRight, ArrowLeft, MapPin, Store } from 'lucide-react';
import { Store as StoreType } from '../types';
import { SavedAddress } from './AddressSelector';
import { InteractiveGoogleMap } from './InteractiveGoogleMap';

interface DeliveryMapLocationCardProps {
  store: StoreType;
  selectedAddress: SavedAddress | undefined;
  onBackToCart: () => void;
  onContinueToPayment: () => void;
}

export const DeliveryMapLocationCard: React.FC<DeliveryMapLocationCardProps> = ({
  store,
  selectedAddress,
  onBackToCart,
  onContinueToPayment,
}) => {
  const addressText = selectedAddress
    ? selectedAddress.streetAddress
    : '#123, 5th Cross, Hootagalli, Mysuru - 570018';

  const addressLabel = selectedAddress ? selectedAddress.label : 'Home';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
      {/* Heading */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          4. Map & Delivery Location
        </h2>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          Hyperlocal Route
        </span>
      </div>

      {/* Interactive Google Map Preview */}
      <div className="mt-3.5">
        <InteractiveGoogleMap
          center={{ lat: 12.3392, lng: 76.5927 }}
          zoom={14}
          height="220px"
          markers={[
            {
              id: 'store-origin',
              title: store.name,
              subtitle: 'Dispatching Kirana / Supermarket',
              position: { lat: 12.3392, lng: 76.5927 },
              type: 'store',
              badge: store.name,
            },
            {
              id: 'customer-dest',
              title: `${addressLabel}: ${addressText}`,
              subtitle: 'Delivery Destination',
              position:
                selectedAddress?.label === 'College'
                  ? { lat: 12.2850, lng: 76.6450 }
                  : { lat: 12.3375, lng: 76.5980 },
              type: 'customer',
              badge: `Deliver to ${addressLabel}`,
            },
          ]}
          routeCoordinates={[
            { lat: 12.3392, lng: 76.5927 },
            selectedAddress?.label === 'College'
              ? { lat: 12.2850, lng: 76.6450 }
              : { lat: 12.3375, lng: 76.5980 },
          ]}
        />
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>Route: {store.name} ➔ {addressLabel}</span>
          </span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {store.distance} (15–25 mins)
          </span>
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
