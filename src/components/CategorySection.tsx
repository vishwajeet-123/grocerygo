import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CategoryCard } from './CategoryCard';

interface CategorySectionProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string) => void;
  onResetCategory: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  selectedCategory,
  onSelectCategory,
  onResetCategory,
}) => {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          {selectedCategory && (
            <button
              type="button"
              onClick={onResetCategory}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium"
            >
              <span>{selectedCategory}</span>
              <RotateCcw className="w-3 h-3 text-emerald-600" />
              <span className="text-[11px] underline">Clear</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (selectedCategory) {
              onResetCategory();
            } else {
              const element = document.getElementById('featured-products');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <span>{selectedCategory ? 'Show All Products' : 'View All'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Ten Category Cards in one horizontal row on desktop */}
      <div className="relative">
        <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2 scrollbar-none sm:gap-3 lg:gap-2">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategory === cat.name}
              onSelect={(name) => {
                if (selectedCategory === name) {
                  onResetCategory();
                } else {
                  onSelectCategory(name);
                  const el = document.getElementById('featured-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
