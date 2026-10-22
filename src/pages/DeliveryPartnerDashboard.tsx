import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ExternalLink,
  X,
  AlertTriangle,
  Package,
  Crosshair,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import {
  deliveryApi,
  ordersApi,
  realtimeClient,
  UserSession,
} from '../utils/api';
import { InteractiveGoogleMap, MapMarkerItem } from '../components/InteractiveGoogleMap';
import { isValidGoogleMapsApiKey, getEffectiveGoogleMapsApiKey } from '../utils/googleMaps';

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
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'available' | 'completed'>('assigned');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // OTP Verification state
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reject modal state
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Outside current delivery zone');
  const [isRejecting, setIsRejecting] = useState(false);

  // Realtime "New Delivery — Items Ready for Pickup" alert banner
  const [readyAlert, setReadyAlert] = useState<{
    orderId: string;
    storeName: string;
    message: string;
    order: Order;
  } | null>(null);

  // Geolocation & GPS Tracking
  const [isDeviceGpsActive, setIsDeviceGpsActive] = useState(false);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'tracking' | 'denied' | 'simulated'>('idle');
  const [partnerCoords, setPartnerCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.3385,
    lng: 76.5992,
  });
  const watchIdRef = useRef<number | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load all deliveries & dispatches from real backend database
  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const [myList, availableList] = await Promise.all([
        deliveryApi.getMyDeliveries(),
        deliveryApi.getAvailableDispatches(),
      ]);

      setDeliveries(myList);
      setAvailableOrders(availableList);

      // Keep selection or pick first relevant order
      setSelectedOrder((prev) => {
        if (prev) {
          const inMyList = myList.find((o) => o.id === prev.id);
          if (inMyList) return inMyList;
          const inAvail = availableList.find((o) => o.id === prev.id);
          if (inAvail) return inAvail;
        }
        return myList[0] || availableList[0] || null;
      });
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();

    // Subscribe to realtime backend stream
    const unsubscribe = realtimeClient.subscribe((event) => {
      if (
        event.type === 'order_created' ||
        event.type === 'order_updated' ||
        event.type === 'delivery_assigned' ||
        event.type === 'delivery_assignment_offered' ||
        event.type === 'delivery_rejected'
      ) {
        loadDeliveries();
      }

      // Explicit trigger when store owner marks order packed & ready
      if (event.type === 'items_packed_ready_for_pickup' && event.payload) {
        const payload = event.payload;
        const currentPartnerId = currentUser?.deliveryPartnerId || currentUser?.id;

        // If assigned to another partner, ignore
        if (payload.isAssigned && payload.assignedPartnerId && payload.assignedPartnerId !== currentPartnerId) {
          return;
        }

        setReadyAlert({
          orderId: payload.orderId,
          storeName: payload.storeName || payload.order?.store?.name || 'Local Store',
          message:
            payload.message ||
            `${payload.storeName || 'The store'} has packed the order. Accept the delivery to collect it.`,
          order: payload.order,
        });

        showToast(
          `🔔 New Delivery — Items Ready for Pickup: ${payload.storeName || 'Store'} has packed order #${payload.order?.orderNumber || payload.orderId.slice(-6)}`
        );

        loadDeliveries();
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle Device Geolocation tracking
  const startDeviceGps = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('denied');
      showToast('Geolocation is not supported by your browser. Using simulated GPS.');
      setGpsSimulating(true);
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setGpsSimulating(false);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPartnerCoords(coords);
        setIsDeviceGpsActive(true);
        setLocationStatus('tracking');

        if (currentUser?.deliveryPartnerId) {
          deliveryApi.updateLocation(
            currentUser.deliveryPartnerId,
            coords.lat,
            coords.lng,
            selectedOrder?.id
          );
        }
      },
      (err) => {
        console.warn('Geolocation permission/position error:', err);
        setIsDeviceGpsActive(false);
        setLocationStatus('denied');
        showToast('Device GPS permission denied or unavailable. Fallback simulation available.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    watchIdRef.current = id;
  };

  const stopDeviceGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsDeviceGpsActive(false);
    setLocationStatus('idle');
  };

  // Toggle GPS on/off or toggle between real device & simulation
  const handleToggleGps = () => {
    if (isDeviceGpsActive) {
      stopDeviceGps();
      setGpsSimulating(false);
      showToast('Live GPS location tracking stopped.');
    } else if (gpsSimulating) {
      setGpsSimulating(false);
      setLocationStatus('idle');
      showToast('Simulation paused.');
    } else {
      // Attempt device GPS first
      startDeviceGps();
    }
  };

  // Turn off tracking when going off duty
  useEffect(() => {
    if (!isOnline) {
      stopDeviceGps();
      setGpsSimulating(false);
    }
  }, [isOnline]);

  // Clean up geolocation on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // GPS coordinate simulation (fallback for development / demo)
  useEffect(() => {
    if (!gpsSimulating || !selectedOrder) return;
    setLocationStatus('simulated');

    const interval = setInterval(() => {
      setPartnerCoords((prev) => {
        const dest = selectedOrder.deliveryAddress;
        const newLat = prev.lat + (dest.lat - prev.lat) * 0.08;
        const newLng = prev.lng + (dest.lng - prev.lng) * 0.08;

        if (currentUser?.deliveryPartnerId) {
          deliveryApi.updateLocation(
            currentUser.deliveryPartnerId,
            newLat,
            newLng,
            selectedOrder.id
          );
        }

        return { lat: newLat, lng: newLng };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [gpsSimulating, selectedOrder, currentUser]);

  // Accept Dispatch Order (Atomic assignment)
  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await deliveryApi.acceptOrder(orderId);
      showToast(
        `✓ Assigned to you: Order #${res.order.orderNumber}! Please proceed to ${res.order.store.name} for pickup.`
      );
      if (readyAlert?.orderId === orderId) {
        setReadyAlert(null);
      }
      await loadDeliveries();
      setSelectedOrder(res.order);
      setActiveTab('assigned');
    } catch (err: any) {
      showToast(`Accept failed: ${err.message || 'Already claimed by another partner'}`);
      await loadDeliveries();
    }
  };

  // Reject Dispatch Order
  const handleConfirmReject = async () => {
    if (!rejectOrderModal) return;
    try {
      setIsRejecting(true);
      await deliveryApi.rejectOrder(rejectOrderModal.id, rejectReason);
      showToast(`Dispatch #${rejectOrderModal.orderNumber} rejected. Customer order remains active for other partners.`);
      if (readyAlert?.orderId === rejectOrderModal.id) {
        setReadyAlert(null);
      }
      setRejectOrderModal(null);
      await loadDeliveries();
    } catch (err: any) {
      showToast(`Reject failed: ${err.message || 'Error'}`);
    } finally {
      setIsRejecting(false);
    }
  };

  // Confirm Pickup from Store (Transition to OUT_FOR_DELIVERY)
  const handleConfirmPickup = async (orderId: string) => {
    try {
      const res = await deliveryApi.pickupOrder(orderId);
      showToast(`✓ Order #${res.order.orderNumber} picked up! Customer notified: Out for Delivery.`);
      await loadDeliveries();
      setSelectedOrder(res.order);
      // Start location sharing if not already active
      if (!isDeviceGpsActive && !gpsSimulating) {
        setGpsSimulating(true);
      }
    } catch (err: any) {
      showToast(`Confirm pickup failed: ${err.message || 'Error'}`);
    }
  };

  // Complete Delivery with Customer 4-digit OTP
  const handleVerifyOtp = async (order: Order) => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError('Please enter the 4-digit OTP provided by the customer');
      return;
    }

    try {
      setIsVerifying(true);
      setOtpError(null);
      const res = await deliveryApi.completeDelivery(order.id, otpInput.trim());
      showToast(`🎉 Order #${order.orderNumber} successfully delivered and verified!`);
      setOtpInput('');
      setGpsSimulating(false);
      stopDeviceGps();
      await loadDeliveries();
      setSelectedOrder(res.order);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid delivery OTP. Please verify with customer.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Derived metrics calculated strictly from actual backend records
  const activeDeliveries = useMemo(() => {
    return deliveries.filter(
      (o) =>
        o.status === 'out_for_delivery' ||
        o.status === 'packing' ||
        (o.status === 'confirmed' && o.deliveryAssignmentStatus === 'accepted')
    );
  }, [deliveries]);

  const readyForPickupOrders = useMemo(() => {
    // Both available dispatches ready for pickup and claimed active orders awaiting pickup
    return [
      ...availableOrders.filter((o) => o.status === 'packing' || o.fulfillmentStatus === 'ready_for_pickup'),
      ...activeDeliveries.filter((o) => o.status === 'packing' || o.fulfillmentStatus === 'ready_for_pickup'),
    ];
  }, [availableOrders, activeDeliveries]);

  const completedDeliveries = useMemo(() => {
    return deliveries.filter((o) => o.status === 'delivered');
  }, [deliveries]);

  // Real today's earnings calculated from actual completed delivery fees + remote surcharges
  const todayEarnings = useMemo(() => {
    return completedDeliveries.reduce((sum, o) => {
      const baseFee = o.deliveryFee !== undefined ? o.deliveryFee : 25;
      const surcharge = o.remoteAreaSurcharge || 0;
      return sum + baseFee + surcharge;
    }, 0);
  }, [completedDeliveries]);

  // Map markers for the selected order
  const mapMarkers: MapMarkerItem[] = useMemo(() => {
    if (!selectedOrder) return [];

    const storeLat = typeof selectedOrder.store?.lat === 'number' ? selectedOrder.store.lat : 12.3392;
    const storeLng = typeof selectedOrder.store?.lng === 'number' ? selectedOrder.store.lng : 76.5927;
    let custLat = typeof selectedOrder.deliveryAddress?.lat === 'number' ? selectedOrder.deliveryAddress.lat : 12.3375;
    let custLng = typeof selectedOrder.deliveryAddress?.lng === 'number' ? selectedOrder.deliveryAddress.lng : 76.5980;

    if (Math.abs(custLat - storeLat) < 0.0001 && Math.abs(custLng - storeLng) < 0.0001) {
      custLat = 12.3375;
      custLng = 76.5980;
    }

    const list: MapMarkerItem[] = [
      {
        id: `store-${selectedOrder.store.id}`,
        title: selectedOrder.store.name,
        subtitle: `Pickup: ${selectedOrder.store.address}`,
        position: { lat: storeLat, lng: storeLng },
        type: 'store',
        badge: 'Store Pickup',
      },
      {
        id: `cust-${selectedOrder.id}`,
        title: selectedOrder.deliveryAddress.name,
        subtitle: `Drop: ${selectedOrder.deliveryAddress.address}`,
        position: { lat: custLat, lng: custLng },
        type: 'customer',
        badge: selectedOrder.deliveryAddress.isRemote ? 'Remote Destination' : 'Customer Drop',
      },
    ];

    if (isOnline) {
      list.push({
        id: 'rider-current',
        title: currentUser?.name || 'Rider (You)',
        subtitle: isDeviceGpsActive
          ? 'Live Device GPS'
          : gpsSimulating
          ? 'Simulated Movement'
          : 'Current Coordinates',
        position: partnerCoords,
        type: 'driver',
        badge: 'Your Location',
      });
    }

    return list;
  }, [selectedOrder, isOnline, isDeviceGpsActive, gpsSimulating, partnerCoords, currentUser]);

  // Approximate route coordinates between store and customer
  const routeCoordinates = useMemo(() => {
    if (!selectedOrder) return [];
    const storeLat = typeof selectedOrder.store?.lat === 'number' ? selectedOrder.store.lat : 12.3392;
    const storeLng = typeof selectedOrder.store?.lng === 'number' ? selectedOrder.store.lng : 76.5927;
    let custLat = typeof selectedOrder.deliveryAddress?.lat === 'number' ? selectedOrder.deliveryAddress.lat : 12.3375;
    let custLng = typeof selectedOrder.deliveryAddress?.lng === 'number' ? selectedOrder.deliveryAddress.lng : 76.5980;

    if (Math.abs(custLat - storeLat) < 0.0001 && Math.abs(custLng - storeLng) < 0.0001) {
      custLat = 12.3375;
      custLng = 76.5980;
    }

    return [
      { lat: storeLat, lng: storeLng },
      { lat: custLat, lng: custLng },
    ];
  }, [selectedOrder]);

  // Google Maps navigation links
  const navigateToStoreUrl = selectedOrder
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.store.lat ?? 12.3392},${selectedOrder.store.lng ?? 76.5927}`
    : '#';

  const navigateToCustomerUrl = selectedOrder
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.deliveryAddress.lat ?? 12.3375},${selectedOrder.deliveryAddress.lng ?? 76.5980}`
    : '#';

  const hasMapsKey = isValidGoogleMapsApiKey(getEffectiveGoogleMapsApiKey());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Realtime Alert Banner: "New Delivery — Items Ready for Pickup" */}
      {readyAlert && (
        <div className="bg-emerald-700 text-white px-4 py-3 shadow-md border-b border-emerald-800 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-800/80 rounded-lg text-emerald-200 shrink-0 mt-0.5">
                <Package className="w-5 h-5 text-lime-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-lime-300">
                  New Delivery — Items Ready for Pickup
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  "{readyAlert.storeName} has packed the order. Accept the delivery to collect it."
                </p>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Order #{readyAlert.order.orderNumber} • Destination: {readyAlert.order.deliveryAddress.address} ({readyAlert.order.deliveryAddress.distanceKm} km)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleAcceptOrder(readyAlert.orderId)}
                className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-extrabold rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                Accept Delivery Now
              </button>
              <button
                type="button"
                onClick={() => setReadyAlert(null)}
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/50 rounded-lg cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
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
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
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
            onClick={() => {
              const nextState = !isOnline;
              setIsOnline(nextState);
              showToast(nextState ? 'Status set to: On Duty (Online)' : 'Status set to: Off Duty (Offline)');
            }}
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

          {/* User Profile & Navigation */}
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-6 flex-1 flex flex-col gap-6">
        {/* 1. Dashboard Summary: 5 Required Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Active Deliveries */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Deliveries</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Bike className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">{activeDeliveries.length}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Assigned to you</p>
            </div>
          </div>

          {/* Available Dispatches */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Available Dispatches</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                <StoreIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">{availableOrders.length}</p>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">Open for claiming</p>
            </div>
          </div>

          {/* Ready for Pickup */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ready for Pickup</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">{readyForPickupOrders.length}</p>
              <p className="text-[11px] text-purple-600 font-medium mt-0.5">Packed by stores</p>
            </div>
          </div>

          {/* Completed Deliveries */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Completed Deliveries</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">{completedDeliveries.length}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Verified with OTP</p>
            </div>
          </div>

          {/* Today's Earnings (Real calculation from DB records) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Today's Earnings</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">₹{todayEarnings}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {completedDeliveries.length > 0
                  ? `From ${completedDeliveries.length} delivered order${completedDeliveries.length > 1 ? 's' : ''}`
                  : '0 deliveries recorded'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex flex-wrap gap-2">
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
              Available Dispatches ({availableOrders.length})
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

          <div className="flex items-center gap-2">
            {/* GPS location toggle button */}
            <button
              type="button"
              onClick={handleToggleGps}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                isDeviceGpsActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : gpsSimulating
                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Live GPS Location tracking"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDeviceGpsActive || gpsSimulating ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>
                {isDeviceGpsActive
                  ? 'Device GPS: Active'
                  : gpsSimulating
                  ? 'Simulated GPS: On'
                  : 'Share My Location'}
              </span>
            </button>

            <button
              type="button"
              onClick={loadDeliveries}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Two-Column Working Area: Dispatches & Active Details on Left, Interactive Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Order Listings & Action Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Tab 1: My Active Deliveries */}
            {activeTab === 'assigned' && (
              <>
                {activeDeliveries.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                    <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No active deliveries right now</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Switch to "Available Dispatches" to claim ready orders from local stores!
                    </p>
                  </div>
                ) : (
                  activeDeliveries.map((order) => {
                    const isReadyForPickup = order.fulfillmentStatus === 'ready_for_pickup' || order.status === 'packing';
                    const isPickedUp = order.status === 'out_for_delivery';

                    return (
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
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isPickedUp
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse'
                                : isReadyForPickup
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isPickedUp ? 'OUT FOR DELIVERY' : isReadyForPickup ? 'READY FOR PICKUP' : 'ASSIGNED TO YOU'}
                          </span>
                        </div>

                        {/* Store Info */}
                        <div className="mt-2.5 flex items-start gap-2">
                          <StoreIcon className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{order.store.name}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{order.store.address}</p>
                          </div>
                        </div>

                        {/* Destination */}
                        <div className="mt-2 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{order.deliveryAddress.name}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{order.deliveryAddress.address}</p>
                            {order.deliveryAddress.isRemote && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                                Remote Village ({order.deliveryAddress.distanceKm} km) • +₹{order.remoteAreaSurcharge || 35} Surcharge
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">{order.items.length} items • ₹{order.totalAmount}</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            {selectedOrder?.id === order.id ? 'Viewing on Map' : 'Select'} <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Tab 2: Available Dispatches */}
            {activeTab === 'available' && (
              <>
                {availableOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">All dispatches claimed</p>
                    <p className="text-xs text-slate-500 mt-1">
                      New store orders marked "Packed & Ready for Pickup" will appear here automatically via real-time stream.
                    </p>
                  </div>
                ) : (
                  availableOrders.map((order) => {
                    const isReady = order.fulfillmentStatus === 'ready_for_pickup' || order.status === 'packing';

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-white p-4 rounded-xl border shadow-xs transition-all ${
                          selectedOrder?.id === order.id
                            ? 'border-emerald-600 ring-2 ring-emerald-500/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Header with Photo & Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={order.store.image || '/src/assets/images/store_local_kirana_1792249945848.jpg'}
                              alt={order.store.name}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">#{order.orderNumber}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    isReady
                                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {isReady ? 'READY FOR PICKUP' : 'AWAITING CLAIM'}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">{order.store.name}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{order.store.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Customer Locality & Address */}
                        <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900">Destination: </span>
                              <span>{order.deliveryAddress.name}</span>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{order.deliveryAddress.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1">
                            <span>🛣 Distance: <strong>{order.deliveryAddress.distanceKm} km</strong></span>
                            <span>⏱ Est. Time: <strong>{order.estimatedDeliveryTime || '20-30 mins'}</strong></span>
                          </div>
                        </div>

                        {/* Products summary & package count */}
                        <div className="mt-2 text-xs text-slate-600">
                          <p className="line-clamp-1">
                            <span className="font-semibold text-slate-700">Items ({order.items.length}): </span>
                            {order.items.map((i) => `${i.product.name} (${i.quantity}x)`).join(', ')}
                          </p>
                        </div>

                        {/* Delivery instructions if present */}
                        {order.deliveryInstructions && (
                          <div className="mt-2 p-2 bg-amber-50/70 rounded border border-amber-200/70 text-[11px] text-amber-900">
                            <span className="font-bold">Instructions: </span>"{order.deliveryInstructions}"
                          </div>
                        )}

                        {/* Action Buttons: Accept and Reject */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900">₹{order.totalAmount}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({order.paymentMethod})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectOrderModal(order);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptOrder(order.id);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                              <Bike className="w-3.5 h-3.5" /> Accept Dispatch
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Tab 3: Completed Deliveries */}
            {activeTab === 'completed' && (
              <>
                {completedDeliveries.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                    <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No completed deliveries yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Deliveries verified with customer OTP will appear here with your payout records.
                    </p>
                  </div>
                ) : (
                  completedDeliveries.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white p-4 rounded-xl border shadow-xs transition-all cursor-pointer ${
                        selectedOrder?.id === order.id
                          ? 'border-emerald-600 ring-2 ring-emerald-500/10'
                          : 'border-slate-200 hover:border-slate-300 opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">#{order.orderNumber}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          DELIVERED & VERIFIED
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5">{order.store.name} → {order.deliveryAddress.name}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-800">
                          Earnings: ₹{(order.deliveryFee || 25) + (order.remoteAreaSurcharge || 0)}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">OTP: {order.deliveryOtp}</span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Right Column: Interactive Delivery Map & Control Panel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {selectedOrder ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                {/* 4. Interactive Google Delivery Map */}
                <div className="relative">
                  <InteractiveGoogleMap
                    center={{ lat: selectedOrder.store.lat ?? 12.3392, lng: selectedOrder.store.lng ?? 76.5927 }}
                    zoom={13}
                    markers={mapMarkers}
                    routeCoordinates={routeCoordinates}
                    height="380px"
                    className="w-full"
                  />

                  {/* Real GPS state badge over map */}
                  <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isDeviceGpsActive
                          ? 'bg-emerald-500 animate-ping'
                          : gpsSimulating
                          ? 'bg-sky-500 animate-pulse'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-bold text-slate-800">
                      {isDeviceGpsActive
                        ? 'Device GPS: Connected'
                        : gpsSimulating
                        ? 'Simulated GPS'
                        : 'Stationary'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {partnerCoords.lat.toFixed(4)}, {partnerCoords.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Order Information Panel */}
                <div className="p-5 flex flex-col gap-4">
                  {/* Top Header of Selected Order */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        Order #{selectedOrder.orderNumber}
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {selectedOrder.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Distance: <strong>{selectedOrder.deliveryAddress.distanceKm} km</strong> • Est. Transit:{' '}
                        <strong>{selectedOrder.estimatedDeliveryTime || '20-30 mins'}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{selectedOrder.totalAmount}</span>
                      <p className="text-[11px] text-slate-500 font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Pickup & Destination Cards with Navigate Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Pickup Store Card */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <StoreIcon className="w-3.5 h-3.5 text-emerald-700" /> Store Pickup
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Origin
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 mt-1">{selectedOrder.store.name}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{selectedOrder.store.address}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                        <a
                          href={`tel:+919448123456`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          <Phone className="w-3 h-3" /> Call Store
                        </a>
                        <a
                          href={navigateToStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" /> Navigate to Store
                        </a>
                      </div>
                    </div>

                    {/* Customer Destination Card */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-600" /> Confirmed Drop
                          </span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                            Destination
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 mt-1">{selectedOrder.deliveryAddress.name}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{selectedOrder.deliveryAddress.address}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                        <a
                          href={`tel:+919876543210`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          <Phone className="w-3 h-3" /> Call Customer
                        </a>
                        <a
                          href={navigateToCustomerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 hover:text-rose-800 bg-white px-2.5 py-1 rounded-md border border-rose-300 shadow-2xs cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" /> Navigate to Customer
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Customer Delivery Instructions */}
                  {selectedOrder.deliveryInstructions && (
                    <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                      <span className="font-bold text-[11px] uppercase tracking-wider block mb-0.5 text-amber-800">
                        Customer Delivery Instructions:
                      </span>
                      <p className="italic font-medium">"{selectedOrder.deliveryInstructions}"</p>
                    </div>
                  )}

                  {/* Package Items Checklist */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Package Items</h3>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
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

                  {/* 5. Pickup and Delivery Action Controls */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col gap-3">
                    {/* State: Awaiting Acceptance (Unclaimed) */}
                    {selectedOrder.deliveryAssignmentStatus !== 'accepted' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptOrder(selectedOrder.id)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
                      >
                        <Bike className="w-4 h-4" /> Accept This Delivery Assignment
                      </button>
                    )}

                    {/* State: Accepted, Awaiting physical pickup from Store */}
                    {selectedOrder.deliveryAssignmentStatus === 'accepted' &&
                      selectedOrder.status !== 'out_for_delivery' &&
                      selectedOrder.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmPickup(selectedOrder.id)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
                        >
                          <Check className="w-4 h-4" /> Confirm Pickup & Start Delivery to Customer
                        </button>
                      )}

                    {/* State: Out For Delivery -> OTP verification required */}
                    {selectedOrder.status === 'out_for_delivery' && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Verify Customer Delivery OTP to Complete
                        </div>
                        <p className="text-xs text-emerald-800 mb-3">
                          Ask the customer for their 4-digit OTP displayed on their order screen to confirm receipt.
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
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            {isVerifying ? 'Verifying...' : 'Verify OTP & Complete Delivery'}
                          </button>
                        </div>

                        {otpError && <p className="text-xs text-rose-600 font-medium mt-2">{otpError}</p>}
                      </div>
                    )}

                    {/* State: Delivered */}
                    {selectedOrder.status === 'delivered' && (
                      <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                        <p className="text-xs font-bold text-emerald-900">Delivery Completed & Verified</p>
                        <p className="text-[11px] text-emerald-700">Verified with customer OTP: {selectedOrder.deliveryOtp}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                <Bike className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Select an order to view the interactive map and live navigation</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reject Dispatch Modal */}
      {rejectOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Reject Dispatch Offer</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectOrderModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                You are rejecting dispatch for order <strong>#{rejectOrderModal.orderNumber}</strong> from{' '}
                <strong>{rejectOrderModal.store.name}</strong>. The order will remain active and offered to another eligible partner.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Reason for Rejection:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Outside current delivery zone">Outside current delivery zone</option>
                  <option value="Vehicle capacity full">Vehicle capacity full</option>
                  <option value="Taking a break / Emergency">Taking a break / Emergency</option>
                  <option value="Too far for current shift">Too far for current shift</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectOrderModal(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
