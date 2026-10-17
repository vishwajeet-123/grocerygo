import React, { useState } from 'react';
import { Clock, MapPin, Navigation, Store, X } from 'lucide-react';
import { Store as StoreType } from '../types';

interface DeliveryMapCardProps {
  store: StoreType;
  customerAddress: string;
}

export const DeliveryMapCard: React.FC<DeliveryMapCardProps> = ({
  store,
  customerAddress,
}) => {
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Delivery from this Store
          </h2>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {store.distance} route
          </span>
        </div>

        {/* Map Preview Graphic */}
        <div
          onClick={() => setIsFullMapOpen(true)}
          className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 mt-3 cursor-pointer group shadow-2xs"
          title="Click to expand delivery route map"
        >
          {/* Background Map Snapshot */}
          <img
            src="/src/assets/images/store_route_map_preview_1792254220866.jpg"
            alt="Delivery route from Shree Lakshmi Kirana to customer home"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            referrerPolicy="no-referrer"
          />

          {/* Protective gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10" />

          {/* Red Marker for Store (Left/Top) */}
          <div className="absolute top-4 left-6 flex items-center gap-1.5 bg-white/95 px-2 py-1 rounded-lg shadow-md border border-red-200 text-[10px] font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="truncate max-w-[110px]">{store.name}</span>
          </div>

          {/* Blue Marker for Customer (Right/Bottom) */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/95 px-2 py-1 rounded-lg shadow-md border border-blue-200 text-[10px] font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>You (Home)</span>
          </div>

          {/* Locality badge on map */}
          <div className="absolute bottom-2 left-3 text-[10px] font-bold text-white drop-shadow">
            Hootagalli, Mysuru
          </div>

          {/* Expand badge */}
          <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
            <Navigation className="w-2.5 h-2.5 text-lime-400" />
            <span>View Route</span>
          </div>
        </div>

        {/* Estimated Delivery Time Panel (Pale-green) */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3 mt-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
              Estimated Delivery Time
            </span>
            <span className="text-sm font-extrabold text-emerald-950 block">
              15–25 mins
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Route Modal */}
      {isFullMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Mysuru Delivery Route Preview
                  </h3>
                  <p className="text-xs text-slate-500">
                    {store.name} ➔ Hootagalli Customer Location
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullMapOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full h-72 bg-slate-100">
              <img
                src="/src/assets/images/store_route_map_preview_1792254220866.jpg"
                alt="Delivery Route in Hootagalli Mysuru"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-900">
                  Direct Delivery Route: {store.distance} (15–25 mins)
                </p>
                <p className="text-slate-500 text-[11px]">
                  Local Mysuru delivery partner assigned upon order placement
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullMapOpen(false)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
