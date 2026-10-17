import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Home,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import { CartItem, Product, Store } from '../types';
import { STORES } from '../data/stores';
import { PRODUCTS } from '../data/products';
import { CartStoreHeader } from './CartStoreHeader';
import { CartItemRow } from './CartItemRow';
import { AddMoreItems } from './AddMoreItems';
import { DeliveryLocationCard } from './DeliveryLocationCard';
import { DeliveryMapCard } from './DeliveryMapCard';
import { PriceDetailsCard } from './PriceDetailsCard';
import { CheckoutModal } from './CheckoutModal';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onAddToCart: (product: Product) => void;
  onNavigateHome: () => void;
  onNavigateStores: () => void;
  onNavigateCategories: () => void;
  onViewStore: (storeId: string) => void;
  selectedLocation: string;
  onUpdateLocation: (newLocation: string) => void;
  onRestoreSampleCart: () => void;
  onNavigateCheckout?: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddToCart,
  onNavigateHome,
  onNavigateStores,
  onNavigateCategories,
  onViewStore,
  selectedLocation,
  onUpdateLocation,
  onRestoreSampleCart,
  onNavigateCheckout,
}) => {
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [deliveryLabel, setDeliveryLabel] = useState('Home');
  const [deliveryAddress, setDeliveryAddress] = useState(
    selectedLocation || '#123, 5th Cross, Hootagalli, Mysuru - 570018'
  );

  // Shree Lakshmi Kirana is the primary fulfilling store
  const fulfillingStore: Store = STORES[0];

  // Distinct product entries count (e.g. 4 items initially)
  const distinctItemCount = cartItems.length;

  // Total quantity count (sum of all units, e.g. 5 units initially)
  const totalUnitsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Section 15 price calculations
  // Item Total = Sum of (Unit Price * Quantity)
  const itemTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  // Savings calculation (Original price - current price)
  const totalSavings = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const orig = item.product.originalPrice || item.product.price;
      return acc + Math.max(0, orig - item.product.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  // Configurable fees per prompt Section 15
  const deliveryFee = 0; // Free delivery (₹0)
  const packingCharge = cartItems.length > 0 ? 10 : 0; // ₹10 store packing charge
  const totalAmount = itemTotal + deliveryFee + packingCharge;

  // Handle location update from child modal
  const handleLocationUpdate = (label: string, addr: string) => {
    setDeliveryLabel(label);
    setDeliveryAddress(addr);
    onUpdateLocation(addr);
  };

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* 1. Breadcrumb: Home > Cart */}
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
            <span className="font-bold text-slate-900">Cart</span>
          </li>
        </ol>
      </nav>

      {/* Main Two-Column Layout (Desktop ~68% Left, ~32% Right) */}
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 mt-1">
        
        {/* LEFT COLUMN: ~68–70% */}
        <section className="w-full lg:w-[68%] min-w-0">
          
          {/* Cart Heading Row */}
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Cart
              </h1>
              <span className="text-sm sm:text-base font-semibold text-slate-500">
                ({distinctItemCount} {distinctItemCount === 1 ? 'item' : 'items'})
              </span>
            </div>

            {/* Clear Cart Button */}
            {distinctItemCount > 0 && (
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                title="Remove all items from cart"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cart</span>
              </button>
            )}
          </div>

          {/* Store Information Card (Shree Lakshmi Kirana) */}
          <CartStoreHeader
            store={fulfillingStore}
            onViewStore={onViewStore}
          />

          {/* Cart Item List or Empty State */}
          {cartItems.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                />
              ))}
            </div>
          ) : (
            /* Useful Empty-Cart State */
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Your cart is empty
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                You haven’t added any items to your cart yet. Explore fresh produce, dairy, and pantry essentials from nearby stores in Mysuru.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onNavigateCategories}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  Explore Categories
                </button>
                <button
                  type="button"
                  onClick={onNavigateStores}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Browse Stores
                </button>
                <button
                  type="button"
                  onClick={onRestoreSampleCart}
                  className="px-4 py-2.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Sample Cart (4 items)</span>
                </button>
              </div>
            </div>
          )}

          {/* Add More Items Section (Section 11: Potato, Banana, Milk, Sunflower Oil) */}
          <AddMoreItems onAddToCart={onAddToCart} />
        </section>

        {/* RIGHT COLUMN: ~30–32% */}
        <aside className="w-full lg:w-[32%] shrink-0 space-y-4">
          
          {/* 1. Delivery Location Card */}
          <DeliveryLocationCard
            locationLabel={deliveryLabel}
            address={deliveryAddress}
            onUpdateLocation={handleLocationUpdate}
          />

          {/* 2. Delivery from this Store Card (Map + Time) */}
          <DeliveryMapCard
            store={fulfillingStore}
            customerAddress={deliveryAddress}
          />

          {/* 3. Price Details Card */}
          <PriceDetailsCard
            distinctItemCount={distinctItemCount}
            itemTotal={itemTotal}
            packingCharge={packingCharge}
            deliveryFee={deliveryFee}
            totalAmount={totalAmount}
            totalSavings={totalSavings}
            onProceedToCheckout={() => {
              if (onNavigateCheckout) {
                onNavigateCheckout();
              } else {
                setIsCheckoutModalOpen(true);
              }
            }}
            isDisabled={cartItems.length === 0}
          />
        </aside>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Clear your shopping cart?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to remove all {distinctItemCount} items from your cart? You can easily restore the sample cart anytime.
            </p>

            <div className="flex items-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setIsClearConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-2xs cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Preview Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        subtotal={itemTotal}
        packingCharge={packingCharge}
        deliveryFee={deliveryFee}
        totalAmount={totalAmount}
        deliveryAddress={deliveryAddress}
        store={fulfillingStore}
        onOrderPlaced={() => {
          // Keep cart or offer clear
        }}
      />
    </div>
  );
};
