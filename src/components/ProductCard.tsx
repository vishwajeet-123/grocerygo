import React from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 group relative">
      
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {discountPercent}% OFF
        </span>
      )}

      {/* Product Packshot */}
      <div className="relative w-full aspect-square bg-slate-50/70 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2.5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback in case of any loading failure
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Product Name */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Weight / Quantity */}
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {product.quantity}
          </p>

          {/* Source Store (subtle indicator) */}
          {product.storeName && (
            <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
              {product.storeName}
            </p>
          )}
        </div>

        {/* Price & Add Button Row */}
        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          {/* Prices */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through tabular-nums">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Control */}
          {quantityInCart === 0 ? (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="inline-flex items-center justify-center gap-1 border-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <div className="inline-flex items-center bg-emerald-700 text-white rounded-lg shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="p-1 sm:p-1.5 hover:bg-emerald-800 transition-colors cursor-pointer"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 text-xs font-bold tabular-nums min-w-[20px] text-center">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="p-1 sm:p-1.5 hover:bg-emerald-800 transition-colors cursor-pointer"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
