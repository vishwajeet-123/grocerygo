import React, { useState } from 'react';
import { Store, Truck, Percent, Leaf, MapPin, Search, ChevronDown, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  selectedLocation: string;
  onOpenLocationModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  onQuickCategoryClick?: (categoryName: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedLocation,
  onOpenLocationModal,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-6">
      <div className="bg-[#eaf5ed] border border-emerald-100/80 rounded-2xl md:rounded-3xl p-5 sm:p-8 lg:p-9 shadow-sm relative overflow-hidden">
        
        {/* Subtle background ambient accents */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-lime-200/20 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          
          {/* Left Visual Area (lg: 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            
            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold text-slate-900 leading-tight tracking-tight">
              Groceries from{' '}
              <span className="text-emerald-700 font-black">
                Supermarkets & Local Kirana Stores
              </span>{' '}
              at Your Doorstep
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Fresh fruits, vegetables, dairy, snacks and more from your nearby stores.
              Support local businesses. Fast delivery. Better prices.
            </p>

            {/* Location Selector */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-emerald-100 shadow-sm text-xs text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {selectedLocation || 'Hootagalli, Mysuru, Karnataka'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit(e);
              }}
              className="pt-1 w-full"
            >
              <div
                className={`flex items-center bg-white rounded-xl sm:rounded-2xl border p-1 sm:p-1.5 shadow-sm transition-all ${
                  isFocused ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="pl-3 pr-2 text-slate-400 shrink-0">
                  <Search className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search for products, stores or categories..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none py-1.5"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors shadow-sm shrink-0 whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              {/* Popular quick tags for Mysuru */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[11px] text-slate-500">
                <span className="font-medium text-emerald-800">Popular:</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Tomato')}
                  className="hover:text-emerald-700 hover:underline"
                >
                  Tomatoes
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Amul')}
                  className="hover:text-emerald-700 hover:underline"
                >
                  Amul Milk
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Kirana')}
                  className="hover:text-emerald-700 hover:underline"
                >
                  Kirana Stores
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Atta')}
                  className="hover:text-emerald-700 hover:underline"
                >
                  Aashirvaad Atta
                </button>
              </div>
            </form>

          </div>

          {/* Center Visual Area: Realistic Grocery Basket (lg: 4 cols) */}
          <div className="lg:col-span-4 flex items-center justify-center py-2 lg:py-0">
            <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden bg-emerald-100/40 p-2 shadow-inner border border-emerald-100">
              <img
                src="/src/assets/images/hero_grocery_basket_1792249944761.jpg"
                alt="Fresh grocery basket with tomatoes, carrots, capsicum, and leafy vegetables"
                className="w-full h-full object-cover rounded-xl transition-transform hover:scale-102 duration-300"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-100 text-[11px] font-medium text-emerald-900 flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Farm-Fresh Harvest
                </span>
                <span className="text-emerald-700 font-semibold">100% Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Right Visual Area: Four Vertically Stacked Service Highlights (lg: 3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-3.5 bg-white/70 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-emerald-100/70 shadow-xs">
            
            {/* 1. Wide Choice */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <Store className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Wide Choice
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                  Supermarkets & Local Kirana Stores
                </p>
              </div>
            </div>

            {/* 2. Fast Delivery */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Fast Delivery
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                  From nearby stores
                </p>
              </div>
            </div>

            {/* 3. Best Prices */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <Percent className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Best Prices
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                  Compare and save
                </p>
              </div>
            </div>

            {/* 4. Fresh Products */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <Leaf className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Fresh Products
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                  Quality you can trust
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
