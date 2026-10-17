import React from 'react';
import { Star, MapPin, Clock, Tag, CheckCircle2 } from 'lucide-react';
import { Store } from '../types';

interface StoreInformationProps {
  store: Store;
}

export const StoreInformation: React.FC<StoreInformationProps> = ({ store }) => {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-4 sm:px-6 pt-3 pb-5 mb-5 mt-[-24px] sm:mt-[-30px] z-20">
      <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-5">
        
        {/* Overlapping Square Store Photograph */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-2xl overflow-hidden border-3 border-white shadow-md shrink-0 bg-slate-100 mt-[-16px] sm:mt-[-24px]">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Store is Open" />
        </div>

        {/* Store Identity & Stats */}
        <div className="flex-1 min-w-0">
          
          {/* Name & Type Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {store.name}
            </h1>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              {store.type === 'Supermarket' ? 'Supermarket' : 'Kirana Store'}
            </span>
          </div>

          {/* Rating, Open Status, Closing Time Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-slate-600">
            {/* Rating */}
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200/60 font-extrabold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{store.rating.toFixed(1)}</span>
              </span>
              <span className="text-slate-500 font-medium text-[11px]">
                ({store.reviews} reviews)
              </span>
            </div>

            <span className="text-slate-300">·</span>

            {/* Status */}
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open Now
            </span>

            <span className="text-slate-300">·</span>

            {/* Closing Time */}
            <span className="text-slate-500 text-[11px]">
              {store.closingTime || 'Closes at 10:00 PM'}
            </span>
          </div>

          {/* Three Compact Information Groups with subtle vertical dividers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3.5 pt-3.5 border-t border-slate-100 text-xs">
            
            {/* 1. Location */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/80">
                <MapPin className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate">
                  {store.distance} away
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {store.address || '#123, Hootagalli, Mysuru - 570018'}
                </span>
              </div>
            </div>

            {/* 2. Estimated Delivery Time */}
            <div className="flex items-start gap-2.5 sm:border-l sm:border-slate-100 sm:pl-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/80">
                <Clock className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate">
                  {store.deliveryTime || '15 - 25 mins'}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  Estimated delivery time
                </span>
              </div>
            </div>

            {/* 3. Minimum Order */}
            <div className="flex items-start gap-2.5 sm:border-l sm:border-slate-100 sm:pl-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/80">
                <Tag className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate">
                  {store.minOrder || '₹100'}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {store.deliveryFee === 'Free (₹0)' ? 'No extra delivery fee' : 'Standard local delivery'}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
