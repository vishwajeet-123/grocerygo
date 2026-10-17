import React, { useState } from 'react';
import {
  Home,
  ChevronRight,
  Package,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Store as StoreIcon,
  Truck,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Share2,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import { Order, OrderStatus, DeliveryLocation, ServiceAreaConfig } from '../types';
import { OrderTrackingMap } from '../components/OrderTrackingMap';
import { MYSURU_LOCALITIES, DEFAULT_SERVICE_AREA_CONFIG } from '../data/orders';

interface OrderTrackingPageProps {
  order: Order;
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateOrderLocation?: (orderId: string, newLoc: DeliveryLocation) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  order,
  onNavigateHome,
  onNavigateOrders,
  onUpdateOrderStatus,
  onUpdateOrderLocation,
}) => {
  const [serviceConfig, setServiceConfig] =
    useState<ServiceAreaConfig>(DEFAULT_SERVICE_AREA_CONFIG);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Status progression helper for demonstration testing
  const advanceStatus = () => {
    const cycle: OrderStatus[] = [
      'placed',
      'confirmed',
      'packing',
      'out_for_delivery',
      'delivered',
    ];
    const currentIndex = cycle.indexOf(order.status);
    const nextStatus = cycle[(currentIndex + 1) % cycle.length];
    onUpdateOrderStatus?.(order.id, nextStatus);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return {
          label: 'Order Placed',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'confirmed':
        return {
          label: 'Confirmed by Kirana',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'packing':
        return {
          label: 'Packing Fresh Groceries',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery (Live)',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse',
        };
      case 'delivered':
        return {
          label: 'Delivered Successfully',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
        };
      case 'cancelled':
        return {
          label: 'Order Cancelled',
          color: 'bg-rose-50 text-rose-800 border-rose-200',
        };
    }
  };

  const badge = getStatusBadge(order.status);

  return (
    <div className="pb-16 bg-slate-50/50 min-h-screen">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* 1. Breadcrumb navigation */}
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
              <button
                type="button"
                onClick={onNavigateOrders}
                className="hover:text-emerald-700 transition-colors cursor-pointer font-medium"
              >
                My Orders
              </button>
            </li>
            <li className="text-slate-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <span className="font-bold text-slate-900">
                Track Order ({order.orderNumber})
              </span>
            </li>
          </ol>
        </nav>

        {/* 2. Top Header with Order ID & Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={onNavigateOrders}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer mr-1"
                title="Back to My Orders"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Track Order <span className="text-emerald-800">{order.orderNumber}</span>
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Placed on: {order.createdAt}</span>
              <span>•</span>
              <span>Fulfilling Store: {order.store.name}</span>
              <span>•</span>
              <span className="font-medium text-emerald-700">
                Payment: {order.paymentMethod} (₹{order.totalAmount})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Share tracking link */}
            <button
              type="button"
              onClick={() => {
                setShareToast(true);
                setTimeout(() => setShareToast(false), 3000);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>

            {/* Test Simulation stepper */}
            <button
              type="button"
              onClick={advanceStatus}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Simulate Next Delivery Status"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Simulate Next Stage</span>
            </button>
          </div>
        </div>

        {shareToast && (
          <div className="mb-4 bg-emerald-700 text-white p-3 rounded-xl text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top">
            <span>Tracking link copied to clipboard! (Live GPS sharing enabled)</span>
            <button
              type="button"
              onClick={() => setShareToast(false)}
              className="text-emerald-200 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Interactive Google Map + Remote Area Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Map Component */}
            <OrderTrackingMap
              store={order.store}
              deliveryLocation={order.deliveryAddress}
              deliveryPartner={order.deliveryPartner}
              orderStatus={order.status}
              serviceConfig={serviceConfig}
              onSelectLocation={(loc) => {
                onUpdateOrderLocation?.(order.id, loc);
              }}
              onUpdateConfig={setServiceConfig}
              allowPickLocation={true}
            />

            {/* Delivery Partner Profile Card (when out for delivery or packing) */}
            {order.deliveryPartner && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.deliveryPartner.photoUrl}
                      alt={order.deliveryPartner.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {order.deliveryPartner.name}
                        </h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          ★ {order.deliveryPartner.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {order.deliveryPartner.vehicleType} •{' '}
                        <strong className="text-slate-700">
                          {order.deliveryPartner.vehicleNumber}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCallModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </button>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Vaccinated & Temperature Verified (98.4°F)</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Completed <strong>{order.deliveryPartner.totalDeliveries}+</strong> deliveries in Mysuru
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Safety OTP Banner */}
            <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4">
              <div>
                <span className="text-emerald-300 font-bold text-xs uppercase tracking-wider block">
                  Delivery Verification Code
                </span>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Share this 4-digit OTP with your delivery executive upon arrival
                </p>
              </div>
              <div className="bg-white text-emerald-950 font-mono font-black text-2xl px-4 py-2 rounded-xl tracking-widest shadow-inner">
                {order.deliveryOtp}
              </div>
            </div>

            {/* Remote Delivery Policy Notice */}
            <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Hyperlocal & Remote Area Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                GroceryGo’s dynamic delivery network provides direct access to
                supermarkets and kirana stores for both local residents in Hootagalli
                and rural citizens across outskirts like Ilavala, KRS Belagola, and
                Kadakola without artificial 3 km cutoffs.
              </p>
            </div>
          </div>

          {/* Right Column: Status Timeline & Order Items Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Timeline Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
                <span>Delivery Status Timeline</span>
                <span className="text-xs font-semibold text-emerald-700">
                  {order.estimatedDeliveryTime}
                </span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {order.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        step.isCurrent
                          ? 'bg-emerald-600 border-white ring-4 ring-emerald-500/30'
                          : step.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300 text-slate-300'
                      }`}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>

                    <div className="text-xs">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${
                            step.isCurrent
                              ? 'text-emerald-800 text-sm'
                              : step.isCompleted
                              ? 'text-slate-900 font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {step.time}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          step.isCurrent
                            ? 'text-emerald-700 font-medium'
                            : 'text-slate-500'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>Delivery Address</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.deliveryAddress.isRemote
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {order.deliveryAddress.areaTag}
                </span>
              </h4>
              <p className="text-xs font-semibold text-slate-800">
                {order.deliveryAddress.name}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {order.deliveryAddress.address}
              </p>
              {order.deliveryAddress.landmark && (
                <p className="text-[11px] text-slate-400">
                  Landmark: {order.deliveryAddress.landmark}
                </p>
              )}
            </div>

            {/* Ordered Items Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-3">
                Items in this Order ({order.items.length})
              </h4>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-2 pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 pt-2 first:pt-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-800 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.product.quantity} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 text-xs">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Item Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Handling & Packing</span>
                  <span>₹{order.packingFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                </div>
                {order.remoteAreaSurcharge ? (
                  <div className="flex justify-between text-purple-700 font-semibold">
                    <span>Remote Transit Surcharge</span>
                    <span>₹{order.remoteAreaSurcharge}</span>
                  </div>
                ) : null}
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2 border-t border-slate-100">
                  <span>Total Paid</span>
                  <span className="text-emerald-900 font-black">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Need Help Button */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>Need Help with Order {order.orderNumber}?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Driver Call Modal */}
      {showCallModal && order.deliveryPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <img
              src={order.deliveryPartner.photoUrl}
              alt={order.deliveryPartner.name}
              className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-emerald-500/20 shadow-md"
            />
            <div>
              <h3 className="font-black text-slate-900 text-lg">
                {order.deliveryPartner.name}
              </h3>
              <p className="text-xs text-slate-500">
                GroceryGo Delivery Executive • {order.deliveryPartner.vehicleNumber}
              </p>
              <div className="mt-3 bg-emerald-50 text-emerald-900 font-mono font-bold text-base py-2 rounded-xl">
                {order.deliveryPartner.phone}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              For privacy and safety, driver calls are routed through GroceryGo secure proxy.
            </p>

            <button
              type="button"
              onClick={() => setShowCallModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Customer Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Customer Support & Store Helpline
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">
                  {order.store.name} Helpline
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct store line for item modifications or packing inquiries
                </p>
                <p className="font-mono text-emerald-700 font-bold mt-1">
                  +91 821 240 8921 (Hootagalli)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">
                  GroceryGo Mysuru Support Desk
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Toll-free 8:00 AM - 10:30 PM for delivery & remote transit queries
                </p>
                <p className="font-mono text-emerald-700 font-bold mt-1">
                  1800-200-4762 (support@grocerygo.in)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
