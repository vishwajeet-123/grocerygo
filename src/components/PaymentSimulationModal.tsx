import React from 'react';
import { CheckCircle2, ShieldCheck, MapPin, Store, Clock, X, ArrowRight } from 'lucide-react';
import { Store as StoreType } from '../types';
import { PaymentMethod } from './PaymentMethodSelector';

interface PaymentSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  store: StoreType;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  onReturnHome: () => void;
  onTrackOrder?: () => void;
}

export const PaymentSimulationModal: React.FC<PaymentSimulationModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  store,
  deliveryAddress,
  paymentMethod,
  totalAmount,
  onReturnHome,
  onTrackOrder,
}) => {
  if (!isOpen) return null;

  const getMethodName = (m: PaymentMethod) => {
    switch (m) {
      case 'upi':
        return 'UPI (grocerygo@upi)';
      case 'card':
        return 'Credit / Debit Card';
      case 'netbanking':
        return 'Net Banking';
      case 'cod':
        return 'Cash on Delivery (COD)';
      case 'wallet':
        return 'Digital Wallet';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Payment Simulation</h3>
              <p className="text-xs text-slate-500">GroceryGo Test Environment</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-center">
          {/* Success Animated Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">
              Test Order Simulated Successfully!
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Order ID: <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
            </p>
          </div>

          {/* Receipt Details Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-black text-emerald-900 text-sm">₹{totalAmount}</span>
            </div>

            <div className="flex items-start gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Fulfilling Store</span>
                <p className="text-[11px] text-slate-500">{store.name} ({store.distance})</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Delivery Address</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">{deliveryAddress}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Payment Mode</span>
              <span className="font-bold text-slate-800">{getMethodName(paymentMethod)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Estimated Delivery</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                15 - 25 mins
              </span>
            </div>
          </div>

          {/* Safe Test Notice per Section 19 */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 text-[11px] text-amber-900 leading-relaxed text-left">
            ℹ️ <strong>Prototype Simulation:</strong> No actual financial transaction was executed and no payment credentials were charged. Real-world payments and database records will be connected via Java Spring Boot and PostgreSQL in a future phase.
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {onTrackOrder && (
              <button
                type="button"
                onClick={onTrackOrder}
                className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Track Live Order (Maps)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onReturnHome}
              className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
