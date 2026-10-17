import React from 'react';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product, CartItem } from '../types';

interface FeaturedProductsProps {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  activeCategoryFilter: string | null;
  onResetCategory: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  activeCategoryFilter,
  onResetCategory,
  searchQuery,
  onClearSearch,
}) => {
  const getProductQuantityInCart = (productId: string): number => {
    const item = cartItems.find((ci) => ci.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <section id="featured-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeCategoryFilter ? `${activeCategoryFilter} Products` : 'Featured Products'}
          </h2>

          {activeCategoryFilter && (
            <button
              type="button"
              onClick={onResetCategory}
              className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <span>Filtered: {activeCategoryFilter}</span>
              <RotateCcw className="w-3 h-3 text-emerald-600" />
            </button>
          )}

          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full hover:bg-slate-200 transition-colors"
            >
              <span>Search: "{searchQuery}"</span>
              <span className="text-slate-400 font-bold ml-1">×</span>
            </button>
          )}
        </div>

        {/* View All link */}
        <button
          type="button"
          onClick={() => {
            if (activeCategoryFilter || searchQuery) {
              onResetCategory();
              onClearSearch?.();
            }
          }}
          className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors self-start sm:self-auto shrink-0"
        >
          <span>{activeCategoryFilter || searchQuery ? 'Reset to All 6 Featured' : 'View All'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Six product cards in one horizontal row on desktop */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantityInCart={getProductQuantityInCart(product.id)}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center my-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            We couldn't find items matching your criteria in Hootagalli, Mysuru. Try resetting your search or category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              onResetCategory();
              onClearSearch?.();
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
          >
            Show All Featured Products
          </button>
        </div>
      )}

    </section>
  );
};
