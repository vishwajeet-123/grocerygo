import React, { useState, useMemo } from 'react';
import {
  Home,
  ChevronRight,
  Package,
  Search,
  Filter,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  Store as StoreIcon,
  Receipt,
  Star,
  ExternalLink,
  Compass,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface MyOrdersPageProps {
  orders: Order[];
  onTrackOrder: (orderId: string) => void;
  onNavigateHome: () => void;
  onReorder: (order: Order) => void;
  onNavigateCart: () => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  orders,
  onTrackOrder,
  onNavigateHome,
  onReorder,
  onNavigateCart,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [ratingModalOrder, setRatingModalOrder] = useState<Order | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [reorderToast, setReorderToast] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Tab filter
      if (activeTab === 'ongoing') {
        if (ord.status === 'delivered' || ord.status === 'cancelled') return false;
      } else if (activeTab === 'delivered') {
        if (ord.status !== 'delivered') return false;
      } else if (activeTab === 'cancelled') {
        if (ord.status !== 'cancelled') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStore = ord.store.name.toLowerCase().includes(q);
        const matchesId = ord.orderNumber.toLowerCase().includes(q);
        const matchesItem = ord.items.some((i) =>
          i.product.name.toLowerCase().includes(q)
        );
        const matchesLoc = ord.deliveryAddress.name.toLowerCase().includes(q);
        return matchesStore || matchesId || matchesItem || matchesLoc;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const ongoingCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((o) => o.status === 'delivered').length;
  }, [orders]);

  const handleReorderClick = (order: Order) => {
    onReorder(order);
    setReorderToast(`All items from ${order.orderNumber} added to your Cart!`);
    setTimeout(() => setReorderToast(null), 3500);
  };

  return (
    <div className="pb-16 bg-slate-50/50 min-h-screen">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="py-2 flex items-center text-xs text-slate-500">
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
              <span className="font-bold text-slate-900">My Orders</span>
            </li>
          </ol>
        </nav>

        {/* 2. Page Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    My Orders & Deliveries
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track live deliveries, review past kirana bills, and reorder daily groceries
                  </p>
                </div>
              </div>
            </div>

            {/* Metric counters */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[90px]">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Ongoing
                </span>
                <span className="text-lg font-black text-emerald-950 tabular-nums">
                  {ongoingCount} Active
                </span>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2 text-center min-w-[90px]">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="text-lg font-black text-slate-800 tabular-nums">
                  {orders.length}
                </span>
              </div>
              <div className="bg-purple-50 border border-purple-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[90px]">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                  Coverage
                </span>
                <span className="text-lg font-black text-purple-950 tabular-nums">
                  Remote & Local
                </span>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {reorderToast && (
            <div className="mt-4 bg-emerald-700 text-white p-3 rounded-2xl text-xs flex items-center justify-between shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-200" />
                <span>{reorderToast}</span>
              </div>
              <button
                type="button"
                onClick={onNavigateCart}
                className="underline font-bold text-emerald-100 hover:text-white"
              >
                View Cart →
              </button>
            </div>
          )}

          {/* Filter Tabs & Search Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ongoing')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ongoing'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Ongoing</span>
                {ongoingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full">
                  {ongoingCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('delivered')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'delivered'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Delivered ({deliveredCount})
              </button>
            </div>

            {/* Search within orders */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, items or stores..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* 3. Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try searching for "Atta", "Shree Lakshmi Kirana", or clear search.`
                : 'You have no orders in this tab right now.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isOngoing =
                order.status === 'out_for_delivery' ||
                order.status === 'packing' ||
                order.status === 'placed' ||
                order.status === 'confirmed';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Top Bar: Store info + Order ID + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {order.store.image ? (
                          <img
                            src={order.store.image}
                            alt={order.store.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <StoreIcon className="w-6 h-6 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {order.store.name}
                          </h3>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            {order.store.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Order <strong className="text-slate-800">{order.orderNumber}</strong> • {order.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'out_for_delivery' ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <Truck className="w-3.5 h-3.5" />
                          <span>Out for Delivery ({order.estimatedDeliveryTime})</span>
                        </div>
                      ) : order.status === 'packing' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Packing Fresh Items</span>
                        </div>
                      ) : order.status === 'delivered' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                          <span>Order Placed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Content: Items thumbnails & Delivery Location */}
                  <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Items preview (7 cols) */}
                    <div className="md:col-span-7">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        {order.items.length} Items
                      </span>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1.5 pr-3 shrink-0"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-9 h-9 rounded-lg object-cover bg-white"
                            />
                            <div className="text-[11px] max-w-[120px]">
                              <span className="block font-semibold text-slate-800 truncate">
                                {item.product.name}
                              </span>
                              <span className="text-slate-400">
                                {item.product.quantity} × {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Destination & Locality Classification (5 cols) */}
                    <div className="md:col-span-5 bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-semibold text-slate-500 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          Delivery Location:
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.deliveryAddress.isRemote
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {order.deliveryAddress.areaTag} ({order.deliveryAddress.distanceKm} km)
                        </span>
                      </div>
                      <p className="text-slate-800 font-semibold truncate">
                        {order.deliveryAddress.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {order.deliveryAddress.address}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-slate-400 text-[11px]">Total Paid:</span>{' '}
                        <span className="text-base font-black text-slate-900">
                          ₹{order.totalAmount}
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-medium">{order.paymentMethod}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* View Receipt button */}
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Bill / Receipt</span>
                      </button>

                      {/* Reorder button */}
                      <button
                        type="button"
                        onClick={() => handleReorderClick(order)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>

                      {/* Rate store button (for delivered orders) */}
                      {order.status === 'delivered' && (
                        <button
                          type="button"
                          onClick={() => {
                            setRatingModalOrder(order);
                            setFeedbackSent(false);
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Rate</span>
                        </button>
                      )}

                      {/* Track Order button (Prominent) */}
                      <button
                        type="button"
                        onClick={() => onTrackOrder(order.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{isOngoing ? 'Track Live Delivery' : 'View Tracking Map'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Remote Delivery Banner explaining the feature */}
        <div className="mt-8 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-lime-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Hyperlocal & Beyond
              </span>
              <span className="text-xs text-emerald-300 font-semibold">
                Mysuru Remote Coverage
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Grocery Deliveries with Real Google Maps Routing
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              Never get blocked by rigid 3 km limits. GroceryGo connects you with
              local kirana shops in Hootagalli and enables delivery to distant
              locations like Ilavala Grama, Koorgalli SEZ, KRS Road Belagola, and
              Kadakola with transparent distance-based routing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (orders.length > 0) onTrackOrder(orders[0].id);
            }}
            className="shrink-0 px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>Open Delivery Route Map</span>
          </button>
        </div>
      </div>

      {/* Order Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tax Invoice / Bill
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedReceiptOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex justify-between font-bold">
                <span>{selectedReceiptOrder.store.name}</span>
                <span className="text-emerald-700">{selectedReceiptOrder.store.type}</span>
              </div>
              <p className="text-[11px] text-slate-500">{selectedReceiptOrder.store.address}</p>
              <p className="text-[11px] text-slate-400">Date: {selectedReceiptOrder.createdAt}</p>
            </div>

            <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto pr-1">
              {selectedReceiptOrder.items.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{item.product.name}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {item.product.quantity} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{selectedReceiptOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Packing & Hygiene Charge</span>
                <span>₹{selectedReceiptOrder.packingFee}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charge</span>
                <span>
                  {selectedReceiptOrder.deliveryFee === 0
                    ? 'FREE'
                    : `₹${selectedReceiptOrder.deliveryFee}`}
                </span>
              </div>
              {selectedReceiptOrder.remoteAreaSurcharge ? (
                <div className="flex justify-between text-purple-700 font-semibold">
                  <span>Remote Transit Surcharge</span>
                  <span>₹{selectedReceiptOrder.remoteAreaSurcharge}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1.5 border-t border-slate-100">
                <span>Total Amount Paid</span>
                <span className="text-emerald-800">₹{selectedReceiptOrder.totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReceiptOrder(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Rate Store Modal */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Rate {ratingModalOrder.store.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How was the packing and product quality for order {ratingModalOrder.orderNumber}?
              </p>
            </div>

            {feedbackSent ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold">
                Thank you! Your feedback helps local kirana stores improve.
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= feedbackRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Share a word about the store service..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackSent(true);
                      setTimeout(() => setRatingModalOrder(null), 1500);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Submit Rating
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatingModalOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
