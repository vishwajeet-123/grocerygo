import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  selectedLocation: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedLocation,
}) => {
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const originalSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.originalPrice * item.quantity,
    0
  );
  const savings = Math.max(0, originalSubtotal - subtotal);
  const deliveryFee = subtotal >= 199 || subtotal === 0 ? 0 : 25;
  const finalTotal = subtotal + deliveryFee;

  const handleCheckoutDemo = () => {
    setShowCheckoutSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Your Cart</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} from local stores
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location dispatch info */}
          <div className="bg-emerald-50/70 px-4 py-2 border-b border-emerald-100/60 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Delivering to: <strong className="font-semibold">{selectedLocation}</strong></span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 shrink-0 ml-2 bg-emerald-100 px-1.5 py-0.5 rounded">
              20–30 min
            </span>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cartItems.length > 0 ? (
              <>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Basket Summary
                  </span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[11px] font-semibold text-red-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {cartItems.map(({ product, quantity }) => {
                  const itemSubtotal = product.price * quantity;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 bg-slate-50 rounded-lg overflow-hidden shrink-0 p-1 flex items-center justify-center border border-slate-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {product.quantity} · ₹{product.price} each
                        </p>
                        <p className="text-[10px] text-emerald-700 font-medium truncate">
                          {product.storeName}
                        </p>
                      </div>

                      {/* Stepper & Subtotal */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 tabular-nums">
                          ₹{itemSubtotal}
                        </span>

                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          {quantity === 1 ? (
                            <button
                              type="button"
                              onClick={() => onRemoveItem(product.id)}
                              className="p-1 text-red-500 hover:bg-white rounded transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                              className="p-1 text-slate-700 hover:bg-white rounded transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          <span className="px-2 text-xs font-bold text-slate-900 tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="p-1 text-slate-700 hover:bg-white rounded transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Free Delivery Promo Bar */}
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-xs">
                  {subtotal >= 199 ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Congratulations! You get <strong>FREE delivery</strong> on this order.</span>
                    </div>
                  ) : (
                    <div className="text-emerald-800 font-medium">
                      Add <strong>₹{199 - subtotal}</strong> more to unlock <strong>FREE local delivery</strong>!
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Explore fresh produce and grocery essentials from your favorite supermarkets and neighborhood kirana stores in Mysuru.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer with Bill Details & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
              
              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₹{subtotal}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Savings</span>
                    <span className="tabular-nums">- ₹{savings}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Partner Fee</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {deliveryFee === 0 ? <span className="text-emerald-600 uppercase font-bold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-800 tabular-nums text-base">₹{finalTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckoutDemo}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-between shadow-md transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium bg-emerald-700/60 px-2 py-0.5 rounded">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
                <span className="font-bold">Proceed to Checkout</span>
                <span className="tabular-nums font-bold">₹{finalTotal}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phase 1 Frontend Demonstration · No real payment charged</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Checkout Success Demonstration Modal */}
      {showCheckoutSuccess && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-slate-900">Order Preview Successful!</h4>
              <p className="text-xs text-slate-600 mt-1">
                Your demonstration order of <strong>₹{finalTotal}</strong> from local stores in Mysuru has been simulated.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-left text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold">Vishwajeet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Address:</span>
                <span className="font-medium">{selectedLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Dispatch:</span>
                <span className="font-bold text-emerald-700">15–25 mins</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Note: Backend database, Spring Boot API, and live payment gateway will be integrated in Phase 2.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowCheckoutSuccess(false);
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
            >
              Back to GroceryGo Homepage
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
