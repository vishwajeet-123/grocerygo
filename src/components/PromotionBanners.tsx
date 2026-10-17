import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PromotionBannersProps {
  onShopCategory: (categoryName: string) => void;
}

export const PromotionBanners: React.FC<PromotionBannersProps> = ({ onShopCategory }) => {
  const handleBannerClick = (categoryName: string) => {
    onShopCategory(categoryName);
    const element = document.getElementById('featured-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        
        {/* Banner 1: Fresh Vegetables */}
        <div className="bg-[#eaf7ec] border border-emerald-200/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col justify-between h-full z-10 pr-2">
            <div>
              {/* Discount badge */}
              <span className="inline-block bg-emerald-700 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md mb-2 shadow-xs">
                UP TO 30% OFF
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Fresh Vegetables
              </h3>
              <p className="text-xs text-emerald-800 font-medium mt-1">
                From Local Kirana Stores
              </p>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleBannerClick('Fruits & Vegetables')}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner Image */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-xs border border-emerald-200/50">
            <img
              src="/src/assets/images/promo_fresh_veggies_1792249946113.jpg"
              alt="Fresh vegetables from local kirana stores"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Banner 2: Daily Essentials */}
        <div className="bg-[#fff3e8] border border-orange-200/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col justify-between h-full z-10 pr-2">
            <div>
              {/* Discount badge */}
              <span className="inline-block bg-orange-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md mb-2 shadow-xs">
                UP TO 50% OFF
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Daily Essentials
              </h3>
              <p className="text-xs text-orange-800 font-medium mt-1">
                At Best Prices
              </p>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleBannerClick('Atta, Rice & Grains')}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner Image */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-xs border border-orange-200/50">
            <img
              src="/src/assets/images/promo_daily_staples_1792249946343.jpg"
              alt="Daily kitchen essentials and staples"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Banner 3: Dairy & Breakfast */}
        <div className="bg-[#eaf4ff] border border-sky-200/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col justify-between h-full z-10 pr-2">
            <div>
              <span className="inline-flex items-center gap-1 text-sky-800 font-bold text-[10px] tracking-wider uppercase bg-sky-100 px-2 py-0.5 rounded-md mb-2">
                <Sparkles className="w-3 h-3 text-sky-600" />
                Fresh Morning Dispatch
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Dairy & Breakfast
              </h3>
              <p className="text-xs text-sky-800 font-medium mt-1">
                Fresh and Healthy
              </p>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleBannerClick('Dairy & Eggs')}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner Image */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-xs border border-sky-200/50">
            <img
              src="/src/assets/images/promo_dairy_breakfast_1792249962902.jpg"
              alt="Fresh dairy and breakfast items"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
