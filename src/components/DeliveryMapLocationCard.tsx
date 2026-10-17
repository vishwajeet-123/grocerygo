import React from 'react';
import { Navigation, ArrowRight, ArrowLeft, MapPin, Store } from 'lucide-react';
import { Store as StoreType } from '../types';
import { SavedAddress } from './AddressSelector';

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

      {/* Map Preview Graphic */}
      <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-slate-200 mt-3.5 shadow-2xs group">
        <img
          src="/src/assets/images/store_route_map_preview_1792254220866.jpg"
          alt="Delivery route from Shree Lakshmi Kirana to customer address"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          referrerPolicy="no-referrer"
        />

        {/* Subtle protective gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/15 pointer-events-none" />

        {/* Store marker pin (Top-left) */}
        <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-1.5 bg-white/95 px-2.5 py-1.5 rounded-xl shadow-md border border-red-200 text-xs font-bold text-slate-900">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <Store className="w-3.5 h-3.5 text-red-600" />
          <span>{store.name}</span>
        </div>

        {/* Customer marker pin (Bottom-right) */}
        <div className="absolute bottom-5 right-4 sm:right-6 flex items-center gap-1.5 bg-white/95 px-2.5 py-1.5 rounded-xl shadow-md border border-blue-200 text-xs font-bold text-slate-900">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            {addressLabel}: {addressText}
          </span>
        </div>

        {/* Bottom Route Summary Tag */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[10px] font-bold text-white drop-shadow">
          <span>Hootagalli ➔ {addressLabel}</span>
          <span>·</span>
          <span className="text-emerald-300 font-extrabold">{store.distance} (15–25 mins)</span>
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
