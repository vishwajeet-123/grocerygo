import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import { Store } from '../types';

interface StoreCardProps {
  store: Store;
  onSelectStore?: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onSelectStore }) => {
  return (
    <div
      onClick={() => onSelectStore?.(store)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Wide store photograph at the top with badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* White store-type badge over the image */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[10px] font-semibold text-slate-800 px-2 py-0.5 rounded-md shadow-xs border border-slate-100">
          {store.type}
        </div>

        {/* Green Open status badge */}
        <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Open</span>
        </div>
      </div>

      {/* Store Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Store Name */}
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {store.name}
          </h3>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{store.rating.toFixed(1)}</span>
            </span>
            <span className="text-slate-500 text-[11px]">
              ({store.reviews})
            </span>
          </div>
        </div>

        {/* Distance & Delivery Time */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          {/* Distance */}
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{store.distance}</span>
          </div>

          {/* Delivery time */}
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{store.deliveryTime}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
