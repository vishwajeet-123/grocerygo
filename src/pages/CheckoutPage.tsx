import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { CheckoutProgress } from '../components/CheckoutProgress';
import { AddressSelector, SavedAddress } from '../components/AddressSelector';
import { DeliveryInstructions } from '../components/DeliveryInstructions';
import { DeliveryTimeSelector, DeliveryTimeOption } from '../components/DeliveryTimeSelector';
import { DeliveryMapLocationCard } from '../components/DeliveryMapLocationCard';
import { OrderSummaryPanel } from '../components/OrderSummaryPanel';
import { CartItem, Store } from '../types';

interface CheckoutPageProps {
  cartItems: CartItem[];
  store: Store;
  addresses: SavedAddress[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddNewAddress: (address: Omit<SavedAddress, 'id'>) => void;
  onEditAddress: (address: SavedAddress) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  deliveryInstructions: string;
  onChangeDeliveryInstructions: (text: string) => void;
  deliveryTimeOption: DeliveryTimeOption;
  onSelectDeliveryTimeOption: (option: DeliveryTimeOption) => void;
  couponCode: string;
  couponDiscount: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  onNavigateHome: () => void;
  onNavigateCart: () => void;
  onContinueToPayment: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  store,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  deliveryInstructions,
  onChangeDeliveryInstructions,
  deliveryTimeOption,
  onSelectDeliveryTimeOption,
  couponCode,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  onNavigateHome,
  onNavigateCart,
  onContinueToPayment,
}) => {
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  return (
    <div className="pb-16 bg-slate-50/50 min-h-screen">
      {/* 1. Horizontal Four-Step Progress Indicator */}
      <CheckoutProgress currentStep={1} />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        {/* 2. Breadcrumbs: Home > Cart > Checkout */}
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
                onClick={onNavigateCart}
                className="hover:text-emerald-700 transition-colors cursor-pointer font-medium"
              >
                Cart
              </button>
            </li>
            <li className="text-slate-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <span className="font-bold text-slate-900">Checkout</span>
            </li>
          </ol>
        </nav>

        {/* 3. Main Two-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 mt-2">
          {/* Left Column: Form & Address Details (~68%) */}
          <div className="w-full lg:w-[68%] min-w-0">
            {/* Step 1: Delivery Address */}
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={onSelectAddress}
              onAddNewAddress={onAddNewAddress}
              onEditAddress={onEditAddress}
              onDeleteAddress={onDeleteAddress}
              onSetDefault={onSetDefaultAddress}
            />

            {/* Step 2: Delivery Instructions (Optional) */}
            <DeliveryInstructions
              instructions={deliveryInstructions}
              onChange={onChangeDeliveryInstructions}
            />

            {/* Step 3: Delivery Time */}
            <DeliveryTimeSelector
              selectedOption={deliveryTimeOption}
              onSelectOption={onSelectDeliveryTimeOption}
            />

            {/* Step 4: Map & Delivery Location + Navigation Buttons */}
            <DeliveryMapLocationCard
              store={store}
              selectedAddress={selectedAddress}
              onBackToCart={onNavigateCart}
              onContinueToPayment={onContinueToPayment}
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
              packingCharge={10}
              deliveryFee={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
