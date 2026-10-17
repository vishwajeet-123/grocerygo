import React from 'react';
import { Heart, Plus, Minus, Store as StoreIcon, Clock, MapPin, Check } from 'lucide-react';
import { Product } from '../types';

interface ListingProductCardProps {
  product: Product;
  quantityInCart: number;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  justAdded?: boolean;
}

export const ListingProductCard: React.FC<ListingProductCardProps> = ({
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
      
      {/* 1. Product Image Container with 2. Red Discount Badge & 3. Wishlist Heart */}
      <div className="relative w-full aspect-square bg-slate-50/70 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2.5">
        
        {/* 2. Optional Red Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-2xs tracking-tight">
            {discountPercent}% OFF
          </span>
        )}

        {/* 3. Outlined Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-white shadow-2xs transition-colors cursor-pointer"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 hover:scale-110 ${
              isWishlisted
                ? 'fill-red-500 text-red-500 scale-105'
                : 'text-slate-400 stroke-[1.8] hover:text-red-500'
            }`}
          />
        </button>

        {/* Image */}
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

        {/* Added confirmation feedback badge */}
        {justAdded && (
          <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-2xs flex items-center justify-center animate-in fade-in duration-150">
            <span className="bg-white text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              Added!
            </span>
          </div>
        )}
      </div>

      {/* Card Content in strict visual order */}
      <div className="flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1">
          {/* 4. Product Name */}
          <h4 className="font-bold text-xs sm:text-[13px] text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {product.name}
          </h4>

          {/* 5. Quantity or Weight */}
          <p className="text-[11px] text-slate-500 font-medium">
            {product.quantity}
          </p>

          {/* 6. Current price and original price */}
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through tabular-nums">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* 7. Green store icon and store name */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700 pt-1 border-t border-slate-100">
            <StoreIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-semibold text-slate-800">
              {product.storeName || 'Local Store'}
            </span>
          </div>

          {/* 8. Distance and delivery time */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{product.distance || '0.8 km'}</span>
            </span>
            <span className="flex items-center gap-0.5 font-medium text-slate-600">
              <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{product.deliveryTime || '20–30 mins'}</span>
            </span>
          </div>
        </div>

        {/* 9. Full-width Add Button */}
        <div className="pt-1">
          {quantityInCart === 0 ? (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="w-full flex items-center justify-center gap-1.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Add</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between bg-emerald-50 border border-emerald-600 text-emerald-800 rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="p-1 sm:p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-colors cursor-pointer"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-extrabold tabular-nums min-w-[20px] text-center text-emerald-950">
                {quantityInCart} in cart
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="p-1 sm:p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-colors cursor-pointer"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
