import React from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryVisual } from './CategoryVisual';
import { ChevronRight } from 'lucide-react';

interface CategorySidebarProps {
  selectedCategoryName: string;
  onSelectCategory: (categoryName: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategoryName,
  onSelectCategory,
}) => {
  return (
    <div className="mb-5">
      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight pb-2.5 px-3">
        Categories
      </h3>

      <div className="space-y-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategoryName === cat.name;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  <CategoryVisual type={cat.iconType} className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-[13px] truncate">
                  {cat.name}
                </span>
              </div>

              {isSelected ? (
                <div className="w-1.5 h-4 bg-emerald-600 rounded-full shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
