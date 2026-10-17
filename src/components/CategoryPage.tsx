import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { CategoryBanner } from './CategoryBanner';
import { CategorySidebar } from './CategorySidebar';
import { FilterSidebar } from './FilterSidebar';
import { StoreTypeFilters, StoreChipType } from './StoreTypeFilters';
import { ProductGrid } from './ProductGrid';

import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { Product, CartItem, SortOption, FilterState } from '../types';

interface CategoryPageProps {
  initialCategoryName?: string;
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  selectedLocation: string;
  onNavigateHome: () => void;
  searchQuery?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  initialCategoryName = 'Fruits & Vegetables',
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  selectedLocation,
  onNavigateHome,
  searchQuery = '',
}) => {
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(initialCategoryName);
  const [activeChip, setActiveChip] = useState<StoreChipType>('All');
  const [sortOption, setSortOption] = useState<SortOption>('Popularity');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Filter state
  const initialFilterState: FilterState = {
    storeTypes: ['All Stores'],
    priceRanges: [],
    brands: [],
    discounts: [],
  };
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);

  // Current category object
  const currentCategory = useMemo(() => {
    return (
      CATEGORIES.find((c) => c.name === selectedCategoryName) ||
      CATEGORIES[0]
    );
  }, [selectedCategoryName]);

  // Available brands in the current category
  const availableBrands = useMemo(() => {
    const categoryProducts = PRODUCTS.filter((p) => p.category === selectedCategoryName);
    const brandsSet = new Set<string>();
    categoryProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [selectedCategoryName]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!filterState.storeTypes.includes('All Stores')) count += filterState.storeTypes.length;
    count += filterState.priceRanges.length;
    count += filterState.brands.length;
    count += filterState.discounts.length;
    if (activeChip !== 'All') count += 1;
    return count;
  }, [filterState, activeChip]);

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilterState(initialFilterState);
    setActiveChip('All');
  };

  // Toggle wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Filter & sort products
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filter by current category
    let list = PRODUCTS.filter((p) => p.category === selectedCategoryName);

    // 2. Filter by search query if any
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.storeName && p.storeName.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // 3. Filter by horizontal store chip
    if (activeChip === 'Supermarkets') {
      list = list.filter((p) => p.storeType === 'Supermarket');
    } else if (activeChip === 'Local Kirana Stores') {
      list = list.filter((p) => p.storeType === 'Local Kirana Store');
    } else if (activeChip === 'Express Delivery') {
      list = list.filter((p) => p.isExpressDelivery);
    }

    // 4. Filter by sidebar Store Type checkboxes
    if (!filterState.storeTypes.includes('All Stores') && filterState.storeTypes.length > 0) {
      list = list.filter((p) => {
        if (filterState.storeTypes.includes('Supermarkets') && p.storeType === 'Supermarket') return true;
        if (filterState.storeTypes.includes('Local Kirana Stores') && p.storeType === 'Local Kirana Store') return true;
        if (filterState.storeTypes.includes('Express Delivery') && p.isExpressDelivery) return true;
        return false;
      });
    }

    // 5. Filter by price ranges
    if (filterState.priceRanges.length > 0) {
      list = list.filter((p) => {
        return filterState.priceRanges.some((range) => {
          if (range === 'under-50') return p.price < 50;
          if (range === '50-100') return p.price >= 50 && p.price <= 100;
          if (range === '100-200') return p.price > 100 && p.price <= 200;
          if (range === 'above-200') return p.price > 200;
          return false;
        });
      });
    }

    // 6. Filter by brands
    if (filterState.brands.length > 0) {
      list = list.filter((p) => p.brand && filterState.brands.includes(p.brand));
    }

    // 7. Filter by discount percent
    if (filterState.discounts.length > 0) {
      list = list.filter((p) => {
        const discount = p.originalPrice > p.price
          ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
          : 0;
        return filterState.discounts.some((minDiscount) => discount >= minDiscount);
      });
    }

    // 8. Sorting
    const sorted = [...list];
    switch (sortOption) {
      case 'Price: Low to High':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'Discount':
        sorted.sort((a, b) => {
          const discA = a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
        break;
      case 'Name: A to Z':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Popularity':
      default:
        sorted.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        break;
    }

    return sorted;
  }, [selectedCategoryName, searchQuery, activeChip, filterState, sortOption]);

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        currentCategoryName={currentCategory.name}
        onNavigateHome={onNavigateHome}
        onNavigateCategories={() => setSelectedCategoryName('Fruits & Vegetables')}
      />

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-6 mt-1">
        
        {/* Left Sidebar (approx 270px width) */}
        <aside className="w-full lg:w-[270px] shrink-0 bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs">
          {/* Categories List */}
          <CategorySidebar
            selectedCategoryName={selectedCategoryName}
            onSelectCategory={(name) => {
              setSelectedCategoryName(name);
              // Reset brands filter when category changes
              setFilterState((prev) => ({ ...prev, brands: [] }));
            }}
          />

          {/* Collapsible Filters */}
          <FilterSidebar
            filterState={filterState}
            setFilterState={setFilterState}
            availableBrands={availableBrands}
            onClearAll={handleClearAllFilters}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 w-full min-w-0">
          
          {/* Category Banner + Map Preview */}
          <CategoryBanner
            category={currentCategory}
            selectedLocation={selectedLocation}
          />

          {/* Store-Type Filter Chips + Sorting Control */}
          <StoreTypeFilters
            activeChip={activeChip}
            onSelectChip={setActiveChip}
            sortOption={sortOption}
            onSelectSort={setSortOption}
          />

          {/* Product Grid */}
          <ProductGrid
            products={filteredAndSortedProducts}
            categoryName={currentCategory.name}
            cartItems={cartItems}
            wishlistIds={wishlistIds}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            onToggleWishlist={handleToggleWishlist}
            onResetFilters={handleClearAllFilters}
          />

        </div>

      </div>

    </div>
  );
};
