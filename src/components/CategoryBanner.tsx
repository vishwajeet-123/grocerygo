import React from 'react';
import { CategoryItem } from '../data/categories';
import { MapPreview } from './MapPreview';

interface CategoryBannerProps {
  category: CategoryItem;
  selectedLocation: string;
}

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  category,
  selectedLocation,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
      {/* Category Info Banner */}
      <div className="flex-1 bg-[#eaf6ed] border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden min-h-[115px]">
        {/* Left: Title & Description */}
        <div className="z-10 max-w-sm sm:max-w-md pr-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900 font-medium mt-1 leading-snug line-clamp-2">
            {category.description || 'Fresh and healthy groceries from nearby supermarkets and kirana stores.'}
          </p>
        </div>

        {/* Right: Realistic Produce Visual */}
        <div className="w-24 sm:w-28 h-20 sm:h-22 rounded-xl overflow-hidden shrink-0 shadow-2xs border border-emerald-200/40 relative">
          <img
            src={category.bannerImage || '/src/assets/images/promo_fresh_veggies_1792249946113.jpg'}
            alt={category.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Map Preview Card (aligned horizontally side by side) */}
      <MapPreview currentLocationName={selectedLocation} />
    </div>
  );
};
