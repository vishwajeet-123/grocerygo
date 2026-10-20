import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  MapPin,
  Sliders,
  AlertTriangle,
  Store as StoreIcon,
  Navigation,
  Compass,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { StoreCard } from './StoreCard';
import { Store, DeliveryLocation } from '../types';
import { locationApi } from '../utils/api';

export type StoreFilterType =
  | 'All Stores'
  | 'Supermarkets'
  | 'Local Kirana Stores'
  | 'Delivering Now'
  | 'Fast Delivery';

interface NearbyStoresProps {
  onStoreSelected?: (store: Store) => void;
  customerLocation?: { lat: number; lng: number; address: string };
  onOpenLocationModal?: () => void;
}

export const NearbyStores: React.FC<NearbyStoresProps> = ({
  onStoreSelected,
  customerLocation = {
    lat: 12.3392,
    lng: 76.5927,
    address: '#123, 5th Cross, Hootagalli, Mysuru - 570018',
  },
  onOpenLocationModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<StoreFilterType>('All Stores');
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(25);
  const [selectedStoreModal, setSelectedStoreModal] = useState<Store | null>(null);

  // Dynamic nearby data from backend
  const [storeList, setStoreList] = useState<any[]>([]);
  const [surroundingLocalities, setSurroundingLocalities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveringCount, setDeliveringCount] = useState<number>(0);
  const [hasDeliveringStores, setHasDeliveringStores] = useState<boolean>(true);

  // Fetch stores based on selected coordinates and radius
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    locationApi
      .getNearbyStores(customerLocation.lat, customerLocation.lng, searchRadiusKm, 'all')
      .then((data) => {
        if (isCancelled) return;
        setStoreList(data.stores || []);
        setSurroundingLocalities(data.surroundingLocalities || []);
        setDeliveringCount(data.deliveringStoresCount || 0);
        setHasDeliveringStores(data.hasDeliveringStores ?? true);
      })
      .catch((err) => {
        console.warn('Failed to load nearby stores from backend, using local fallback:', err);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [customerLocation.lat, customerLocation.lng, searchRadiusKm]);

  const filteredStores = storeList.filter((store) => {
    if (activeFilter === 'All Stores') return true;
    if (activeFilter === 'Supermarkets') return store.type === 'Supermarket';
    if (activeFilter === 'Local Kirana Stores') return store.type === 'Local Kirana Store';
    if (activeFilter === 'Delivering Now') return store.isDeliveryEligible;
    if (activeFilter === 'Fast Delivery') return (store.minDeliveryMins || 25) <= 25;
    return true;
  });

  const filterOptions: StoreFilterType[] = [
    'All Stores',
    'Supermarkets',
    'Local Kirana Stores',
    'Delivering Now',
    'Fast Delivery',
  ];

  return (
    <section id="stores" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      {/* Title + Radius Selector + Filter Chips */}
      <div className="flex flex-col gap-3.5 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <StoreIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Nearby Stores & Villages
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-700 truncate max-w-[280px] sm:max-w-[400px]">
                  {customerLocation.address.split(',')[0]}
                </span>
                {onOpenLocationModal && (
                  <button
                    type="button"
                    onClick={onOpenLocationModal}
                    className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    (Change Pin)
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Configurable Radius Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-emerald-700" />
              <span>Radius:</span>
            </span>
            {[5, 10, 25, 50, 100].map((radius) => (
              <button
                key={radius}
                type="button"
                onClick={() => setSearchRadiusKm(radius)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  searchRadiusKm === radius
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {radius} km
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
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

          <span className="text-xs text-slate-500 font-medium ml-auto">
            Showing <strong className="text-slate-900">{filteredStores.length}</strong> stores
            ({deliveringCount} serving your address)
          </span>
        </div>
      </div>

      {/* Surrounding Localities & Villages Cards */}
      {surroundingLocalities.length > 0 && (
        <div className="mb-6 bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Surrounding Villages & Localities in this Area</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Discovered from real geographic coordinates
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {surroundingLocalities.map((loc) => (
              <div
                key={loc.name}
                className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                    <span className="uppercase">{loc.type}</span>
                    <span className="text-emerald-700 font-bold">{loc.distanceKm} km</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate" title={loc.name}>
                    {loc.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {loc.district}, {loc.state} {loc.pincode ? `· ${loc.pincode}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="mt-2 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 py-1 px-2 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Explore Stores
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When NO registered store delivers to this location: Show required alert banner */}
      {!hasDeliveringStores && !isLoading && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                  No registered GroceryGo store currently delivers to this location.
                </h3>
                <p className="text-xs text-amber-800 mt-1 max-w-2xl">
                  Stores in our network are currently beyond standard dispatch radius for this address.
                  You can explore nearby stores at higher radius, request new delivery coverage, or pick an alternate address.
                </p>
              </div>
            </div>

            {/* 4 Required Action Options */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setSearchRadiusKm(50)}
                className="px-3 py-2 bg-white hover:bg-amber-100/80 border border-amber-300 text-amber-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Expand Search Radius
              </button>
              {onOpenLocationModal && (
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Delivery in This Area</span>
                </button>
              )}
              {onOpenLocationModal && (
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Choose Another Location
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registered Store Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
          <p className="text-xs font-semibold">Retrieving registered stores & routing metrics...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-2">
          <StoreIcon className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">No stores found within {searchRadiusKm} km</h4>
          <p className="text-xs text-slate-500">
            Expand the search radius to 50 km or 100 km to view regional kirana stores and supermarkets.
          </p>
          <button
            type="button"
            onClick={() => setSearchRadiusKm(50)}
            className="mt-2 px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Expand to 50 km
          </button>
        </div>
      ) : (
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
      )}

      {/* Store Quick Info Modal when clicked */}
      {selectedStoreModal && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedStoreModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden mb-4 border border-slate-200">
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
                ★ {selectedStoreModal.rating} ({selectedStoreModal.reviews})
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {selectedStoreModal.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedStoreModal.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStoreModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Distance & Delivery Info */}
            <div className="grid grid-cols-3 gap-2 my-4 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Distance</span>
                <span className="text-xs font-bold text-slate-800">{selectedStoreModal.distance}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Delivery</span>
                <span className="text-xs font-bold text-emerald-700">{selectedStoreModal.deliveryTime}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Min Order</span>
                <span className="text-xs font-bold text-slate-800">{selectedStoreModal.minOrder || '₹100'}</span>
              </div>
            </div>

            {/* Delivery Eligibility Status */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {selectedStoreModal.isOpen ? 'Open Now · Accepting Delivery Orders' : 'Store is currently closed'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onStoreSelected?.(selectedStoreModal);
                setSelectedStoreModal(null);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer shadow-emerald-600/20"
            >
              Shop from {selectedStoreModal.name}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
