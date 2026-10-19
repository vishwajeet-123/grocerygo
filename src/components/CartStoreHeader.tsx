import React, { useState } from 'react';
import { Star, MapPin, Clock, ArrowRight, ArrowLeftRight, Check, X, Store as StoreIcon } from 'lucide-react';
import { Store } from '../types';
import { STORES } from '../data/stores';

interface CartStoreHeaderProps {
  store: Store;
  onViewStore: (storeId: string) => void;
  onSelectStore?: (storeId: string) => void;
  availableStores?: Store[];
}

export const CartStoreHeader: React.FC<CartStoreHeaderProps> = ({
  store,
  onViewStore,
  onSelectStore,
  availableStores = STORES,
}) => {
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  return (
    <>
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
                {store.type || 'Kirana Store'}
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

        {/* Right Action Buttons: Change Store & View Store */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {onSelectStore && (
            <button
              type="button"
              onClick={() => setIsSwitchModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Switch fulfilling store (e.g. to Reliance Smart)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Change Store</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewStore(store.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-all duration-150 cursor-pointer"
          >
            <span>View Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Switch Store Modal */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <StoreIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Select Fulfilling Store</h3>
                  <p className="text-xs text-slate-500">Pick a store to fulfill your cart and order</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {availableStores.map((st) => {
                const isCurrent = st.id === store.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      onSelectStore?.(st.id);
                      setIsSwitchModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {st.name}
                          </h4>
                          {isCurrent && (
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{st.address}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {st.distance} · {st.deliveryTime}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700'
                      }`}
                    >
                      {isCurrent ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
