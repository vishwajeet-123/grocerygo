import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface PriceDetailsCardProps {
  distinctItemCount: number;
  itemTotal: number;
  packingCharge: number;
  deliveryFee: number;
  totalAmount: number;
  totalSavings: number;
  onProceedToCheckout: () => void;
  isDisabled: boolean;
}

export const PriceDetailsCard: React.FC<PriceDetailsCardProps> = ({
  distinctItemCount,
  itemTotal,
  packingCharge,
  deliveryFee,
  totalAmount,
  totalSavings,
  onProceedToCheckout,
  isDisabled,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
      {/* Heading */}
      <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 tracking-tight">
        Price Details
      </h2>

      {/* Rows */}
      <div className="py-3.5 space-y-2.5 text-xs sm:text-sm">
        {/* Item Total */}
        <div className="flex items-center justify-between text-slate-700">
          <span>Item Total ({distinctItemCount} {distinctItemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-bold text-slate-900 tabular-nums">
            ₹{itemTotal}
          </span>
        </div>

        {/* Delivery Fee */}
        <div className="flex items-center justify-between text-slate-700">
          <span>Delivery Fee</span>
          <span className="font-bold text-emerald-700 tabular-nums">
            Free (₹0)
          </span>
        </div>

        {/* Store Packing Charge */}
        <div className="flex items-center justify-between text-slate-700">
          <span>Store Packing Charge</span>
          <span className="font-bold text-slate-900 tabular-nums">
            ₹{packingCharge}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200/90 pt-3.5 pb-4">
        {/* Total Amount (bold, larger, dark green) */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-extrabold text-slate-900">
            Total Amount
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-900 tabular-nums">
            ₹{totalAmount}
          </span>
        </div>

        {/* Savings announcement if any */}
        {totalSavings > 0 && (
          <div className="mt-2.5 bg-emerald-50 text-emerald-800 rounded-xl p-2 text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>You are saving ₹{totalSavings} on this order!</span>
          </div>
        )}
      </div>

      {/* Full-width dark-green button: Proceed to Checkout -> */}
      <button
        type="button"
        onClick={onProceedToCheckout}
        disabled={isDisabled}
        className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
          isDisabled
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white cursor-pointer shadow-emerald-700/20'
        }`}
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Safety assurance */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Safe & Secure Checkout · Local Kirana Assurance</span>
      </div>
    </div>
  );
};
