import React, { useState } from 'react';
import {
  Star,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  X,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { CartItem, Store } from '../types';
import { STORES } from '../data/stores';

interface OrderSummaryPanelProps {
  cartItems: CartItem[];
  store: Store;
  onChangeItems: () => void;
  couponCode: string;
  couponDiscount: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  packingCharge?: number;
  deliveryFee?: number;
  onSelectStore?: (storeId: string) => void;
  availableStores?: Store[];
}

export const OrderSummaryPanel: React.FC<OrderSummaryPanelProps> = ({
  cartItems,
  store,
  onChangeItems,
  couponCode,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  packingCharge = 10,
  deliveryFee = 0,
  onSelectStore,
  availableStores = STORES,
}) => {
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(
    couponCode ? `Coupon "${couponCode}" applied!` : ''
  );

  const distinctCount = cartItems.length;

  // Item Total
  const itemTotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Total Amount
  const totalAmount = Math.max(0, itemTotal + deliveryFee + packingCharge - couponDiscount);

  // Dynamic savings from MRP
  const calculatedSavings = cartItems.reduce((acc, item) => {
    const orig = item.product.originalPrice || item.product.price;
    return acc + Math.max(0, orig - item.product.price) * item.quantity;
  }, 0);
  const totalSavings = calculatedSavings + couponDiscount;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!inputCoupon.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    const res = onApplyCoupon(inputCoupon.trim().toUpperCase());
    if (res.success) {
      setCouponSuccess(res.message);
      setInputCoupon('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <aside className="w-full space-y-4">
      {/* 1. Order Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
        {/* Heading + Change Items button */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Order Summary
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              ({distinctCount} {distinctCount === 1 ? 'item' : 'items'})
            </span>
          </div>

          <button
            type="button"
            onClick={onChangeItems}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Change Items
          </button>
        </div>

        {/* Store Information */}
        <div className="py-3 flex items-start gap-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
            <img
              src={store.image}
              alt={store.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {store.name}
                </h3>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                  {store.type || 'Supermarket'}
                </span>
              </div>
              {onSelectStore && (
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer shrink-0"
                  title="Switch fulfilling store"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Change</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{store.rating.toFixed(1)}</span>
              </span>
              <span>({store.reviews})</span>
              <span>·</span>
              <span>{store.distance}</span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold">{store.deliveryTime}</span>
            </div>
          </div>
        </div>

        {/* Order Items List */}
        <div className="py-3 divide-y divide-slate-100 max-h-60 overflow-y-auto scrollbar-thin">
          {cartItems.map((item) => {
            const lineTotal = item.product.price * item.quantity;
            return (
              <div key={item.product.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 p-0.5 flex items-center justify-center shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 block truncate">
                      {item.product.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.product.quantity} × {item.quantity}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 tabular-nums">
                    ₹{lineTotal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Breakdown */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Item Total ({distinctCount} {distinctCount === 1 ? 'item' : 'items'})</span>
            <span className="font-bold text-slate-900 tabular-nums">₹{itemTotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-bold text-emerald-700 tabular-nums">Free (₹0)</span>
          </div>

          <div className="flex justify-between">
            <span>Store Packing Charge</span>
            <span className="font-bold text-slate-900 tabular-nums">₹{packingCharge}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Discount ({couponCode})</span>
              <span className="tabular-nums">- ₹{couponDiscount}</span>
            </div>
          )}

          {/* Divider */}
          <div className="pt-2.5 border-t border-slate-200/90 flex items-baseline justify-between">
            <span className="text-sm font-extrabold text-slate-900">Total Amount</span>
            <span className="text-lg font-black text-emerald-900 tabular-nums">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* Savings Announcement Panel */}
        <div className="mt-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-emerald-900 block">
              You are saving ₹{totalSavings > 0 ? totalSavings : 63} on this order!
            </span>
            <span className="text-[11px] text-emerald-700">
              with local store prices
            </span>
          </div>
        </div>

        {/* Apply Coupon Form */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Apply Coupon
          </label>

          {couponCode ? (
            /* Applied Coupon Pill */
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-black text-emerald-900">{couponCode}</span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  (-₹{couponDiscount} applied)
                </span>
              </div>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                title="Remove coupon"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Coupon Input */
            <form onSubmit={handleApply} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => {
                      setInputCoupon(e.target.value);
                      if (couponError) setCouponError('');
                    }}
                    placeholder="Enter coupon code (try LOCAL10)"
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold uppercase text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase placeholder:normal-case placeholder:font-normal"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-700 font-semibold">{couponSuccess}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* 2. Checkout Benefits */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[11px] font-bold text-slate-700">Secure Checkout</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-100 px-1">
            <RotateCcw className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[11px] font-bold text-slate-700">Easy Returns</span>
          </div>
          <div className="flex flex-col items-center">
            <Headphones className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[11px] font-bold text-slate-700">Support 24/7</span>
          </div>
        </div>
      </div>

      {/* Store Selection Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Select Fulfilling Store</h3>
                <p className="text-xs text-slate-500">Pick a store for delivery dispatch</p>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {availableStores.map((st) => {
                const isCurrent = st.id === store.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      onSelectStore?.(st.id);
                      setIsStoreModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {st.name}
                          </h4>
                          {isCurrent && (
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{st.address}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {st.distance} · {st.deliveryTime}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700'
                      }`}
                    >
                      {isCurrent ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
