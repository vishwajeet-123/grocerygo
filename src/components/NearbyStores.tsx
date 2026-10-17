import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { STORES } from '../data/stores';
import { StoreCard } from './StoreCard';
import { Store } from '../types';

export type StoreFilterType = 'All Stores' | 'Supermarkets' | 'Local Kirana Stores' | 'Fast Delivery';

interface NearbyStoresProps {
  onStoreSelected?: (store: Store) => void;
}

export const NearbyStores: React.FC<NearbyStoresProps> = ({ onStoreSelected }) => {
  const [activeFilter, setActiveFilter] = useState<StoreFilterType>('All Stores');
  const [selectedStoreModal, setSelectedStoreModal] = useState<Store | null>(null);

  const filteredStores = STORES.filter((store) => {
    if (activeFilter === 'All Stores') return true;
    if (activeFilter === 'Supermarkets') return store.type === 'Supermarket';
    if (activeFilter === 'Local Kirana Stores') return store.type === 'Local Kirana Store';
    if (activeFilter === 'Fast Delivery') return store.minDeliveryMins <= 25;
    return true;
  });

  const filterOptions: StoreFilterType[] = [
    'All Stores',
    'Supermarkets',
    'Local Kirana Stores',
    'Fast Delivery',
  ];

  return (
    <section id="stores" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      
      {/* Title + Filter Chips + View All */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight shrink-0">
            Nearby Stores
          </h2>

          {/* Four Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {filterOptions.map((filter) => {
              const isSelected = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                  aria-pressed={isSelected}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* View All link */}
        <button
          type="button"
          onClick={() => setActiveFilter('All Stores')}
          className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors self-start md:self-auto shrink-0"
        >
          <span>View All ({filteredStores.length})</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Six store cards in one horizontal row on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onSelectStore={(st) => {
              setSelectedStoreModal(st);
              onStoreSelected?.(st);
            }}
          />
        ))}
      </div>

      {/* Store Quick Info Modal when clicked */}
      {selectedStoreModal && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedStoreModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-4">
              <img
                src={selectedStoreModal.image}
                alt={selectedStoreModal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2.5 left-2.5 bg-white text-slate-800 font-bold text-xs px-2.5 py-1 rounded-md shadow-xs">
                {selectedStoreModal.type}
              </span>
              <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-xs">
                Open Now
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">{selectedStoreModal.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedStoreModal.address}</p>

            <div className="grid grid-cols-3 gap-2 my-4 bg-slate-50 p-3 rounded-xl text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Rating</span>
                <span className="text-sm font-bold text-amber-600">★ {selectedStoreModal.rating}</span>
                <span className="text-[10px] text-slate-400 block">({selectedStoreModal.reviews})</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Distance</span>
                <span className="text-sm font-bold text-slate-800">{selectedStoreModal.distance}</span>
                <span className="text-[10px] text-slate-400 block">Mysuru radius</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Delivery Time</span>
                <span className="text-sm font-bold text-emerald-700">{selectedStoreModal.deliveryTime}</span>
                <span className="text-[10px] text-emerald-600 block">Express dispatch</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedStoreModal) {
                    onStoreSelected?.(selectedStoreModal);
                  }
                  setSelectedStoreModal(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
              >
                Open {selectedStoreModal.name}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStoreModal(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
