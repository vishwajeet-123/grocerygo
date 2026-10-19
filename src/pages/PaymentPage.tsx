import React, { useState } from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { CheckoutProgress } from '../components/CheckoutProgress';
import { PaymentMethodSelector, PaymentMethod } from '../components/PaymentMethodSelector';
import { OrderSummaryPanel } from '../components/OrderSummaryPanel';
import { PaymentSimulationModal } from '../components/PaymentSimulationModal';
import { CartItem, Store } from '../types';
import { SavedAddress } from '../components/AddressSelector';

interface PaymentPageProps {
  cartItems: CartItem[];
  store: Store;
  selectedAddress: SavedAddress | undefined;
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  couponCode: string;
  couponDiscount: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  onNavigateHome: () => void;
  onNavigateCheckout: () => void;
  onNavigateCart: () => void;
  onNavigateTracking?: () => void;
  onCompleteOrder?: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  cartItems,
  store,
  selectedAddress,
  paymentMethod,
  onSelectPaymentMethod,
  couponCode,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  onNavigateHome,
  onNavigateCheckout,
  onNavigateCart,
  onNavigateTracking,
  onCompleteOrder,
}) => {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  const itemTotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const packingCharge = 10;
  const deliveryFee = 0;
  const totalAmount = Math.max(0, itemTotal + deliveryFee + packingCharge - couponDiscount);

  const deliveryAddressText = selectedAddress
    ? `${selectedAddress.streetAddress}, Mysuru - ${selectedAddress.pincode}`
    : '#123, 5th Cross, Hootagalli, Mysuru - 570018';

  return (
    <div className="pb-16 bg-slate-50/50 min-h-screen">
      {/* 1. Horizontal Four-Step Progress Indicator (Step 2 Active, Step 1 Completed) */}
      <CheckoutProgress currentStep={2} />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        {/* 2. Breadcrumbs: Home > Checkout > Payment */}
        <nav aria-label="Breadcrumb" className="py-2.5 flex items-center text-xs text-slate-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-emerald-700 transition-colors cursor-pointer font-medium flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </li>
            <li className="text-slate-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <button
                type="button"
                onClick={onNavigateCheckout}
                className="hover:text-emerald-700 transition-colors cursor-pointer font-medium"
              >
                Checkout
              </button>
            </li>
            <li className="text-slate-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <span className="font-bold text-slate-900">Payment</span>
            </li>
          </ol>
        </nav>

        {/* 3. Main Two-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 mt-2">
          {/* Left Column: Payment Methods Selection (~68%) */}
          <div className="w-full lg:w-[68%] min-w-0">
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={onSelectPaymentMethod}
              totalAmount={totalAmount}
              onPay={() => setIsSimulationOpen(true)}
              onBackToAddress={onNavigateCheckout}
            />
          </div>

          {/* Right Column: Order Summary (~32%) */}
          <div className="w-full lg:w-[32%] shrink-0">
            <OrderSummaryPanel
              cartItems={cartItems}
              store={store}
              onChangeItems={onNavigateCart}
              couponCode={couponCode}
              couponDiscount={couponDiscount}
              onApplyCoupon={onApplyCoupon}
              onRemoveCoupon={onRemoveCoupon}
              packingCharge={packingCharge}
              deliveryFee={deliveryFee}
            />
          </div>
        </div>
      </div>

      {/* Payment Simulation Receipt Modal */}
      <PaymentSimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        orderNumber={`#GG-MYS-${Math.floor(1000 + Math.random() * 9000)}`}
        store={store}
        deliveryAddress={deliveryAddressText}
        paymentMethod={paymentMethod}
        totalAmount={totalAmount}
        onReturnHome={onNavigateHome}
        onTrackOrder={() => {
          setIsSimulationOpen(false);
          if (onCompleteOrder) {
            onCompleteOrder();
          } else {
            onNavigateTracking?.();
          }
        }}
      />
    </div>
  );
};
