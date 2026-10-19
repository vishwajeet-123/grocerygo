import React from 'react';
import { Home, Store, Grid, Tag, Info, Package, Truck } from 'lucide-react';

export type AppPage =
  | 'home'
  | 'categories'
  | 'stores'
  | 'offers'
  | 'cart'
  | 'checkout'
  | 'payment'
  | 'orders'
  | 'tracking'
  | 'about'
  | 'dashboard'
  | 'delivery'
  | 'admin';

interface SecondaryNavigationProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  activeOrderCount?: number;
  userRole?: 'customer' | 'store_owner' | 'delivery_partner' | 'admin';
  onOpenAuthModal?: () => void;
}

export const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({
  currentPage,
  onNavigate,
  activeOrderCount = 2,
  userRole = 'customer',
  onOpenAuthModal,
}) => {
  return (
    <nav className="bg-white border-b border-slate-100 py-1.5 shadow-2xs">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium">
          
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-1.5 py-1.5 relative transition-colors cursor-pointer shrink-0 ${
              currentPage === 'home'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
            {currentPage === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('stores')}
            className={`flex items-center gap-1.5 py-1.5 relative transition-colors cursor-pointer shrink-0 ${
              currentPage === 'stores'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Stores</span>
            {currentPage === 'stores' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className={`flex items-center gap-1.5 py-1.5 relative transition-colors cursor-pointer shrink-0 ${
              currentPage === 'categories'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Categories</span>
            {currentPage === 'categories' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          {/* Phase 6: My Orders */}
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className={`flex items-center gap-1.5 py-1.5 relative transition-colors cursor-pointer shrink-0 ${
              currentPage === 'orders'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders</span>
            {activeOrderCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeOrderCount}
              </span>
            )}
            {currentPage === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          {/* Phase 6: Live Order Tracking */}
          <button
            type="button"
            onClick={() => onNavigate('tracking')}
            className={`flex items-center gap-1.5 py-1.5 relative transition-colors cursor-pointer shrink-0 ${
              currentPage === 'tracking'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="flex items-center gap-1">
              <span>Track Order</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </span>
            {currentPage === 'tracking' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('offers')}
            className={`flex items-center gap-1.5 py-1.5 relative transition-colors cursor-pointer shrink-0 ${
              currentPage === 'offers'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Offers</span>
            {currentPage === 'offers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('about')}
            className={`flex items-center gap-1.5 py-1.5 relative transition-colors cursor-pointer shrink-0 ${
              currentPage === 'about'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
            {currentPage === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                currentPage === 'dashboard'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Store Owner</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('delivery')}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                currentPage === 'delivery'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Delivery Partner</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                currentPage === 'admin'
                  ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Center</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
