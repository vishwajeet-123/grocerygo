import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SecondaryNavigation, AppPage } from './components/SecondaryNavigation';
import { HeroBanner } from './components/HeroBanner';
import { CategorySection } from './components/CategorySection';
import { NearbyStores } from './components/NearbyStores';
import { PromotionBanners } from './components/PromotionBanners';
import { FeaturedProducts } from './components/FeaturedProducts';
import { CategoryPage } from './components/CategoryPage';
import { StoreDetailsPage } from './components/StoreDetailsPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { LocationModal } from './components/LocationModal';
import { Footer } from './components/Footer';

import { PRODUCTS } from './data/products';
import { STORES } from './data/stores';
import { CATEGORIES } from './data/categories';
import { INITIAL_ORDERS } from './data/orders';
import { Product, CartItem, Store, Order } from './types';
import { SavedAddress } from './components/AddressSelector';
import { DeliveryTimeOption } from './components/DeliveryTimeSelector';
import { PaymentMethod } from './components/PaymentMethodSelector';
import { Info, X, MapPin } from 'lucide-react';

export default function App() {
  // Exact 4 initial demonstration cart entries matching Section 9:
  // 1. Aashirvaad Atta: 5 kg, ₹240 (orig ₹280), qty: 1 -> ₹240
  // 2. Tomato: 1 kg, ₹30 (orig ₹35), qty: 2 -> ₹60
  // 3. Onion: 1 kg, ₹32 (orig ₹40), qty: 1 -> ₹32
  // 4. Maggi Noodles: 280 g, ₹60 (orig ₹70), qty: 1 -> ₹60
  // Distinct Items: 4 | Total Units: 5 | Subtotal: ₹392 | Packing: ₹10 | Total: ₹402
  // Dynamic sample cart based on active store (Shree Lakshmi Kirana or Reliance Smart)
  const getSampleCartItems = (storeId: string = 'shree-lakshmi-kirana'): CartItem[] => {
    if (storeId === 'reliance-smart') {
      const rsAtta = PRODUCTS.find((p) => p.id === 'rs-aashirvaad-atta') || PRODUCTS[4];
      const rsTomato = PRODUCTS.find((p) => p.id === 'rs-tomato') || PRODUCTS[0];
      const rsOnion = PRODUCTS.find((p) => p.id === 'rs-onion') || PRODUCTS[1];
      const rsMaggi = PRODUCTS.find((p) => p.id === 'rs-maggi-noodles') || PRODUCTS[7];
      return [
        { product: rsAtta, quantity: 1 },
        { product: rsTomato, quantity: 2 },
        { product: rsOnion, quantity: 1 },
        { product: rsMaggi, quantity: 1 },
      ];
    }

    const atta = PRODUCTS.find((p) => p.id === 'slk-aashirvaad-atta') || PRODUCTS[4];
    const tomato = PRODUCTS.find((p) => p.id === 'slk-tomato') || PRODUCTS[0];
    const onion = PRODUCTS.find((p) => p.id === 'slk-onion') || PRODUCTS[1];
    const maggi = PRODUCTS.find((p) => p.id === 'slk-maggi-noodles') || PRODUCTS[7];

    return [
      { product: atta, quantity: 1 },
      { product: tomato, quantity: 2 },
      { product: onion, quantity: 1 },
      { product: maggi, quantity: 1 },
    ];
  };

  const [cartItems, setCartItems] = useState<CartItem[]>(getSampleCartItems());
  const [storeToast, setStoreToast] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Active page
  const [currentPage, setCurrentPage] = useState<AppPage>('tracking');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('shree-lakshmi-kirana');
  const [activeCategorySlug, setActiveCategorySlug] = useState('Fruits & Vegetables');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('#123, 5th Cross, Hootagalli, Mysuru - 570018');

  // Phase 6: Orders & Live Tracking state
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string>('ord-8492');

  // Shared Checkout & Payment state
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-home',
      label: 'Home',
      recipientName: 'Vishwajeet',
      phone: '+91 98765 43210',
      streetAddress: '#123, 5th Cross, Hootagalli, Mysuru - 570018',
      landmark: 'Near Primary Health Center',
      pincode: '570018',
      isDefault: true,
    },
    {
      id: 'addr-college',
      label: 'College',
      recipientName: 'Vishwajeet',
      phone: '+91 98765 43210',
      streetAddress: 'NIE, Manandavadi Road, Mysuru - 570008',
      landmark: 'National Institute of Engineering Main Gate',
      pincode: '570008',
      isDefault: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-home');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');
  const [deliveryTimeOption, setDeliveryTimeOption] = useState<DeliveryTimeOption>('express');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Primary fulfilling store (Shree Lakshmi Kirana)
  const fulfillingStore = useMemo(() => {
    return STORES.find((s) => s.id === selectedStoreId) || STORES[0];
  }, [selectedStoreId]);

  // Selected address object
  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  }, [addresses, selectedAddressId]);

  // Current active tracked order for OrderTrackingPage
  const currentTrackedOrder = useMemo(() => {
    return orders.find((o) => o.id === activeTrackingOrderId) || orders[0];
  }, [orders, activeTrackingOrderId]);

  // Active ongoing orders count for header / nav badges
  const activeOrderCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [orders]);

  // Handle URL hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('tracking')) {
        setCurrentPage('tracking');
      } else if (hash.includes('orders')) {
        setCurrentPage('orders');
      } else if (hash.includes('payment')) {
        setCurrentPage('payment');
      } else if (hash.includes('checkout')) {
        setCurrentPage('checkout');
      } else if (hash.includes('cart')) {
        setCurrentPage('cart');
      } else if (hash.includes('home')) {
        setCurrentPage('home');
      } else if (hash.includes('stores')) {
        setCurrentPage('stores');
        const matchedStore = STORES.find((s) => hash.includes(s.id));
        if (matchedStore) setSelectedStoreId(matchedStore.id);
      } else if (hash.includes('categories')) {
        setCurrentPage('categories');
        if (hash.includes('dairy')) setActiveCategorySlug('Dairy & Eggs');
        else if (hash.includes('atta')) setActiveCategorySlug('Atta, Rice & Grains');
        else setActiveCategorySlug('Fruits & Vegetables');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Header cart badge reflects distinct product entries in cart (4 items initially)
  const cartBadgeCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  // Item total for coupon calculation
  const itemTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  // Store selection & Cart migration operation
  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    const targetStore = STORES.find((s) => s.id === storeId) || STORES[0];

    // Synchronize cart items to the selected store (e.g. Reliance Smart)
    setCartItems((prevItems) => {
      if (prevItems.length === 0) {
        return getSampleCartItems(storeId);
      }
      return prevItems.map((item) => {
        // Try finding matching item in target store (e.g., Tomato, Atta, Onion)
        const match = PRODUCTS.find(
          (p) =>
            p.storeId === storeId &&
            (p.name.toLowerCase().includes(item.product.name.toLowerCase().split(' ')[0]) ||
              p.category === item.product.category)
        );
        if (match) {
          return { product: match, quantity: item.quantity };
        }
        // Adapt item metadata to the new store
        return {
          ...item,
          product: {
            ...item.product,
            id: `${storeId}-${item.product.id.replace(/^(slk|rs|prod)-/, '')}`,
            storeId: targetStore.id,
            storeName: targetStore.name,
            storeType: targetStore.type,
            distance: targetStore.distance,
            deliveryTime: targetStore.deliveryTime,
          },
        };
      });
    });

    setStoreToast(`Cart is now fulfilled by ${targetStore.name} (${targetStore.type})`);
    setTimeout(() => setStoreToast(null), 3500);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    // If the product belongs to a specific store (e.g. Reliance Smart)
    if (product.storeId && product.storeId !== selectedStoreId) {
      setSelectedStoreId(product.storeId);
    }

    setCartItems((prevItems) => {
      // Check if previous cart was from another store
      const hasDifferentStore =
        product.storeId &&
        prevItems.some((it) => it.product.storeId && it.product.storeId !== product.storeId);

      let workingItems = prevItems;
      if (hasDifferentStore && product.storeId) {
        const targetStore = STORES.find((s) => s.id === product.storeId);
        // Seamlessly transfer cart to target store
        workingItems = prevItems.map((it) => ({
          ...it,
          product: {
            ...it.product,
            storeId: targetStore?.id || product.storeId,
            storeName: targetStore?.name || product.storeName,
            storeType: targetStore?.type || product.storeType,
            distance: targetStore?.distance || product.distance,
            deliveryTime: targetStore?.deliveryTime || product.deliveryTime,
          },
        }));
        setStoreToast(`Added ${product.name} from ${product.storeName || targetStore?.name || 'store'}!`);
        setTimeout(() => setStoreToast(null), 3500);
      }

      const existing = workingItems.find((item) => item.product.id === product.id);
      if (existing) {
        return workingItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...workingItems, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCouponDiscount(0);
    setCouponCode('');
  };

  const handleRestoreSampleCart = () => {
    setCartItems(getSampleCartItems(selectedStoreId));
  };

  // Address operations
  const handleAddNewAddress = (newAddr: Omit<SavedAddress, 'id'>) => {
    const id = `addr-${Date.now()}`;
    const entry: SavedAddress = { ...newAddr, id };
    if (entry.isDefault) {
      setAddresses((prev) => [
        ...prev.map((a) => ({ ...a, isDefault: false })),
        entry,
      ]);
    } else {
      setAddresses((prev) => [...prev, entry]);
    }
    setSelectedAddressId(id);
    setSelectedLocation(`${entry.streetAddress}, Mysuru - ${entry.pincode}`);
  };

  const handleEditAddress = (updated: SavedAddress) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === updated.id) {
          return updated;
        }
        if (updated.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
    if (updated.id === selectedAddressId) {
      setSelectedLocation(`${updated.streetAddress}, Mysuru - ${updated.pincode}`);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (selectedAddressId === id && remaining.length > 0) {
        setSelectedAddressId(remaining[0].id);
        setSelectedLocation(`${remaining[0].streetAddress}, Mysuru - ${remaining[0].pincode}`);
      }
      return remaining;
    });
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  // Coupon operations
  const handleApplyCoupon = (code: string) => {
    if (code === couponCode) {
      return { success: false, message: 'Coupon is already applied.' };
    }
    if (code === 'LOCAL10') {
      const discount = Math.round(itemTotal * 0.1);
      setCouponCode('LOCAL10');
      setCouponDiscount(discount);
      return {
        success: true,
        message: `Coupon "LOCAL10" applied! You saved 10% (₹${discount}).`,
      };
    }
    return {
      success: false,
      message: 'Invalid coupon code. Try "LOCAL10" for a 10% demonstration discount.',
    };
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Complete simulated order from fulfillingStore
  const handleCompleteOrder = () => {
    const newOrderId = `ord-${Date.now().toString().slice(-4)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: newOrderId,
      orderNumber: `#GG-MYS-${randomSuffix}`,
      createdAt: 'Just now',
      status: 'confirmed',
      store: fulfillingStore,
      deliveryAddress: {
        id: selectedAddress.id,
        name: selectedAddress.label,
        address: `${selectedAddress.streetAddress}, Mysuru - ${selectedAddress.pincode}`,
        landmark: selectedAddress.landmark,
        lat: selectedAddress.label === 'College' ? 12.285 : 12.3375,
        lng: selectedAddress.label === 'College' ? 76.645 : 76.598,
        distanceKm: fulfillingStore.distanceKm || 2.1,
        estimatedMins: fulfillingStore.minDeliveryMins || 25,
        isRemote: false,
        localityType: 'hyperlocal',
        deliveryFee: 0,
        areaTag: 'Local Delivery',
      },
      items: [...cartItems],
      subtotal: itemTotal,
      packingFee: 10,
      deliveryFee: 0,
      discount: couponDiscount,
      totalAmount: Math.max(0, itemTotal + 10 - couponDiscount),
      paymentMethod,
      paymentStatus: 'paid',
      timeline: [
        {
          status: 'placed',
          title: 'Order Placed',
          description: `Received by ${fulfillingStore.name} system`,
          time: 'Just now',
          isCompleted: true,
          isCurrent: false,
        },
        {
          status: 'confirmed',
          title: 'Order Confirmed',
          description: `${fulfillingStore.name} store manager confirmed items`,
          time: 'Just now',
          isCompleted: true,
          isCurrent: true,
        },
        {
          status: 'packing',
          title: 'Packing Items',
          description: 'Hygiene checked and sealed in tamper-proof carry bag',
          time: 'In progress',
          isCompleted: false,
          isCurrent: false,
        },
        {
          status: 'out_for_delivery',
          title: 'Out for Delivery',
          description: 'Assigned to delivery executive',
          time: 'Upcoming',
          isCompleted: false,
          isCurrent: false,
        },
        {
          status: 'delivered',
          title: 'Delivered',
          description: 'Doorstep contactless delivery',
          time: 'Upcoming',
          isCompleted: false,
          isCurrent: false,
        },
      ],
      deliveryPartner: {
        id: 'dp-ramesh',
        name: 'Ramesh Kumar',
        phone: '+91 94481 23456',
        rating: 4.9,
        totalDeliveries: 1420,
        vehicleType: 'Hero Electric Optima',
        vehicleNumber: 'KA-09-EM-4821',
        photoUrl: '/src/assets/images/store_local_kirana_1792249945848.jpg',
        currentLat: 12.338,
        currentLng: 76.595,
      },
      deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      estimatedDeliveryTime: `${fulfillingStore.minDeliveryMins || 25} mins`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingOrderId(newOrderId);
    handleClearCart();
    setCurrentPage('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation router handler
  const handleNavigate = (page: AppPage) => {
    if (page === 'about') {
      setIsAboutModalOpen(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'offers') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById('offers');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Products filtering logic for the Homepage featured section
  const displayedHomeProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.isFeatured).slice(0, 6);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <span id="top" />

      {/* 1. Main Header */}
      <Header
        cartCount={cartBadgeCount}
        onOpenCart={() => handleNavigate('cart')}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => {
          if (searchQuery.trim()) {
            if (currentPage === 'home') setCurrentPage('categories');
          }
        }}
      />

      {/* 2. Secondary Navigation Bar */}
      <SecondaryNavigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        activeOrderCount={activeOrderCount}
      />

      {/* Page Body */}
      <main className="flex-1">
        {currentPage === 'tracking' ? (
          /* PHASE 6: Screen 1 — Order Tracking & Remote Delivery Maps */
          <OrderTrackingPage
            order={currentTrackedOrder}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateOrders={() => handleNavigate('orders')}
            onUpdateOrderStatus={(orderId, newStatus) => {
              setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
              );
            }}
            onUpdateOrderLocation={(orderId, newLoc) => {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === orderId ? { ...o, deliveryAddress: newLoc } : o
                )
              );
            }}
          />
        ) : currentPage === 'orders' ? (
          /* PHASE 6: Screen 2 — My Orders & Reorders */
          <MyOrdersPage
            orders={orders}
            onTrackOrder={(id) => {
              setActiveTrackingOrderId(id);
              setCurrentPage('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => handleNavigate('home')}
            onReorder={(orderToReorder) => {
              orderToReorder.items.forEach((item) => {
                handleAddToCart(item.product);
              });
            }}
            onNavigateCart={() => handleNavigate('cart')}
          />
        ) : currentPage === 'checkout' ? (
          /* PHASE 5: Screen 1 — Checkout (Delivery Address & Delivery Options) */
          <CheckoutPage
            cartItems={cartItems}
            store={fulfillingStore}
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={(id) => {
              setSelectedAddressId(id);
              const found = addresses.find((a) => a.id === id);
              if (found) {
                setSelectedLocation(`${found.streetAddress}, Mysuru - ${found.pincode}`);
              }
            }}
            onAddNewAddress={handleAddNewAddress}
            onEditAddress={handleEditAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
            deliveryInstructions={deliveryInstructions}
            onChangeDeliveryInstructions={setDeliveryInstructions}
            deliveryTimeOption={deliveryTimeOption}
            onSelectDeliveryTimeOption={setDeliveryTimeOption}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateCart={() => handleNavigate('cart')}
            onContinueToPayment={() => handleNavigate('payment')}
            onSelectStore={handleSelectStore}
            stores={STORES}
          />
        ) : currentPage === 'payment' ? (
          /* PHASE 5: Screen 2 — Payment (Payment Method Selection & UPI) */
          <PaymentPage
            cartItems={cartItems}
            store={fulfillingStore}
            selectedAddress={selectedAddress}
            paymentMethod={paymentMethod}
            onSelectPaymentMethod={setPaymentMethod}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateCheckout={() => handleNavigate('checkout')}
            onNavigateCart={() => handleNavigate('cart')}
            onNavigateTracking={() => handleNavigate('tracking')}
            onCompleteOrder={handleCompleteOrder}
          />
        ) : currentPage === 'cart' ? (
          /* PHASE 4: Shopping Cart and Order Summary Page */
          <CartPage
            cartItems={cartItems}
            store={fulfillingStore}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onAddToCart={handleAddToCart}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateStores={() => handleNavigate('stores')}
            onNavigateCategories={() => handleNavigate('categories')}
            onViewStore={(storeId) => {
              handleSelectStore(storeId);
              handleNavigate('stores');
            }}
            onSelectStore={handleSelectStore}
            availableStores={STORES}
            selectedLocation={selectedLocation}
            onUpdateLocation={(newLoc) => setSelectedLocation(newLoc)}
            onRestoreSampleCart={handleRestoreSampleCart}
            onNavigateCheckout={() => handleNavigate('checkout')}
          />
        ) : currentPage === 'stores' ? (
          /* PHASE 3: Store Details & Product Browsing Page */
          <StoreDetailsPage
            currentStoreId={selectedStoreId}
            onSelectStore={(storeId) => {
              handleSelectStore(storeId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onNavigateHome={() => handleNavigate('home')}
            selectedLocation={selectedLocation}
          />
        ) : currentPage === 'categories' ? (
          /* PHASE 2: Categories and Product Listing Page */
          <CategoryPage
            initialCategoryName={activeCategorySlug}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            selectedLocation={selectedLocation}
            onNavigateHome={() => handleNavigate('home')}
            searchQuery={searchQuery}
          />
        ) : (
          /* PHASE 1: Homepage (Preserved & Reusable) */
          <>
            {/* Hero Banner */}
            <HeroBanner
              selectedLocation={selectedLocation}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearchSubmit={() => {
                if (searchQuery.trim()) {
                  setCurrentPage('categories');
                }
              }}
            />

            {/* Shop by Category */}
            <CategorySection
              selectedCategory={null}
              onSelectCategory={(categoryName) => {
                setActiveCategorySlug(categoryName);
                setCurrentPage('categories');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onResetCategory={() => {}}
            />

            {/* Nearby Stores */}
            <NearbyStores
              onStoreSelected={(store: Store) => {
                handleSelectStore(store.id);
                setCurrentPage('stores');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Three Promotional Banners */}
            <PromotionBanners
              onShopCategory={(categoryName) => {
                setActiveCategorySlug(categoryName);
                setCurrentPage('categories');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Products */}
            <FeaturedProducts
              products={displayedHomeProducts}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              activeCategoryFilter={null}
              onResetCategory={() => {}}
              searchQuery=""
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        selectedLocation={selectedLocation}
      />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        query={searchQuery}
        setQuery={setSearchQuery}
        products={PRODUCTS}
        stores={STORES}
        categories={CATEGORIES}
        onSelectCategory={(name) => {
          setActiveCategorySlug(name);
          setCurrentPage('categories');
          setIsSearchOpen(false);
        }}
        onSelectStore={(storeId) => {
          setSelectedStoreId(storeId);
          setCurrentPage('stores');
          setIsSearchOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
      />

      {/* About GroceryGo Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">About GroceryGo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>GroceryGo – Smart Local Grocery Delivery</strong> is a hyperlocal e-commerce engineering prototype built for <strong>Mysuru, Karnataka</strong>.
              </p>
              <p>
                It bridges neighborhood kirana stores (like <em>Shree Lakshmi Kirana</em> in Hootagalli) and supermarkets with local residents, enabling 15–25 minute doorstep grocery dispatch.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1">
                <span className="font-bold block">Engineering Architecture:</span>
                <p className="text-[11px]">
                  • Frontend: React.js with TypeScript and Tailwind CSS<br />
                  • Backend: Java Spring Boot (planned integration)<br />
                  • Database: PostgreSQL (planned integration)<br />
                  • Hyperlocal Maps: Mysuru neighborhood route mapping
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAboutModalOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {/* Floating Store Notification Toast */}
      {storeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-200 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{storeToast}</span>
        </div>
      )}
    </div>
  );
}
