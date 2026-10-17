import React from 'react';
import { Heart, Plus, Minus, Check } from 'lucide-react';
import { Product } from '../types';

interface StoreProductCardProps {
  product: Product;
  quantityInCart: number;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  justAdded?: boolean;
}

export const StoreProductCard: React.FC<StoreProductCardProps> = ({
  product,
  quantityInCart,
  isWishlisted,
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
  justAdded = false,
}) => {
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 group relative h-full">
      {/* 1. Image & Top Badges Container */}
      <div className="relative w-full aspect-square bg-slate-50/80 rounded-xl overflow-hidden flex items-center justify-center p-2.5 mb-2.5">
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded shadow-2xs tracking-tight">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-2xs transition-colors cursor-pointer"
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform duration-200 hover:scale-110 ${
              isWishlisted
                ? 'fill-red-500 text-red-500 scale-105'
                : 'text-slate-400 hover:text-red-500'
            }`}
          />
        </button>

        {/* Product Photograph Packshot */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Just added indicator */}
        {justAdded && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-2xs flex items-center justify-center animate-in fade-in duration-150 z-20">
            <span className="bg-white text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              Added!
            </span>
          </div>
        )}
      </div>

      {/* 2. Product Details */}
      <div className="flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1">
          {/* Veg Mark + Stock Badge */}
          <div className="flex items-center justify-between gap-1">
            {/* Standard Indian Green Vegetarian Symbol */}
            <div className="flex items-center gap-1" title="100% Vegetarian Grocery">
              <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs p-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              </span>
              <span className="text-[10px] font-semibold text-emerald-800">Veg</span>
            </div>

            {/* In stock badge */}
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              In Stock
            </span>
          </div>

          {/* Product Name */}
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 pt-0.5">
            {product.name}
          </h4>

          {/* Pack size / Quantity */}
          <p className="text-[11px] text-slate-500 font-medium">
            {product.quantity}
          </p>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* 3. Add to Cart Button or Quantity Stepper */}
        <div className="pt-2">
          {quantityInCart === 0 ? (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="w-full flex items-center justify-center gap-1.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl px-2 py-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </button>
              <span className="text-xs font-black px-2 tabular-nums">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
