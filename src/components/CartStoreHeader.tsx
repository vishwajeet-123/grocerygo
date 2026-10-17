import React from 'react';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Store } from '../types';

interface CartStoreHeaderProps {
  store: Store;
  onViewStore: (storeId: string) => void;
}

export const CartStoreHeader: React.FC<CartStoreHeaderProps> = ({ store, onViewStore }) => {
  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs mb-5">
      {/* Left: Square store image + store metadata */}
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
        {/* Square store photograph */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-emerald-200/70 shrink-0 bg-slate-100 shadow-2xs">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Store text info */}
        <div className="min-w-0 space-y-1">
          {/* Name & Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {store.name}
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              Kirana Store
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200/60 font-bold text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{store.rating.toFixed(1)}</span>
            </span>
            <span className="text-slate-500 text-[11px] font-medium">
              ({store.reviews} reviews)
            </span>
          </div>

          {/* Location and delivery details */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
            {/* Location */}
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">{store.distance} away</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 text-[11px] truncate max-w-[200px] sm:max-w-[280px]">
                {store.address || '#123, Hootagalli, Mysuru - 570018'}
              </span>
            </div>

            {/* Delivery time */}
            <div className="flex items-center gap-1 font-semibold text-emerald-800">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{store.deliveryTime || '15–25 mins'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: View Store button */}
      <button
        type="button"
        onClick={() => onViewStore(store.id)}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-200 hover:border-emerald-600 shadow-2xs transition-all duration-150 cursor-pointer shrink-0 self-start sm:self-auto"
      >
        <span>View Store</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
