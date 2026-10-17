import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-slate-50/60 transition-colors">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Product image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Product Meta */}
        <div className="min-w-0 space-y-0.5">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">{product.quantity}</span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
              In Stock
            </span>
          </div>

          {/* Unit price & original price */}
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-normal">/ unit</span>
          </div>
        </div>
      </div>

      {/* Right: Quantity Stepper, Line Total, Trash Button */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Stepper [-] Qty [+] */}
        <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => {
              if (quantity > 1) {
                onUpdateQuantity(product.id, quantity - 1);
              }
            }}
            disabled={quantity <= 1}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-l-xl transition-colors ${
              quantity <= 1
                ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer'
            }`}
            title={quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-black text-slate-900 tabular-nums">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-r-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            title="Increase quantity"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Calculated Line Total */}
        <div className="min-w-[70px] sm:min-w-[85px] text-right">
          <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
            ₹{lineTotal}
          </span>
        </div>

        {/* Trash icon button aligned at far right */}
        <button
          type="button"
          onClick={() => onRemoveItem(product.id)}
          className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          title={`Remove ${product.name} from cart`}
          aria-label={`Remove ${product.name}`}
        >
          <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>
    </div>
  );
};
