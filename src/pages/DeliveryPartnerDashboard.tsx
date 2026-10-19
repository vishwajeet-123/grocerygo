import React, { useState, useEffect } from 'react';
import {
  Bike,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  LogOut,
  ChevronRight,
  IndianRupee,
  RefreshCw,
  Power,
  Store as StoreIcon,
  UserCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { deliveryApi, ordersApi, realtimeClient, authApi, UserSession } from '../utils/api';

interface DeliveryPartnerDashboardProps {
  currentUser: UserSession | null;
  onLogout: () => void;
  onNavigateCustomerHome: () => void;
}

export function DeliveryPartnerDashboard({
  currentUser,
  onLogout,
  onNavigateCustomerHome,
}: DeliveryPartnerDashboardProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'available' | 'completed'>('assigned');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [partnerCoords, setPartnerCoords] = useState({ lat: 12.3385, lng: 76.5992 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getMyDeliveries();
      setDeliveries(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();

    // Subscribe to realtime updates
    const unsubscribe = realtimeClient.subscribe((event) => {
      if (event.type === 'order_created' || event.type === 'order_updated' || event.type === 'delivery_assigned') {
        loadDeliveries();
      }
    });

    return () => unsubscribe();
  }, []);

  // GPS coordinate simulation (simulates delivery rider moving towards customer location)
  useEffect(() => {
    if (!gpsSimulating || !selectedOrder) return;

    const interval = setInterval(() => {
      setPartnerCoords((prev) => {
        const dest = selectedOrder.deliveryAddress;
        const newLat = prev.lat + (dest.lat - prev.lat) * 0.08;
        const newLng = prev.lng + (dest.lng - prev.lng) * 0.08;

        // Broadcast new location to server
        if (currentUser?.deliveryPartnerId) {
          deliveryApi.updateLocation(currentUser.deliveryPartnerId, newLat, newLng, selectedOrder.id);
        }

        return { lat: newLat, lng: newLng };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [gpsSimulating, selectedOrder, currentUser]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await deliveryApi.acceptOrder(orderId);
      showToast(`Accepted order #${res.order.orderNumber}. Marked out for delivery.`);
      loadDeliveries();
      setSelectedOrder(res.order);
      setGpsSimulating(true);
    } catch (err: any) {
      alert(err.message || 'Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      showToast(`Updated status to ${newStatus.replace('_', ' ')}`);
      loadDeliveries();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleVerifyOtp = async (order: Order) => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError('Please enter the 4-digit OTP provided by customer');
      return;
    }

    try {
      setIsVerifying(true);
      setOtpError(null);
      const res = await deliveryApi.completeDelivery(order.id, otpInput.trim());
      showToast(`Order #${order.orderNumber} successfully delivered!`);
      setOtpInput('');
      setGpsSimulating(false);
      loadDeliveries();
      setSelectedOrder(res.order);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const activeDeliveries = deliveries.filter((o) => o.status === 'out_for_delivery' || o.status === 'packing');
  const availableOrders = deliveries.filter((o) => o.status === 'confirmed');
  const completedDeliveries = deliveries.filter((o) => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">GroceryGo</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Delivery Partner
              </span>
            </div>
            <p className="text-xs text-slate-500">Live Rider Dispatch & Rural Navigation Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Duty Toggle */}
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isOnline ? 'On Duty (Online)' : 'Off Duty'}</span>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          </button>

          {/* User profile & actions */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{currentUser?.name || 'Ravi Kumar'}</p>
              <p className="text-[10px] text-slate-500">KA-09-ER-4321 • Hero Splendor</p>
            </div>
            <button
              type="button"
              onClick={onNavigateCustomerHome}
              className="text-xs text-slate-600 hover:text-emerald-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Customer App
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 flex-1 flex flex-col gap-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Deliveries</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeDeliveries.length}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Ready for transit</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Bike className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Available Dispatches</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{availableOrders.length}</p>
              <p className="text-[11px] text-amber-600 mt-0.5 font-medium">From Kiranas & Stores</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <StoreIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Today's Earnings</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹740</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Includes ₹180 remote bonus</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Partner Rating</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">4.9 ★</p>
              <p className="text-[11px] text-slate-500 mt-0.5">342 verified deliveries</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('assigned')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'assigned'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              My Active Deliveries ({activeDeliveries.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'available'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Ready For Pickup ({availableOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Completed ({completedDeliveries.length})
            </button>
          </div>

          <button
            type="button"
            onClick={loadDeliveries}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Two-Column Working Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Order List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {activeTab === 'assigned' && (
              <>
                {activeDeliveries.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                    <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No active deliveries right now</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Check the "Ready For Pickup" tab to claim incoming orders from Kirana stores & supermarkets!
                    </p>
                  </div>
                ) : (
                  activeDeliveries.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                        selectedOrder?.id === order.id
                          ? 'border-emerald-600 ring-2 ring-emerald-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">#{order.orderNumber}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-start gap-2">
                        <StoreIcon className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{order.store.name}</p>
                          <p className="text-[11px] text-slate-500">{order.store.address}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{order.deliveryAddress.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{order.deliveryAddress.address}</p>
                          {order.deliveryAddress.isRemote && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                              Remote Delivery ({order.deliveryAddress.distanceKm} km) • +₹{order.remoteAreaSurcharge || 35} Surcharge
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{order.items.length} items • ₹{order.totalAmount}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          View Order Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'available' && (
              <>
                {availableOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">All orders are dispatched</p>
                    <p className="text-xs text-slate-500 mt-1">New store-confirmed orders will appear here automatically in real time.</p>
                  </div>
                ) : (
                  availableOrders.map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">#{order.orderNumber}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          READY FOR DISPATCH
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-2">Pickup: {order.store.name}</p>
                      <p className="text-[11px] text-slate-500">{order.store.address}</p>
                      <p className="text-xs font-bold text-slate-800 mt-2">Destination: {order.deliveryAddress.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{order.deliveryAddress.address}</p>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          ₹{order.totalAmount} <span className="text-slate-400 font-normal">({order.paymentMethod})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(order.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Bike className="w-3.5 h-3.5" /> Accept Delivery
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'completed' && (
              <>
                {completedDeliveries.map((order) => (
                  <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs opacity-90">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">#{order.orderNumber}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                        DELIVERED
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{order.store.name} → {order.deliveryAddress.name}</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">₹{order.totalAmount} • Delivered with OTP {order.deliveryOtp}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Active Delivery Control Panel */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      Order #{selectedOrder.orderNumber}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {selectedOrder.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">₹{selectedOrder.totalAmount}</span>
                    <p className="text-[11px] text-slate-500">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {/* Pickup & Drop Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      <StoreIcon className="w-3.5 h-3.5 text-emerald-700" /> Pickup Store
                    </div>
                    <p className="text-xs font-extrabold text-slate-900">{selectedOrder.store.name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{selectedOrder.store.address}</p>
                    <a
                      href={`tel:+919448123456`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline mt-1.5"
                    >
                      <Phone className="w-3 h-3" /> Call Store
                    </a>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" /> Customer Destination
                    </div>
                    <p className="text-xs font-extrabold text-slate-900">{selectedOrder.deliveryAddress.name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{selectedOrder.deliveryAddress.address}</p>
                    <a
                      href={`tel:+919876543210`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline mt-1.5"
                    >
                      <Phone className="w-3 h-3" /> Call Customer
                    </a>
                  </div>
                </div>

                {/* Live GPS Broadcast Simulation */}
                <div className="bg-sky-50/70 border border-sky-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Navigation className={`w-4 h-4 text-sky-600 ${gpsSimulating ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-bold text-slate-800">Live Rider GPS Location Stream</span>
                    </div>
                    <span className="text-[11px] font-mono text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
                      {partnerCoords.lat.toFixed(4)}° N, {partnerCoords.lng.toFixed(4)}° E
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Live GPS coordinates are transmitted to the server so the customer and store owner see your real-time position on their live map.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGpsSimulating(!gpsSimulating)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        gpsSimulating
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-sky-700 border border-sky-300 hover:bg-sky-50'
                      }`}
                    >
                      {gpsSimulating ? 'Pause GPS Stream' : 'Transmit Live GPS Updates'}
                    </button>
                    <span className="text-[11px] text-slate-500">
                      {gpsSimulating ? 'Broadcasting every 3s' : 'Stationary'}
                    </span>
                  </div>
                </div>

                {/* Items in Package */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Package Items</h3>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {item.quantity}×
                          </span>
                          <span className="font-medium text-slate-800">{item.product.name}</span>
                          <span className="text-slate-400">({item.product.quantity})</span>
                        </div>
                        <span className="font-semibold text-slate-700">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions: Out For Delivery & OTP Verification */}
                <div className="pt-3 border-t border-slate-200 flex flex-col gap-3">
                  {selectedOrder.status !== 'out_for_delivery' && selectedOrder.status !== 'delivered' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'out_for_delivery')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Bike className="w-4 h-4" /> Picked Up from Store & Out for Delivery
                    </button>
                  )}

                  {selectedOrder.status === 'out_for_delivery' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Verify Customer Delivery OTP to Complete
                      </div>
                      <p className="text-xs text-emerald-800 mb-3">
                        Ask customer for their 4-digit OTP displayed on their order screen to confirm receipt.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="4-digit OTP"
                          className="w-32 px-3 py-2 text-center text-base tracking-widest font-mono font-bold rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyOtp(selectedOrder)}
                          disabled={isVerifying}
                          className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isVerifying ? 'Verifying...' : 'Verify OTP & Complete Delivery'}
                        </button>
                      </div>

                      {otpError && <p className="text-xs text-rose-600 font-medium mt-2">{otpError}</p>}
                    </div>
                  )}

                  {selectedOrder.status === 'delivered' && (
                    <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                      <p className="text-xs font-bold text-emerald-900">Delivery Completed & Verified</p>
                      <p className="text-[11px] text-emerald-700">Verified with customer OTP: {selectedOrder.deliveryOtp}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                <Bike className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Select an order to view dispatch details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
