import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  IndianRupee,
  Package,
  Star,
  Bell,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Store,
  Layers,
  BarChart3,
  DollarSign,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  RefreshCw,
  Download,
  Share2,
  Menu,
  Phone,
  Eye,
  Sliders,
  CheckCircle2,
  FileText,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { STORES } from '../data/stores';
import { PRODUCTS } from '../data/products';
import { Product, Store as StoreType } from '../types';

export type DashboardTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'categories'
  | 'store-profile'
  | 'earnings'
  | 'reviews'
  | 'analytics'
  | 'settings';

interface StoreOwnerDashboardProps {
  onNavigateCustomerHome?: () => void;
  onNavigateCustomerStores?: () => void;
  onNavigateCustomerOrders?: () => void;
}

// Initial Incoming Orders for demonstration (matching Section 8 specification)
export interface IncomingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  locality: string;
  itemCount: number;
  itemSummary: string;
  timeAgo: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'Online';
  status: 'new' | 'accepted' | 'rejected' | 'preparing' | 'ready';
  image: string;
  items: {
    name: string;
    quantity: string;
    unitPrice: number;
    count: number;
  }[];
}

const INITIAL_INCOMING_ORDERS: IncomingOrder[] = [
  {
    id: 'ord-gg12345',
    orderNumber: '#GG12345',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98451 22345',
    locality: 'Hootagalli, Mysuru',
    itemCount: 4,
    itemSummary: 'Aashirvaad Atta (5kg), Tomato (1kg), Onion (1kg), Maggi (280g)',
    timeAgo: '12 mins ago',
    totalAmount: 402,
    paymentMethod: 'COD',
    status: 'new',
    image: '/src/assets/images/prod_atta_bag_1792249996274.jpg',
    items: [
      { name: 'Aashirvaad Superior MP Atta', quantity: '5 kg', unitPrice: 240, count: 1 },
      { name: 'Farm Fresh Tomatoes', quantity: '1 kg', unitPrice: 30, count: 2 },
      { name: 'Local Red Onions', quantity: '1 kg', unitPrice: 32, count: 1 },
      { name: 'Maggi 2-Minute Masala Noodles', quantity: '280 g', unitPrice: 60, count: 1 },
    ],
  },
  {
    id: 'ord-gg12344',
    orderNumber: '#GG12344',
    customerName: 'Rahul Kumar',
    customerPhone: '+91 97412 88765',
    locality: 'Vijayanagar, Mysuru',
    itemCount: 6,
    itemSummary: 'Nandini Milk (2L), Bread, Eggs, Curd, Apples, Biscuits',
    timeAgo: '18 mins ago',
    totalAmount: 685,
    paymentMethod: 'Online',
    status: 'new',
    image: '/src/assets/images/prod_milk_pouch_1792249995129.jpg',
    items: [
      { name: 'Nandini Toned Fresh Milk', quantity: '1 L pouch', unitPrice: 44, count: 2 },
      { name: 'Whole Wheat Brown Bread', quantity: '400 g', unitPrice: 45, count: 1 },
      { name: 'Farm Fresh White Eggs (Pack of 6)', quantity: '6 pcs', unitPrice: 55, count: 1 },
      { name: 'Nandini Thick Curd', quantity: '500 g', unitPrice: 30, count: 2 },
      { name: 'Fresh Shimla Apples', quantity: '1 kg', unitPrice: 180, count: 1 },
      { name: 'Parle-G Gold Biscuits', quantity: '250 g', unitPrice: 30, count: 1 },
    ],
  },
  {
    id: 'ord-gg12343',
    orderNumber: '#GG12343',
    customerName: 'Sneha Patil',
    customerPhone: '+91 94480 65432',
    locality: 'Kuvempu Nagar, Mysuru',
    itemCount: 3,
    itemSummary: 'Spinach (250g), Capsicum (500g), Fresh Carrots (500g)',
    timeAgo: '25 mins ago',
    totalAmount: 310,
    paymentMethod: 'Online',
    status: 'new',
    image: '/src/assets/images/prod_spinach_palak_1792252990004.jpg',
    items: [
      { name: 'Fresh Green Palak / Spinach', quantity: '250 g', unitPrice: 35, count: 2 },
      { name: 'Green Bell Pepper / Capsicum', quantity: '500 g', unitPrice: 45, count: 1 },
      { name: 'Crisp Ooty Carrots', quantity: '500 g', unitPrice: 40, count: 1 },
    ],
  },
  {
    id: 'ord-gg12342',
    orderNumber: '#GG12342',
    customerName: 'Anand Murthy',
    customerPhone: '+91 99800 11223',
    locality: 'Jayalakshmipuram, Mysuru',
    itemCount: 5,
    itemSummary: 'Fortune Sunflower Oil (1L), Tur Dal (1kg), Sugar (1kg)',
    timeAgo: '42 mins ago',
    totalAmount: 520,
    paymentMethod: 'Online',
    status: 'new',
    image: '/src/assets/images/prod_fortune_oil_pack_1792254220066.jpg',
    items: [
      { name: 'Fortune Sunlite Refined Oil', quantity: '1 L', unitPrice: 135, count: 1 },
      { name: 'Tata Sampann Unpolished Tur Dal', quantity: '1 kg', unitPrice: 165, count: 1 },
      { name: 'Madhur Pure Sugar', quantity: '1 kg', unitPrice: 55, count: 2 },
    ],
  },
  {
    id: 'ord-gg12341',
    orderNumber: '#GG12341',
    customerName: 'Kavitha Gowda',
    customerPhone: '+91 98860 33445',
    locality: 'Gokulam 3rd Stage, Mysuru',
    itemCount: 2,
    itemSummary: 'Robusta Bananas (1kg), Fresh Cauliflower (1pc)',
    timeAgo: '55 mins ago',
    totalAmount: 180,
    paymentMethod: 'COD',
    status: 'new',
    image: '/src/assets/images/prod_ripe_bananas_1792249993435.jpg',
    items: [
      { name: 'Robusta Golden Bananas', quantity: '1 kg', unitPrice: 40, count: 2 },
      { name: 'Fresh White Cauliflower', quantity: '1 pc', unitPrice: 45, count: 1 },
    ],
  },
];

// Initial low inventory alerts
interface InventoryAlertItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  image: string;
}

const INITIAL_INVENTORY_ALERTS: InventoryAlertItem[] = [
  {
    id: 'slk-atta',
    name: 'Aashirvaad Superior MP Atta',
    category: 'Atta & Flours',
    currentStock: 3,
    minThreshold: 10,
    unit: '5 kg bags',
    image: '/src/assets/images/prod_atta_bag_1792249996274.jpg',
  },
  {
    id: 'slk-maggi',
    name: 'Maggi 2-Minute Masala Noodles',
    category: 'Instant Food',
    currentStock: 5,
    minThreshold: 15,
    unit: 'packs (280g)',
    image: '/src/assets/images/prod_maggi_noodles_1792254220398.jpg',
  },
  {
    id: 'slk-fortune',
    name: 'Fortune Sunlite Sunflower Oil',
    category: 'Edible Oils',
    currentStock: 2,
    minThreshold: 8,
    unit: 'pouches (1L)',
    image: '/src/assets/images/prod_fortune_oil_pack_1792254220066.jpg',
  },
  {
    id: 'slk-potatoes',
    name: 'Local Fresh Potatoes',
    category: 'Vegetables',
    currentStock: 4,
    minThreshold: 20,
    unit: 'kg',
    image: '/src/assets/images/prod_fresh_potatoes_1792249994939.jpg',
  },
];

export const StoreOwnerDashboard: React.FC<StoreOwnerDashboardProps> = ({
  onNavigateCustomerHome,
  onNavigateCustomerStores,
  onNavigateCustomerOrders,
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Store selection state
  const [currentStore, setCurrentStore] = useState<StoreType>(() => {
    return STORES.find((s) => s.id === 'shree-lakshmi-kirana') || STORES[0];
  });
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);

  // Notifications state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Order Received',
      desc: 'Order #GG12345 from Priya Sharma (₹402, COD)',
      time: '12m ago',
      unread: true,
      type: 'order',
    },
    {
      id: 'notif-2',
      title: 'Low Stock Warning',
      desc: 'Aashirvaad Atta 5kg has only 3 bags remaining',
      time: '24m ago',
      unread: true,
      type: 'inventory',
    },
    {
      id: 'notif-3',
      title: 'New 5-Star Customer Review',
      desc: '"Super fast delivery and fresh vegetables!" - Divya K.',
      time: '1h ago',
      unread: true,
      type: 'review',
    },
  ]);

  // User Profile dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Date selection state
  const [selectedDateFilter, setSelectedDateFilter] = useState('Today, 16 Oct 2026');
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);

  // Incoming Orders state
  const [ordersList, setOrdersList] = useState<IncomingOrder[]>(INITIAL_INCOMING_ORDERS);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<IncomingOrder | null>(null);

  // Reject order modal state
  const [orderToReject, setOrderToReject] = useState<IncomingOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('Item currently out of stock');

  // Products and Inventory state
  const [productsCatalog, setProductsCatalog] = useState<Product[]>(() => {
    return PRODUCTS.filter((p) => p.storeId === 'shree-lakshmi-kirana' || !p.storeId).slice(0, 16);
  });
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlertItem[]>(INITIAL_INVENTORY_ALERTS);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Modals for actions
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isStoreHoursModalOpen, setIsStoreHoursModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isHelpSupportModalOpen, setIsHelpSupportModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Sound toggle state
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);

  // Dynamic counts
  const pendingOrders = useMemo(() => {
    return ordersList.filter((o) => o.status === 'new');
  }, [ordersList]);

  const acceptedOrders = useMemo(() => {
    return ordersList.filter((o) => o.status === 'accepted' || o.status === 'preparing');
  }, [ordersList]);

  // Handle Accept Order
  const handleAcceptOrder = (order: IncomingOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOrdersList((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'accepted' } : o))
    );
    showToast(`Order ${order.orderNumber} accepted! Moved to preparation queue.`);
    if (selectedOrderForModal?.id === order.id) {
      setSelectedOrderForModal({ ...order, status: 'accepted' });
    }
  };

  // Handle Confirm Reject Order
  const handleConfirmReject = () => {
    if (!orderToReject) return;
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderToReject.id ? { ...o, status: 'rejected' } : o))
    );
    showToast(`Order ${orderToReject.orderNumber} rejected: ${rejectReason}`);
    setOrderToReject(null);
    if (selectedOrderForModal?.id === orderToReject.id) {
      setSelectedOrderForModal(null);
    }
  };

  // Handle Quick Restock
  const handleRestock = (item: InventoryAlertItem) => {
    setInventoryAlerts((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, currentStock: a.currentStock + 10 } : a))
    );
    showToast(`Restocked +10 units of ${item.name}! Inventory level updated.`);
  };

  // Handle Product stock toggle
  const handleToggleProductStock = (productId: string) => {
    setProductsCatalog((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
    const prod = productsCatalog.find((p) => p.id === productId);
    if (prod) {
      showToast(`${prod.name} marked as ${!prod.inStock ? 'In Stock' : 'Out of Stock'}`);
    }
  };

  // Filtered Products for Manage Products card
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm.trim()) return productsCatalog.slice(0, 5);
    return productsCatalog.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [productsCatalog, productSearchTerm]);

  // Hourly Sales Data for the area chart
  const HOURLY_SALES = [
    { hour: '8 AM', sales: 240, orders: 1 },
    { hour: '10 AM', sales: 520, orders: 3 },
    { hour: '12 PM', sales: 740, orders: 4 },
    { hour: '2 PM', sales: 380, orders: 2 },
    { hour: '4 PM', sales: 610, orders: 3 },
    { hour: '6 PM', sales: 980, orders: 4 }, // Peak hour
    { hour: '8 PM', sales: 760, orders: 3 },
    { hour: '10 PM', sales: 0, orders: 0 },
  ];

  const maxSales = Math.max(...HOURLY_SALES.map((d) => d.sales));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          3. TOP HEADER (Fixed-height, white, full width)
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 sm:h-[68px] px-3 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        
        {/* Left: GroceryGo branding + Mobile Menu toggle */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* GroceryGo Logo & Tagline */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-lime-400 rounded-full flex items-center justify-center shadow">
                <span className="text-[10px] font-bold text-emerald-950">✓</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold text-emerald-950 tracking-tight leading-none">
                GroceryGo
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 tracking-tight mt-0.5">
                Smart Local Delivery
              </span>
            </div>
          </div>

          <div className="hidden lg:block h-7 w-px bg-slate-200 mx-1" />

          {/* Store Identity Section */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 text-left cursor-pointer group"
            >
              {/* Pale-green badge: Store Owner */}
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Store Owner
              </span>

              {/* Small store photo */}
              <img
                src={currentStore.image || '/src/assets/images/store_local_kirana_1792249945848.jpg'}
                alt={currentStore.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
              />

              {/* Store details */}
              <div className="hidden sm:flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                    {currentStore.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {isStoreOpen ? 'Open' : 'Closed'}
                  </span>
                  <span>•</span>
                  <span>{currentStore.closingTime || 'Closes at 10:00 PM'}</span>
                </div>
              </div>
            </button>

            {/* Store Switcher Dropdown */}
            {isStoreDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-left animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Authorized Stores</p>
                    <p className="text-[10px] text-slate-500">Select store to manage</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStoreOpen(!isStoreOpen);
                      showToast(`Store status set to ${!isStoreOpen ? 'Open' : 'Temporarily Closed'}`);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold cursor-pointer border ${
                      isStoreOpen
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    Toggle {isStoreOpen ? 'Close' : 'Open'}
                  </button>
                </div>

                <div className="mt-1 space-y-1">
                  {STORES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setCurrentStore(s);
                        setIsStoreDropdownOpen(false);
                        showToast(`Switched active store view to ${s.name}`);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        currentStore.id === s.id
                          ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.type} • {s.address}</p>
                      </div>
                      {currentStore.id === s.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right-Side Controls: Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundAlertsEnabled(!soundAlertsEnabled);
              showToast(`Order sound chime ${!soundAlertsEnabled ? 'enabled' : 'muted'}`);
            }}
            title={soundAlertsEnabled ? 'Mute Order Chimes' : 'Enable Order Chimes'}
            className="p-2 rounded-full text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {soundAlertsEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Notification Bell with red badge showing 3 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileDropdownOpen(false);
              }}
              className="relative p-2 rounded-full text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Store Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white tabular-nums">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Store Notifications</span>
                    <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      {unreadNotifications} new
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUnreadNotifications(0);
                      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                    }}
                    className="text-[11px] text-emerald-700 hover:underline font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-1 flex items-start gap-3 transition-colors ${
                        n.unread ? 'bg-emerald-50/40 rounded-lg' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                        {n.type === 'order' ? (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        ) : n.type === 'inventory' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        ) : (
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('orders');
                      setIsNotificationsOpen(false);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    View All Activity Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile section: Circular avatar, Ramesh Kumar, Store Owner */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-200 shrink-0">
                RK
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  Ramesh Kumar
                </span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                  Store Owner
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {/* Profile Menu Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 text-left">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">Ramesh Kumar</p>
                  <p className="text-[11px] text-slate-500">ramesh.kirana@grocerygo.in</p>
                  <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    Verified Store Partner
                  </span>
                </div>

                <div className="space-y-0.5 text-xs text-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('store-profile');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-medium"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Store Profile & Timings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('settings');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dashboard Settings</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  {/* Switch to customer app */}
                  {onNavigateCustomerHome && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onNavigateCustomerHome();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-800 font-semibold text-left"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Switch to Customer App</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      showToast('Demo store owner session active.');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-500 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Lock Dashboard (Demo)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================
          BODY CONTAINER: Left Sidebar + Main Content Area
          ======================================================== */}
      <div className="flex-1 flex w-full max-w-[1536px] mx-auto">
        
        {/* ========================================================
            4. LEFT SIDEBAR NAVIGATION (~225px wide, ordered list)
            ======================================================== */}
        <aside
          className={`
            fixed md:sticky top-16 sm:top-[68px] z-30
            w-60 md:w-[230px] shrink-0 h-[calc(100vh-64px)] sm:h-[calc(100vh-68px)]
            bg-white border-r border-slate-200 flex flex-col justify-between
            transition-transform duration-200 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Top navigation items */}
          <div className="py-4 px-3 space-y-1 overflow-y-auto">
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Dashboard</span>
            </button>

            {/* 2. Orders (with red notification badge showing 5) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('orders');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>Orders</span>
              </div>
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none tabular-nums">
                {pendingOrders.length}
              </span>
            </button>

            {/* 3. Products */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${activeTab === 'products' ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>Products</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">48</span>
            </button>

            {/* 4. Inventory */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('inventory');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-4 h-4 ${activeTab === 'inventory' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Inventory</span>
              </div>
              {inventoryAlerts.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                  {inventoryAlerts.length}
                </span>
              )}
            </button>

            {/* 5. Categories */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('categories');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'categories' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Categories</span>
            </button>

            {/* 6. Store Profile */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('store-profile');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'store-profile'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Store className={`w-4 h-4 ${activeTab === 'store-profile' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Store Profile</span>
            </button>

            {/* 7. Earnings */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('earnings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'earnings'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <IndianRupee className={`w-4 h-4 ${activeTab === 'earnings' ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>Earnings</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">₹4,230</span>
            </button>

            {/* 8. Reviews */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('reviews');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Reviews</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">4.6 ★</span>
            </button>

            {/* 9. Analytics */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('analytics');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Analytics</span>
            </button>

            {/* 10. Settings */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Settings</span>
            </button>
          </div>

          {/* Bottom Sidebar actions: Help & Support, Switch to Customer App */}
          <div className="p-3 border-t border-slate-100 space-y-1.5">
            <button
              type="button"
              onClick={() => setIsHelpSupportModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Support</span>
            </button>

            {onNavigateCustomerHome && (
              <button
                type="button"
                onClick={onNavigateCustomerHome}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200/70 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Customer App</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            )}

            <div className="px-3 pt-1 text-[10px] text-slate-400 text-center">
              GroceryGo Partner v2.4
            </div>
          </div>
        </aside>

        {/* Mobile backdrop for sidebar */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-20 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ========================================================
            MAIN DASHBOARD CONTENT AREA
            ======================================================== */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 space-y-6">

          {/* Only render dashboard hero view if activeTab === 'dashboard' */}
          {activeTab === 'dashboard' ? (
            <>
              {/* ========================================================
                  5. DASHBOARD HEADING AND DATE SELECTOR
                  ======================================================== */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Store Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Manage your store, orders and products
                  </p>
                </div>

                {/* Date Selector with Calendar Icon */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDateSelectorOpen(!isDateSelectorOpen)}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>{selectedDateFilter}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isDateSelectorOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-20 animate-in fade-in">
                      {['Today, 16 Oct 2026', 'Yesterday, 15 Oct 2026', 'Last 7 Days', 'This Month (Oct 2026)'].map(
                        (period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => {
                              setSelectedDateFilter(period);
                              setIsDateSelectorOpen(false);
                              showToast(`Filtered dashboard view to: ${period}`);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg cursor-pointer ${
                              selectedDateFilter === period
                                ? 'bg-emerald-50 text-emerald-800 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {period}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================
                  6. FOUR KPI CARDS (Horizontal row, uniform height & styling)
                  ======================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Orders */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Orders</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">18</span>
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +28%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">vs. yesterday</p>
                </div>

                {/* Card 2: Total Sales */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Sales</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                      <IndianRupee className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹4,230</span>
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +22%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">vs. yesterday</p>
                </div>

                {/* Card 3: Items Sold */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Items Sold</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                      <Package className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">56</span>
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +18%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">vs. yesterday</p>
                </div>

                {/* Card 4: Store Rating */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Store Rating</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                      <Star className="w-4.5 h-4.5 fill-amber-400" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">4.6</span>
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ↑ +0.2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">(120 reviews)</p>
                </div>

              </div>

              {/* ========================================================
                  7. MAIN DASHBOARD GRID (Two-column layout)
                  LEFT: Incoming Orders panel (wider)
                  RIGHT: Today's Sales chart & Order Status chart
                  ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ----------------------------------------------------
                    LEFT COLUMN: Incoming Orders Panel (7 cols / wider)
                    ---------------------------------------------------- */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    {/* Header: Title and "View All Orders →" link */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                          Incoming Orders ({pendingOrders.length})
                        </h2>
                        {pendingOrders.length > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                            Live Feed
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Orders</span>
                        <span>→</span>
                      </button>
                    </div>

                    {/* Orders List: Exact 3 specified demo orders */}
                    <div className="divide-y divide-slate-100 mt-1">
                      {pendingOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrderForModal(order)}
                          className="py-3.5 hover:bg-slate-50/70 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            {/* Product thumbnail */}
                            <img
                              src={order.image}
                              alt={order.orderNumber}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs group-hover:scale-102 transition-transform"
                            />

                            {/* Middle details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900">
                                  {order.orderNumber}
                                </span>
                                <span className="text-xs font-semibold text-slate-700">
                                  {order.customerName}
                                </span>
                                {/* Pale-orange 'New' badge */}
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                                  New
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span className="truncate">{order.locality}</span>
                                </span>
                                <span>•</span>
                                <span>{order.itemCount} items</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{order.timeAgo}</span>
                                </span>
                              </div>
                            </div>

                            {/* Right side: Amount, Payment Badge, Action Buttons */}
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-extrabold text-slate-900">
                                  ₹{order.totalAmount}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    order.paymentMethod === 'COD'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {order.paymentMethod}
                                </span>
                              </div>

                              {/* Accept / Reject Buttons */}
                              <div className="flex items-center gap-1.5 mt-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleAcceptOrder(order, e)}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrderToReject(order);
                                  }}
                                  className="border border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}

                      {pendingOrders.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2 opacity-80" />
                          <p className="text-sm font-semibold text-slate-700">All incoming orders handled!</p>
                          <p className="text-xs text-slate-400 mt-0.5">New orders will chime and appear here automatically.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary bar at the bottom */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Active Preparation Queue: {acceptedOrders.length} orders</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      Open Full Order Manager →
                    </button>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    RIGHT COLUMN: Today's Sales chart & Order Status chart (5 cols)
                    ---------------------------------------------------- */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Chart 1: Today's Sales (Hourly Trend Area Chart) */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900">Today's Sales</h2>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-lg font-extrabold text-slate-900">₹4,230</span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                            Peak: 5 PM - 8 PM
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Hourly breakdown</span>
                    </div>

                    {/* SVG Curve & Area chart */}
                    <div className="w-full h-36 relative mt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                        <line x1="0" y1="65" x2="400" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />

                        {/* Area Polygon */}
                        <polygon
                          points={`
                            0,110 
                            0,90 
                            57,65 
                            114,45 
                            171,78 
                            228,55 
                            285,18 
                            342,40 
                            400,110
                          `}
                          fill="url(#salesGrad)"
                        />

                        {/* Trend Line */}
                        <polyline
                          points={`
                            0,90 
                            57,65 
                            114,45 
                            171,78 
                            228,55 
                            285,18 
                            342,40 
                            400,110
                          `}
                          fill="none"
                          stroke="#047857"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Peak Point highlight */}
                        <circle cx="285" cy="18" r="4.5" fill="#047857" stroke="#ffffff" strokeWidth="2" />
                      </svg>

                      {/* X-Axis labels */}
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>8 AM</span>
                        <span>12 PM</span>
                        <span>4 PM</span>
                        <span className="font-bold text-emerald-800">6 PM (Peak)</span>
                        <span>10 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Order Status (Breakdown Donut / Status Bars) */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900">Order Status</h2>
                        <p className="text-[11px] text-slate-500">18 total store orders today</p>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        67% Completed
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden gap-0.5 p-0.5">
                      <div className="bg-emerald-600 rounded-l-full" style={{ width: '67%' }} title="Delivered: 12" />
                      <div className="bg-blue-600" style={{ width: '11%' }} title="Preparing: 2" />
                      <div className="bg-amber-500" style={{ width: '6%' }} title="Out for Delivery: 1" />
                      <div className="bg-orange-500 rounded-r-full" style={{ width: '16%' }} title="Pending New: 3" />
                    </div>

                    {/* Status grid */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span className="text-slate-600">Delivered</span>
                        </div>
                        <span className="font-bold text-slate-900">12 (67%)</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span className="text-slate-600">Preparing</span>
                        </div>
                        <span className="font-bold text-slate-900">2 (11%)</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-slate-600">On the Way</span>
                        </div>
                        <span className="font-bold text-slate-900">1 (6%)</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-slate-600">New / Pending</span>
                        </div>
                        <span className="font-bold text-slate-900">3 (16%)</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* ========================================================
                  7. BOTTOM ROW: THREE CARDS
                  1. Manage Products
                  2. Inventory Alert
                  3. Quick Actions
                  ======================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Manage Products Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Manage Products</h3>
                        <p className="text-[11px] text-slate-500">Quick stock and price toggles</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="Add Product"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Search inside card */}
                    <div className="relative mb-3">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    {/* Product items list */}
                    <div className="space-y-2">
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-500">₹{p.price} • {p.quantity}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleProductStock(p.id)}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              p.inStock !== false
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {p.inStock !== false ? 'In Stock' : 'Out'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="mt-3 text-xs text-center font-semibold text-emerald-700 hover:underline pt-2 border-t border-slate-100 block cursor-pointer"
                  >
                    View All 48 Products →
                  </button>
                </div>

                {/* 2. Inventory Alert Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Inventory Alert</h3>
                        <p className="text-[11px] text-slate-500">Items running low on store shelf</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    </div>

                    <div className="space-y-2.5">
                      {inventoryAlerts.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-md object-cover border border-amber-200 shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                              <p className="text-[10px] text-amber-800 font-semibold">
                                Only {item.currentStock} {item.unit} left
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRestock(item)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 shadow-2xs"
                          >
                            + Restock
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="mt-3 text-xs text-center font-semibold text-emerald-700 hover:underline pt-2 border-t border-slate-100 block cursor-pointer"
                  >
                    Manage Reorder Levels →
                  </button>
                </div>

                {/* 3. Quick Actions Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="mb-3">
                      <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                      <p className="text-[11px] text-slate-500">Store operations & updates</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-700" />
                          <span>Add New Product</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">Open →</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsStoreHoursModalOpen(true)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-700" />
                          <span>Update Store Timings</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">Edit →</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const csvContent =
                            'data:text/csv;charset=utf-8,Order ID,Customer,Amount,Status,Time\n#GG12345,Priya Sharma,402,New,12m ago\n#GG12344,Rahul Kumar,685,New,18m ago\n#GG12343,Sneha Patil,310,New,25m ago';
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement('a');
                          link.setAttribute('href', encodedUri);
                          link.setAttribute('download', `GroceryGo_Sales_16Oct2026.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          showToast('Daily sales report downloaded as CSV.');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-emerald-700" />
                          <span>Download Daily Report</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">CSV →</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAnnouncementModalOpen(true)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-700" />
                          <span>Store Announcement</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">Post →</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>GSTIN: 29AABCS1429B1Z2</span>
                    <span className="text-emerald-700 font-semibold">Active Tier 1</span>
                  </div>
                </div>

              </div>
            </>
          ) : activeTab === 'orders' ? (
            /* ========================================================
               TAB: ORDERS MANAGEMENT
               ======================================================== */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Store Order Management</h2>
                  <p className="text-xs text-slate-500">Track and dispatch incoming customer orders in Mysuru</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {ordersList.length} Total Orders
                  </span>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Locality</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersList.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{ord.orderNumber}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{ord.customerName}</p>
                          <p className="text-[10px] text-slate-400">{ord.customerPhone}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{ord.locality}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-700">{ord.itemCount} items</span>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{ord.itemSummary}</p>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">₹{ord.totalAmount}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              ord.paymentMethod === 'COD'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              ord.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'accepted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForModal(ord)}
                              className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                            >
                              Details
                            </button>
                            {ord.status === 'new' && (
                              <button
                                type="button"
                                onClick={() => handleAcceptOrder(ord)}
                                className="text-xs px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                              >
                                Accept
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'products' ? (
            /* ========================================================
               TAB: PRODUCTS
               ======================================================== */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Store Product Catalog</h2>
                  <p className="text-xs text-slate-500">48 total products listed in Shree Lakshmi Kirana</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsCatalog.map((prod) => (
                  <div
                    key={prod.id}
                    className="border border-slate-200 rounded-xl p-3 bg-white hover:border-emerald-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-32 object-cover rounded-lg border border-slate-100 mb-2"
                      />
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{prod.name}</h4>
                      <p className="text-[11px] text-slate-500">{prod.quantity}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">₹{prod.price}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleProductStock(prod.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${
                          prod.inStock !== false
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {prod.inStock !== false ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'inventory' ? (
            /* ========================================================
               TAB: INVENTORY
               ======================================================== */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Inventory & Stock Alerts</h2>
                <p className="text-xs text-slate-500">Monitor minimum stock thresholds and supplier reorders</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventoryAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-amber-200 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase">
                          Low Stock Alert
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Current: <strong className="text-red-700">{item.currentStock} {item.unit}</strong> (Min: {item.minThreshold})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestock(item)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer shrink-0 shadow-xs"
                    >
                      + 10 Units
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'store-profile' ? (
            /* ========================================================
               TAB: STORE PROFILE
               ======================================================== */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Store Profile & Information</h2>
                  <p className="text-xs text-slate-500">Public listing visible to Mysuru customers</p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-lg font-bold">
                  Verified Local Merchant
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Store Name</label>
                    <input
                      type="text"
                      defaultValue={currentStore.name}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Store Owner Name</label>
                    <input
                      type="text"
                      defaultValue="Ramesh Kumar"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      defaultValue="+91 94481 23456"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Physical Address</label>
                    <textarea
                      rows={2}
                      defaultValue="#123, 5th Cross, Near Primary Health Center, Hootagalli, Mysuru - 570018"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Operating Hours</label>
                    <input
                      type="text"
                      defaultValue="8:00 AM - 10:00 PM (Mon - Sun)"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Service Radius</label>
                    <input
                      type="text"
                      defaultValue="30 km (Hyperlocal + Remote Mysuru Villages)"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Store Photographs</label>
                    <div className="flex gap-2">
                      <img
                        src="/src/assets/images/store_local_kirana_1792249945848.jpg"
                        alt="Store"
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                      />
                      <img
                        src="/src/assets/images/store_kirana_cover_1792254220389.jpg"
                        alt="Store Cover"
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Store profile details updated successfully!')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Save Store Profile
                </button>
              </div>
            </div>
          ) : (
            /* Generic placeholder for remaining tabs (Earnings, Reviews, Analytics, Settings, Categories) */
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  {activeTab.replace('-', ' ')}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Demonstration metrics and data for {currentStore.name}. Use the top tabs or actions to test features.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Back to Store Dashboard</span>
                <span>→</span>
              </button>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================
          MODAL 1: ORDER DETAILS MODAL
          ======================================================== */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Order {selectedOrderForModal.orderNumber}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedOrderForModal.status === 'new'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedOrderForModal.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedOrderForModal.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed {selectedOrderForModal.timeAgo} by {selectedOrderForModal.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Customer Phone:</span>
                <span className="font-mono text-slate-900 font-bold">{selectedOrderForModal.customerPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Delivery Address:</span>
                <span className="text-slate-900 font-medium">{selectedOrderForModal.locality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Payment Mode:</span>
                <span className="font-bold text-emerald-800">{selectedOrderForModal.paymentMethod}</span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Itemized Order Checklist:</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {selectedOrderForModal.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.quantity} × {item.count}</p>
                    </div>
                    <span className="font-bold text-slate-900">₹{item.unitPrice * item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span>₹{selectedOrderForModal.totalAmount}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedOrderForModal.status === 'new' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderToReject(selectedOrderForModal);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptOrder(selectedOrderForModal)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Accept Order & Prepare
                  </button>
                </>
              )}
              {selectedOrderForModal.status === 'accepted' && (
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Dispatched order ${selectedOrderForModal.orderNumber} to delivery partner!`);
                    setSelectedOrderForModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Mark Handed to Driver
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: REJECT ORDER CONFIRMATION
          ======================================================== */}
      {orderToReject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Reject Order {orderToReject.orderNumber}?
                </h3>
                <p className="text-[11px] text-slate-500">
                  Customer {orderToReject.customerName} will be notified immediately.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Select Reason for Rejection:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-red-500"
              >
                <option value="Item currently out of stock">Item currently out of stock</option>
                <option value="Store closing soon / End of business day">Store closing soon / End of day</option>
                <option value="Delivery address out of serviceable reach">Delivery address out of reach</option>
                <option value="Heavy store counter rush / Delay expected">Heavy counter rush / Peak load</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToReject(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ADD NEW PRODUCT MODAL
          ======================================================== */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Product to Store Catalog</h3>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('prodName') as HTMLInputElement).value;
                const price = Number((form.elements.namedItem('prodPrice') as HTMLInputElement).value);
                const quantity = (form.elements.namedItem('prodQty') as HTMLInputElement).value;
                const category = (form.elements.namedItem('prodCat') as HTMLSelectElement).value;

                const newProd: Product = {
                  id: `custom-prod-${Date.now()}`,
                  name,
                  price,
                  originalPrice: price + 10,
                  quantity,
                  category,
                  image: '/src/assets/images/prod_fresh_carrots_1792252988042.jpg',
                  storeId: currentStore.id,
                  inStock: true,
                };

                setProductsCatalog((prev) => [newProd, ...prev]);
                setIsAddProductModalOpen(false);
                showToast(`Product "${name}" added to ${currentStore.name} catalog!`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                <input
                  name="prodName"
                  required
                  placeholder="e.g., Mysore Sandal Soap (150g)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    name="prodPrice"
                    type="number"
                    required
                    placeholder="e.g., 65"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pack Size / Weight</label>
                  <input
                    name="prodQty"
                    required
                    placeholder="e.g., 150 g or 1 kg"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  name="prodCat"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Dairy & Breakfast">Dairy & Breakfast</option>
                  <option value="Daily Staples">Daily Staples</option>
                  <option value="Atta & Flours">Atta & Flours</option>
                  <option value="Snacks & Instant Food">Snacks & Instant Food</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: STORE TIMINGS MODAL
          ======================================================== */}
      {isStoreHoursModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Update Store Timings</h3>
              <button
                type="button"
                onClick={() => setIsStoreHoursModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Morning Opening</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Night Closing</label>
                  <input
                    type="time"
                    defaultValue="22:00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Days Open</label>
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px]">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <span
                      key={day}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStoreHoursModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsStoreHoursModalOpen(false);
                  showToast('Store operating timings saved (8:00 AM - 10:00 PM).');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
              >
                Save Timings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: STORE ANNOUNCEMENT MODAL
          ======================================================== */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Broadcast Store Announcement</h3>
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                This notice will appear in the customer shopping app under Shree Lakshmi Kirana's banner.
              </p>
              <textarea
                rows={3}
                defaultValue="Fresh Ooty vegetables & Belavadi farm greens arrived this morning! Special 10% discount on Atta 5kg packs."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAnnouncementModalOpen(false);
                  showToast('Store announcement broadcasted to local customers!');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
              >
                Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: HELP & SUPPORT MODAL
          ======================================================== */}
      {isHelpSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Partner Help & Support</h3>
                  <p className="text-[10px] text-slate-500">GroceryGo Mysuru Merchant Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpSupportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Merchant Helpline</p>
                  <p className="text-[11px] text-slate-500">Toll-free 8:00 AM - 10:30 PM</p>
                </div>
                <a
                  href="tel:+918001234567"
                  className="flex items-center gap-1 font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1800-123-4567</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Partner Field Executive</p>
                  <p className="text-[11px] text-slate-500">Hootagalli & Belavadi Zone</p>
                </div>
                <span className="font-bold text-slate-800">Manjunath (+91 94498 77665)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpSupportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
              >
                Close Support
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
