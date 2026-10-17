import React from 'react';
import { SortOption } from '../types';
import { ArrowUpDown, Store, Building2, ShoppingBag, Zap } from 'lucide-react';

export type StoreChipType = 'All' | 'Supermarkets' | 'Local Kirana Stores' | 'Express Delivery';

interface StoreTypeFiltersProps {
  activeChip: StoreChipType;
  onSelectChip: (chip: StoreChipType) => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export const StoreTypeFilters: React.FC<StoreTypeFiltersProps> = ({
  activeChip,
  onSelectChip,
  sortOption,
  onSelectSort,
}) => {
  const chips: {
    id: StoreChipType;
    label: string;
    countLabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'All',
      label: 'All',
      countLabel: '120+ items',
      icon: <Store className="w-3.5 h-3.5" />,
    },
    {
      id: 'Supermarkets',
      label: 'Supermarkets',
      countLabel: '45+ items',
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'Local Kirana Stores',
      label: 'Local Kirana Stores',
      countLabel: '60+ items',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
    },
    {
      id: 'Express Delivery',
      label: 'Express Delivery',
      countLabel: '30+ items',
      icon: <Zap className="w-3.5 h-3.5 fill-current" />,
    },
  ];

  const sortOptions: SortOption[] = [
    'Popularity',
    'Price: Low to High',
    'Price: High to Low',
    'Discount',
    'Name: A to Z',
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-slate-100 mb-4">
      
      {/* Left: Four Filter Chips with relevant icons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {chips.map((chip) => {
          const isSelected = activeChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectChip(chip.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-emerald-900/20 ring-1 ring-emerald-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span className={isSelected ? 'text-lime-300' : 'text-slate-500'}>
                {chip.icon}
              </span>
              <span>{chip.label}</span>
              <span
                className={`text-[10px] font-normal ${
                  isSelected ? 'text-emerald-200' : 'text-slate-400'
                }`}
              >
                · {chip.countLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Sort by Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <label
          htmlFor="sort-select"
          className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort by:</span>
        </label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={(e) => onSelectSort(e.target.value as SortOption)}
          className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
        >
          {sortOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};
