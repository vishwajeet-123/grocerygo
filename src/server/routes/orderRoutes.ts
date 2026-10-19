import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import { realtimeHub } from '../realtime.js';
import { Order, OrderStatus, OrderTimelineStep } from '../../types.js';

const router = Router();

// Create new order
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    storeId,
    items,
    deliveryAddress,
    paymentMethod = 'UPI / Google Pay',
    deliveryInstructions,
    couponCode,
    couponDiscount = 0,
  } = req.body;

  if (!storeId || !items || !items.length || !deliveryAddress) {
    res.status(400).json({ error: 'Store, items, and delivery address are required.' });
    return;
  }

  const db = getDb();
  const store = db.stores.find((s) => s.id === storeId);
  if (!store) {
    res.status(404).json({ error: 'Store not found.' });
    return;
  }

  // Validate remote delivery distance
  const config = db.config;
  const distanceKm = deliveryAddress.distanceKm || 1.5;
  if (!config.allowRemoteDelivery && distanceKm > config.hyperlocalMaxKm) {
    res.status(400).json({
      error: `Remote delivery is currently disabled. Delivery address is ${distanceKm} km away (limit: ${config.hyperlocalMaxKm} km).`,
    });
    return;
  }

  if (distanceKm > config.remoteMaxKm) {
    res.status(400).json({
      error: `Address is ${distanceKm} km away, which exceeds the maximum delivery radius of ${config.remoteMaxKm} km.`,
    });
    return;
  }

  // Calculate pricing & remote surcharge
  let subtotal = 0;
  for (const item of items) {
    const p = db.products.find((prod) => prod.id === item.product.id);
    const unitPrice = p ? p.price : item.product.price;
    subtotal += unitPrice * item.quantity;
  }

  // Dynamic remote delivery fee calculation
  let remoteAreaSurcharge = 0;
  let deliveryFee = 0;
  if (distanceKm > config.hyperlocalMaxKm) {
    const extraKm = distanceKm - config.hyperlocalMaxKm;
    remoteAreaSurcharge = Math.round(extraKm * config.baseRemoteFeePerKm);
    deliveryFee = 25 + remoteAreaSurcharge;
  } else {
    deliveryFee = distanceKm > 2 ? 15 : 0;
  }

  const packingFee = 10;
  const totalAmount = Math.max(0, subtotal + packingFee + deliveryFee - (couponDiscount || 0));

  // Atomic stock decrement
  for (const item of items) {
    const pIdx = db.products.findIndex((prod) => prod.id === item.product.id);
    if (pIdx !== -1) {
      const prod = db.products[pIdx] as any;
      if (prod.stockQuantity !== undefined) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        prod.inStock = prod.stockQuantity > 0;
      }
    }
  }

  // Generate 4-digit OTP
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
  const orderNumber = `GG-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = `ord-${Date.now()}`;
  const now = new Date();

  const initialTimeline: OrderTimelineStep[] = [
    {
      status: 'placed',
      title: 'Order Placed & Awaiting Store Confirmation',
      description: `Your order was sent to ${store.name}.`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCompleted: true,
      isCurrent: true,
    },
    {
      status: 'confirmed',
      title: 'Store Accepted & Processing',
      description: 'Store owner has acknowledged your order.',
      time: '--:--',
      isCompleted: false,
      isCurrent: false,
    },
    {
      status: 'packing',
      title: 'Items Packed & Ready for Pickup',
      description: 'Groceries are bagged and sealed.',
      time: '--:--',
      isCompleted: false,
      isCurrent: false,
    },
    {
      status: 'out_for_delivery',
      title: 'Delivery Partner En Route',
      description: 'Delivery partner has picked up your package.',
      time: '--:--',
      isCompleted: false,
      isCurrent: false,
    },
    {
      status: 'delivered',
      title: 'Delivered Successfully',
      description: 'Verified with delivery OTP.',
      time: '--:--',
      isCompleted: false,
      isCurrent: false,
    },
  ];

  const newOrder: Order & { customerId: string; customerName: string; customerPhone: string; instructions?: string } = {
    id: orderId,
    orderNumber,
    customerId: user.id,
    customerName: user.name,
    customerPhone: user.phone,
    store,
    items,
    subtotal,
    packingFee,
    deliveryFee,
    remoteAreaSurcharge,
    discount: couponDiscount || 0,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod.toLowerCase().includes('cash') ? 'cod' : 'paid',
    createdAt: now.toISOString(),
    status: 'placed',
    estimatedDeliveryTime: `${distanceKm > 10 ? '45-60' : '20-30'} mins`,
    deliveryOtp,
    deliveryAddress,
    instructions: deliveryInstructions,
    timeline: initialTimeline,
  };

  db.orders.unshift(newOrder as any);
  saveDb(db);

  // Broadcast real-time event
  realtimeHub.broadcast('order_created', {
    order: newOrder,
    storeId: store.id,
    customerId: user.id,
  });

  res.status(201).json(newOrder);
});

// Get orders list (filtered by role)
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = getDb();

  let orders = db.orders;

  if (user.role === 'customer') {
    orders = orders.filter((o: any) => o.customerId === user.id || !o.customerId);
  } else if (user.role === 'store_owner') {
    if (user.storeId) {
      orders = orders.filter((o) => o.store.id === user.storeId);
    }
  } else if (user.role === 'delivery_partner') {
    // Deliveries assigned to this partner OR ready to be picked up
    orders = orders.filter((o) =>
      o.deliveryPartner?.id === user.deliveryPartnerId ||
      o.status === 'confirmed' ||
      o.status === 'packing' ||
      o.status === 'out_for_delivery'
    );
  }
  // Admin sees all orders

  res.json(orders);
});

// Get single order
router.get('/:orderId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const user = req.user!;
  const db = getDb();

  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Permission check
  if (user.role === 'customer' && (order as any).customerId && (order as any).customerId !== user.id) {
    res.status(403).json({ error: 'Access denied to this order.' });
    return;
  }
  if (user.role === 'store_owner' && user.storeId && order.store.id !== user.storeId) {
    res.status(403).json({ error: 'Access denied to another store’s orders.' });
    return;
  }

  res.json(order);
});

// Update order status (accept/reject/packing/dispatch/delivered)
router.patch('/:orderId/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const { status, otp, rejectionReason } = req.body;
  const user = req.user!;

  const db = getDb();
  const idx = db.orders.findIndex((o) => o.id === orderId);
  if (idx === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const order = db.orders[idx];

  // If status is 'delivered', verify OTP if provided
  if (status === 'delivered') {
    if (otp && otp.trim() !== order.deliveryOtp) {
      res.status(400).json({ error: `Incorrect Delivery OTP. Please verify with customer.` });
      return;
    }
  }

  order.status = status as OrderStatus;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Update timeline
  const stepIdx = order.timeline.findIndex((s) => s.status === status);
  if (stepIdx !== -1) {
    order.timeline.forEach((step, i) => {
      if (i < stepIdx) {
        step.isCompleted = true;
        step.isCurrent = false;
      } else if (i === stepIdx) {
        step.isCompleted = true;
        step.isCurrent = true;
        step.time = timeStr;
      } else {
        step.isCompleted = false;
        step.isCurrent = false;
      }
    });
  }

  if (status === 'cancelled' && rejectionReason) {
    (order as any).cancellationReason = rejectionReason;
  }

  // Auto assign delivery partner if entering out_for_delivery and partner unassigned
  if (status === 'out_for_delivery' && !order.deliveryPartner && db.deliveryPartners.length > 0) {
    order.deliveryPartner = db.deliveryPartners[0];
  }

  saveDb(db);

  realtimeHub.broadcast('order_updated', {
    order,
    status,
    updatedBy: user.name,
    role: user.role,
  });

  res.json(order);
});

// Assign delivery partner
router.patch('/:orderId/assign-delivery', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const { deliveryPartnerId } = req.body;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const partner = db.deliveryPartners.find((dp) => dp.id === deliveryPartnerId);
  if (!partner) {
    res.status(404).json({ error: 'Delivery partner not found' });
    return;
  }

  order.deliveryPartner = partner;
  saveDb(db);

  realtimeHub.broadcast('delivery_assigned', {
    orderId,
    deliveryPartner: partner,
  });

  res.json(order);
});

export default router;
