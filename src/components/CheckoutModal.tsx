import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CartItem, Store } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  packingCharge: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
  store: Store;
  onOrderPlaced: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  packingCharge,
  deliveryFee,
  totalAmount,
  deliveryAddress,
  store,
  onOrderPlaced,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'upi' | 'card'>('cod');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePlaceOrder = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onOrderPlaced();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Checkout & Order Review</h3>
              <p className="text-xs text-slate-500">GroceryGo Mysuru Express Delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          /* Order placed confirmation state */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-black text-slate-900">
              Demo Order Placed Successfully!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Order <span className="font-bold text-emerald-800">#GO-MYS-7821</span> confirmed from{' '}
              <span className="font-semibold">{store.name}</span>. Estimated delivery in{' '}
              <span className="font-semibold">15–25 mins</span> to your Hootagalli address.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 max-w-sm mx-auto">
              ℹ️ <strong>Demonstration Note:</strong> In Phase 4, frontend state simulates order placement. Real backend persistence and SMS OTP tracking will be linked with Java Spring Boot & PostgreSQL.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Review and place order form */
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Delivery address info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Deliver to Home</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">{deliveryAddress}</span>
              </div>
            </div>

            {/* Fulfilling Store */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-bold text-slate-900">Fulfilling Store:</span>
                <span className="text-emerald-900 font-semibold">{store.name}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                15–25 mins
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">
                Select Payment Method
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'cod',
                    label: 'Cash on Delivery (Pay at doorstep)',
                    icon: <Banknote className="w-4 h-4 text-emerald-600" />,
                    sub: 'Recommended for neighborhood kirana delivery',
                  },
                  {
                    id: 'upi',
                    label: 'UPI (Google Pay / PhonePe / Paytm / QR)',
                    icon: <Smartphone className="w-4 h-4 text-purple-600" />,
                    sub: 'Pay directly via any UPI app at delivery',
                  },
                  {
                    id: 'card',
                    label: 'Debit / Credit Card / Netbanking',
                    icon: <CreditCard className="w-4 h-4 text-blue-600" />,
                    sub: 'Visa, Mastercard, RuPay cards accepted',
                  },
                ].map((pay) => (
                  <label
                    key={pay.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPayment === pay.id
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === pay.id}
                      onChange={() => setSelectedPayment(pay.id as any)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {pay.icon}
                        <span>{pay.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{pay.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-emerald-700">Free (₹0)</span>
              </div>
              <div className="flex justify-between">
                <span>Store Packing Charge</span>
                <span className="font-semibold text-slate-900">₹{packingCharge}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-emerald-800 text-base">₹{totalAmount}</span>
              </div>
            </div>

            {/* Demonstration Notice */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-500">
              🔒 <strong>Safe & Contactless:</strong> GroceryGo ensures hygienic handling and real-time delivery updates in Mysuru.
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Confirm & Place Order (₹{totalAmount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
