import React, { useState } from 'react';
import { ListingProductCard } from './ListingProductCard';
import { Product, CartItem } from '../types';
import { ShoppingBag, RotateCcw, CheckCircle } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categoryName: string;
  cartItems: CartItem[];
  wishlistIds: string[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  onResetFilters: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categoryName,
  cartItems,
  wishlistIds,
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
  onResetFilters,
}) => {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getProductQuantityInCart = (productId: string): number => {
    const item = cartItems.find((ci) => ci.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddWithFeedback = (product: Product) => {
    onAddToCart(product);
    setRecentlyAddedId(product.id);
    setToastMessage(`Added 1 ${product.name} to your cart`);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1200);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="w-full relative">
      {/* Small Success Confirmation Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Product count and heading */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          {categoryName === 'Fruits & Vegetables' ? 'Fruits & Vegetables' : `${categoryName}`}{' '}
          <span className="text-xs sm:text-sm font-semibold text-emerald-700">
            ({products.length} {products.length === 1 ? 'item' : 'items'})
          </span>
        </h2>
      </div>

      {/* 5-Column Grid on Desktop */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {products.map((product) => (
            <ListingProductCard
              key={product.id}
              product={product}
              quantityInCart={getProductQuantityInCart(product.id)}
              isWishlisted={wishlistIds.includes(product.id)}
              onAddToCart={handleAddWithFeedback}
              onUpdateQuantity={onUpdateQuantity}
              onToggleWishlist={onToggleWishlist}
              justAdded={recentlyAddedId === product.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center my-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No matching products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            No products in {categoryName} match your selected filters (store type, price range, brand, or discount).
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
