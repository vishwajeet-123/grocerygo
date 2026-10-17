import React from 'react';
import { CategoryItem } from '../data/categories';
import { CategoryVisual } from './CategoryVisual';

interface CategoryCardProps {
  category: CategoryItem;
  isSelected: boolean;
  onSelect: (categoryName: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.name)}
      className={`group flex flex-col items-center text-center p-2 rounded-xl transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0 ${
        isSelected
          ? 'bg-emerald-50/90 ring-2 ring-emerald-600 shadow-xs'
          : 'hover:bg-slate-50'
      }`}
      aria-pressed={isSelected}
    >
      {/* Light-colored rounded image container */}
      <div
        style={{ backgroundColor: category.bgLight }}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center p-2.5 transition-transform duration-200 group-hover:scale-105 border ${
          isSelected ? 'border-emerald-300' : 'border-slate-100 shadow-xs'
        }`}
      >
        <CategoryVisual type={category.iconType} className="w-10 h-10 sm:w-11 sm:h-11" />
      </div>

      {/* Centered category label */}
      <span
        className={`mt-2 text-[11px] sm:text-xs leading-tight transition-colors line-clamp-2 max-w-[84px] ${
          isSelected ? 'font-bold text-emerald-800' : 'font-medium text-slate-700 group-hover:text-emerald-700'
        }`}
      >
        {category.name}
      </span>
    </button>
  );
};
