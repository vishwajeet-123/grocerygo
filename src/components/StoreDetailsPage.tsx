import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  Truck,
  CheckCircle2,
  ChevronRight,
  Store as StoreIcon,
  MapPin,
  X,
  Navigation,
} from 'lucide-react';
import { StoreCoverBanner } from './StoreCoverBanner';
import { StoreInformation } from './StoreInformation';
import { StoreSidebar } from './StoreSidebar';
import { StoreProductCard } from './StoreProductCard';
import { Store, Product, CartItem, SortOption } from '../types';
import { STORES } from '../data/stores';
import { PRODUCTS } from '../data/products';

interface StoreDetailsPageProps {
  currentStoreId?: string;
  onSelectStore: (storeId: string) => void;
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onNavigateHome: () => void;
  selectedLocation: string;
}

export const StoreDetailsPage: React.FC<StoreDetailsPageProps> = ({
  currentStoreId = 'shree-lakshmi-kirana',
  onSelectStore,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onNavigateHome,
  selectedLocation,
}) => {
  const [savedStores, setSavedStores] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('Popularity');
  const [quickFilter, setQuickFilter] = useState<'All' | 'Deals' | 'InStock' | 'Under100'>('All');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Active Store Object
  const currentStore = useMemo(() => {
    return STORES.find((s) => s.id === currentStoreId) || STORES[0];
  }, [currentStoreId]);

  // Saved store toggle
  const isSaved = savedStores.includes(currentStore.id);
  const handleToggleSave = () => {
    setSavedStores((prev) =>
      prev.includes(currentStore.id)
        ? prev.filter((id) => id !== currentStore.id)
        : [...prev, currentStore.id]
    );
  };

  // Toggle wishlist for products
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Products available in this store
  // Primary store 'shree-lakshmi-kirana' has dedicated items; fallback adapts catalog for other stores
  const storeRawProducts = useMemo(() => {
    const directMatches = PRODUCTS.filter((p) => p.storeId === currentStore.id);
    if (directMatches.length > 0) {
      return directMatches;
    }
    // For other stores in demonstration, provide catalog items mapped to this store
    return PRODUCTS.map((p) => ({
      ...p,
      storeId: currentStore.id,
      storeName: currentStore.name,
      storeType: currentStore.type,
      distance: currentStore.distance,
      deliveryTime: currentStore.deliveryTime,
    }));
  }, [currentStore]);

  // Compute in-store categories with counts
  const storeCategories = useMemo(() => {
    const map = new Map<string, number>();
    storeRawProducts.forEach((p) => {
      const cat = p.category || 'General';
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, count], index) => ({
      id: `cat-${index}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      count,
    }));
  }, [storeRawProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...storeRawProducts];

    // 1. In-store category filter
    if (selectedCategory !== 'All Items') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 2. In-store search query
    if (storeSearchQuery.trim()) {
      const q = storeSearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // 3. Quick filter pill
    if (quickFilter === 'Deals') {
      list = list.filter((p) => p.originalPrice > p.price);
    } else if (quickFilter === 'InStock') {
      list = list.filter((p) => p.inStock !== false);
    } else if (quickFilter === 'Under100') {
      list = list.filter((p) => p.price <= 100);
    }

    // 4. Sorting
    switch (sortOption) {
      case 'Price: Low to High':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'Discount':
        list.sort((a, b) => {
          const discA = a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
        break;
      case 'Name: A to Z':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Popularity':
      default:
        list.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        break;
    }

    return list;
  }, [storeRawProducts, selectedCategory, storeSearchQuery, quickFilter, sortOption]);

  const handleAddWithFeedback = (product: Product) => {
    onAddToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 1200);
  };

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pb-14">
      {/* 1. Breadcrumbs Trail */}
      <nav aria-label="Breadcrumb" className="py-2.5 flex items-center text-xs text-slate-500">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-emerald-700 transition-colors cursor-pointer font-medium"
            >
              Home
            </button>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <span className="font-medium text-slate-600">Stores in Mysuru</span>
          </li>
          <li className="text-slate-400">/</li>
          <li className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">
            {currentStore.name}
          </li>
        </ol>
      </nav>

      {/* 2. Store Switcher Bar (Quickly browse any of the 6 stores) */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 mb-4 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <StoreIcon className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-slate-800">Switch Store:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {STORES.map((s) => {
            const isCurrent = s.id === currentStore.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectStore(s.id);
                  setSelectedCategory('All Items');
                  setStoreSearchQuery('');
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{s.name}</span>
                <span className={`text-[10px] font-normal ${isCurrent ? 'text-emerald-100' : 'text-slate-400'}`}>
                  ({s.distance})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Wide Store Cover Banner */}
      <StoreCoverBanner
        store={currentStore}
        isSaved={isSaved}
        onToggleSave={handleToggleSave}
      />

      {/* 4. Overlapping Store Information Card */}
      <StoreInformation store={currentStore} />

      {/* 5. Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-6 mt-2">
        {/* Left Column: Sidebar (Store Categories, Location Map, Store Info) */}
        <StoreSidebar
          store={currentStore}
          categories={storeCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catName) => setSelectedCategory(catName)}
          onOpenMapModal={() => setIsMapModalOpen(true)}
        />

        {/* Right Column: In-Store Product Browsing */}
        <main className="flex-1 w-full min-w-0">
          
          {/* Store Promotion Offer Bar */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl p-3 sm:p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Truck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                  Free Delivery on orders above ₹199 from {currentStore.name}
                </h3>
                <p className="text-[11px] text-emerald-800">
                  Direct neighborhood store pricing • Freshly stocked for local Mysuru deliveries
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-white/90 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto shrink-0 shadow-2xs">
              ⚡ 15–25 Mins Delivery
            </span>
          </div>

          {/* Controls Bar: In-Store Search, Quick Filters & Sort Dropdown */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-2xs mb-4 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Search Inside Store Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  placeholder={`Search items in ${currentStore.name}...`}
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm text-slate-900 transition-all placeholder:text-slate-400"
                />
                {storeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setStoreSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sort by:</span>
                </div>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Popularity">Popularity</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Discount">Biggest Discount</option>
                  <option value="Name: A to Z">Name: A to Z</option>
                </select>
              </div>

            </div>

            {/* Quick Filter Pills Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Filter:
              </span>
              {[
                { id: 'All', label: 'All Items' },
                { id: 'Deals', label: 'Deals & Discounts' },
                { id: 'InStock', label: 'In Stock Only' },
                { id: 'Under100', label: 'Under ₹100' },
              ].map((pill) => {
                const isActive = quickFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setQuickFilter(pill.id as any)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}

              <span className="ml-auto text-xs font-bold text-slate-500 whitespace-nowrap pl-2">
                Showing {filteredAndSortedProducts.length} items
              </span>
            </div>
          </div>

          {/* Products Grid */}
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredAndSortedProducts.map((product) => {
                const cartEntry = cartItems.find((item) => item.product.id === product.id);
                const quantityInCart = cartEntry ? cartEntry.quantity : 0;
                const isWishlisted = wishlistIds.includes(product.id);
                const justAdded = justAddedId === product.id;

                return (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={quantityInCart}
                    isWishlisted={isWishlisted}
                    onAddToCart={handleAddWithFeedback}
                    onUpdateQuantity={onUpdateQuantity}
                    onToggleWishlist={handleToggleWishlist}
                    justAdded={justAdded}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-800">
                No products found in {currentStore.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No items matched "{storeSearchQuery || selectedCategory}". Try resetting the search or exploring other categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStoreSearchQuery('');
                  setSelectedCategory('All Items');
                  setQuickFilter('All');
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Interactive Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {currentStore.name} Location Map
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentStore.address || 'Hootagalli, Mysuru, Karnataka'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Map Graphic */}
            <div className="relative w-full h-80 bg-slate-100">
              <img
                src="/src/assets/images/mysuru_local_map_1792253010616.jpg"
                alt="Mysuru local street map"
                className="w-full h-full object-cover"
              />
              {/* Store Marker Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="bg-emerald-600 text-white p-2 rounded-full shadow-2xl ring-4 ring-white animate-bounce">
                  <StoreIcon className="w-5 h-5" />
                </span>
                <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-lg mt-1 whitespace-nowrap">
                  {currentStore.name} ({currentStore.distance})
                </span>
              </div>
            </div>

            {/* Modal Footer with Live Directions info */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900">
                  Approx. {currentStore.distance} ({currentStore.deliveryTime} delivery)
                </p>
                <p className="text-[11px] text-slate-500">
                  Delivery available directly to {selectedLocation}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${currentStore.name} ${currentStore.address || 'Hootagalli Mysuru'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
