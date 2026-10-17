import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Filter } from 'lucide-react';
import { FilterState } from '../types';

interface FilterSidebarProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  availableBrands: string[];
  onClearAll: () => void;
  activeFilterCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterState,
  setFilterState,
  availableBrands,
  onClearAll,
  activeFilterCount,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    storeType: false,
    priceRange: false,
    brand: false,
    discount: false,
  });

  const toggleCollapse = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Store Type change
  const handleStoreTypeChange = (type: string) => {
    setFilterState((prev) => {
      if (type === 'All Stores') {
        return { ...prev, storeTypes: ['All Stores'] };
      }
      let updated = prev.storeTypes.filter((t) => t !== 'All Stores');
      if (updated.includes(type)) {
        updated = updated.filter((t) => t !== type);
      } else {
        updated.push(type);
      }
      if (updated.length === 0) {
        updated = ['All Stores'];
      }
      return { ...prev, storeTypes: updated };
    });
  };

  // Price range change
  const handlePriceRangeChange = (rangeId: string) => {
    setFilterState((prev) => {
      const exists = prev.priceRanges.includes(rangeId);
      const updated = exists
        ? prev.priceRanges.filter((r) => r !== rangeId)
        : [...prev.priceRanges, rangeId];
      return { ...prev, priceRanges: updated };
    });
  };

  // Brand change
  const handleBrandChange = (brand: string) => {
    setFilterState((prev) => {
      const exists = prev.brands.includes(brand);
      const updated = exists
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand];
      return { ...prev, brands: updated };
    });
  };

  // Discount change
  const handleDiscountChange = (discount: number) => {
    setFilterState((prev) => {
      const exists = prev.discounts.includes(discount);
      const updated = exists
        ? prev.discounts.filter((d) => d !== discount)
        : [...prev.discounts, discount];
      return { ...prev, discounts: updated };
    });
  };

  return (
    <div className="pt-3 border-t border-slate-100">
      
      {/* Header: Filters + Clear All */}
      <div className="flex items-center justify-between pb-3 px-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-700" />
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="space-y-4 px-3 text-xs">
        
        {/* Filter 1: Store Type */}
        <div className="border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => toggleCollapse('storeType')}
            className="w-full flex items-center justify-between font-bold text-slate-900 py-1 hover:text-emerald-700 cursor-pointer"
          >
            <span>Store Type</span>
            {collapsedSections.storeType ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsedSections.storeType && (
            <div className="mt-2 space-y-1.5 pl-0.5">
              {[
                { id: 'All Stores', label: 'All Stores' },
                { id: 'Supermarkets', label: 'Supermarkets' },
                { id: 'Local Kirana Stores', label: 'Local Kirana Stores' },
                { id: 'Express Delivery', label: 'Express Delivery (<= 25m)' },
              ].map((opt) => {
                const isChecked = filterState.storeTypes.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 cursor-pointer py-0.5 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleStoreTypeChange(opt.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer accent-emerald-600"
                    />
                    <span className={isChecked ? 'font-bold text-emerald-900' : 'font-normal'}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter 2: Price Range */}
        <div className="border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => toggleCollapse('priceRange')}
            className="w-full flex items-center justify-between font-bold text-slate-900 py-1 hover:text-emerald-700 cursor-pointer"
          >
            <span>Price Range</span>
            {collapsedSections.priceRange ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsedSections.priceRange && (
            <div className="mt-2 space-y-1.5 pl-0.5">
              {[
                { id: 'under-50', label: 'Under ₹50' },
                { id: '50-100', label: '₹50 – ₹100' },
                { id: '100-200', label: '₹100 – ₹200' },
                { id: 'above-200', label: 'Above ₹200' },
              ].map((opt) => {
                const isChecked = filterState.priceRanges.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 cursor-pointer py-0.5 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePriceRangeChange(opt.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer accent-emerald-600"
                    />
                    <span className={isChecked ? 'font-bold text-emerald-900' : 'font-normal'}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter 3: Brand */}
        {availableBrands.length > 0 && (
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => toggleCollapse('brand')}
              className="w-full flex items-center justify-between font-bold text-slate-900 py-1 hover:text-emerald-700 cursor-pointer"
            >
              <span>Brand</span>
              {collapsedSections.brand ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {!collapsedSections.brand && (
              <div className="mt-2 space-y-1.5 pl-0.5 max-h-36 overflow-y-auto">
                {availableBrands.map((brand) => {
                  const isChecked = filterState.brands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className="flex items-center gap-2 text-slate-700 hover:text-slate-900 cursor-pointer py-0.5 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBrandChange(brand)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer accent-emerald-600"
                      />
                      <span className={isChecked ? 'font-bold text-emerald-900' : 'font-normal'}>
                        {brand}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Filter 4: Discount */}
        <div className="pb-1">
          <button
            type="button"
            onClick={() => toggleCollapse('discount')}
            className="w-full flex items-center justify-between font-bold text-slate-900 py-1 hover:text-emerald-700 cursor-pointer"
          >
            <span>Discount</span>
            {collapsedSections.discount ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {!collapsedSections.discount && (
            <div className="mt-2 space-y-1.5 pl-0.5">
              {[
                { val: 10, label: '10% or more' },
                { val: 20, label: '20% or more' },
                { val: 30, label: '30% or more' },
                { val: 50, label: '50% or more' },
              ].map((opt) => {
                const isChecked = filterState.discounts.includes(opt.val);
                return (
                  <label
                    key={opt.val}
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 cursor-pointer py-0.5 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDiscountChange(opt.val)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer accent-emerald-600"
                    />
                    <span className={isChecked ? 'font-bold text-emerald-900' : 'font-normal'}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
