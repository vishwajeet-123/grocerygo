import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import { realtimeHub } from '../realtime.js';
import { syncOrderToMongo, getOrderFromMongo, getOrdersFromMongo } from '../mongodb.js';
import { Order, OrderStatus, OrderTimelineStep } from '../../types.js';

const router = Router();

// Create new order
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
    storeAcceptanceStatus: 'awaiting_acceptance',
    deliveryAssignmentStatus: 'unassigned',
    estimatedDeliveryTime: `${distanceKm > 10 ? '45-60' : '20-30'} mins`,
    deliveryOtp,
    deliveryAddress,
    deliveryInstructions: deliveryInstructions || '',
    instructions: deliveryInstructions || '',
    timeline: initialTimeline,
  };

  db.orders.unshift(newOrder as any);
  saveDb(db);
  await syncOrderToMongo(newOrder);

  // Broadcast real-time event to store owner and all subscribers
  realtimeHub.broadcast('order_created', {
    order: newOrder,
    storeId: store.id,
    customerId: user.id,
  });

  res.status(201).json(newOrder);
});

// Get orders list (filtered by role, reading from MongoDB when connected)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = getDb();

  // Primary source: MongoDB if connected, backed by persistent db
  let orders = db.orders;
  const mongoOrders = await getOrdersFromMongo();
  if (mongoOrders && mongoOrders.length > 0) {
    orders = mongoOrders as any[];
  }

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

// Get single order (from MongoDB first, with persistent fallback)
router.get('/:orderId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const user = req.user!;
  const db = getDb();

  let order = await getOrderFromMongo(orderId);
  if (!order) {
    order = db.orders.find((o) => o.id === orderId);
  }
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
router.patch('/:orderId/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

  if (status === 'packing') {
    order.fulfillmentStatus = 'ready_for_pickup';
    order.packedAt = new Date().toISOString();
    order.packedBy = user.name;
    if (!order.deliveryPartner) {
      order.deliveryAssignmentStatus = 'offered';
    }
  }

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
        if (status === 'packing') {
          step.title = 'Items Packed & Ready for Pickup';
          step.description = `${order.store.name} has packed your items and sealed the package for pickup.`;
        }
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

  if (status === 'packing') {
    realtimeHub.broadcast('items_packed_ready_for_pickup', {
      orderId: order.id,
      order,
      storeId: order.store.id,
      storeName: order.store.name,
      assignedPartnerId: order.deliveryPartner?.id,
      isAssigned: !!order.deliveryPartner,
      message: `${order.store.name} has packed the order. Accept the delivery to collect it.`,
    });

    if (!order.deliveryPartner) {
      realtimeHub.broadcast('delivery_assignment_offered', {
        orderId: order.id,
        order,
      });
    }
  }

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

// Store owner accepts order
router.post('/:orderId/accept', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const user = req.user!;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (user.role === 'store_owner' && user.storeId && order.store.id !== user.storeId) {
    res.status(403).json({ error: 'Unauthorized: You do not manage this store.' });
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  order.status = 'confirmed';
  order.storeAcceptanceStatus = 'accepted';
  order.storeAcceptedAt = now.toISOString();
  order.deliveryAssignmentStatus = 'offered';

  // Update timeline
  const confStep = order.timeline.find((s) => s.status === 'confirmed');
  if (confStep) {
    confStep.isCompleted = true;
    confStep.isCurrent = true;
    confStep.time = timeStr;
  }
  const placedStep = order.timeline.find((s) => s.status === 'placed');
  if (placedStep) {
    placedStep.isCurrent = false;
  }

  saveDb(db);

  realtimeHub.broadcast('order_updated', {
    order,
    status: 'confirmed',
    updatedBy: user.name,
    role: user.role,
  });

  realtimeHub.broadcast('delivery_assignment_offered', {
    orderId: order.id,
    order,
  });

  res.json({ success: true, order });
});

// Store owner rejects order
router.post('/:orderId/reject', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const { reason = 'Store is currently out of stock or unable to fulfill' } = req.body;
  const user = req.user!;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (user.role === 'store_owner' && user.storeId && order.store.id !== user.storeId) {
    res.status(403).json({ error: 'Unauthorized: You do not manage this store.' });
    return;
  }

  order.status = 'cancelled';
  order.storeAcceptanceStatus = 'rejected';
  order.rejectionReason = reason;
  (order as any).cancellationReason = reason;
  order.deliveryAssignmentStatus = 'failed';
  if (order.paymentStatus === 'paid') {
    order.paymentStatus = 'refund_pending';
  }

  // Restore inventory
  for (const item of order.items) {
    const prod = db.products.find((p) => p.id === item.product.id) as any;
    if (prod && prod.stockQuantity !== undefined) {
      prod.stockQuantity += item.quantity;
      prod.inStock = true;
    }
  }

  saveDb(db);

  realtimeHub.broadcast('order_updated', {
    order,
    status: 'cancelled',
    rejectionReason: reason,
    updatedBy: user.name,
    role: user.role,
  });

  res.json({ success: true, order });
});

// Store owner marks items packed & ready for pickup
router.post('/:orderId/mark-ready', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const user = req.user!;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // 1. Authenticate store owner and verify access to the order's store
  if (user.role === 'store_owner' && user.storeId && order.store.id !== user.storeId) {
    res.status(403).json({ error: 'Unauthorized: You do not manage this store.' });
    return;
  }

  // 2. Validate that the order has been accepted and can transition to ready for pickup
  if (order.status === 'placed' && order.storeAcceptanceStatus !== 'accepted') {
    res.status(400).json({ error: 'Order must first be accepted by store before marking packed & ready for pickup.' });
    return;
  }
  if (order.status === 'cancelled') {
    res.status(400).json({ error: 'Cannot pack a cancelled order.' });
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 3. Save new order status, timestamp, responsible store owner
  order.status = 'packing';
  order.fulfillmentStatus = 'ready_for_pickup';
  order.packedAt = now.toISOString();
  order.packedBy = user.name;

  if (!order.deliveryPartner) {
    order.deliveryAssignmentStatus = 'offered';
  }

  // Update timeline step
  const packStep = order.timeline.find((s) => s.status === 'packing');
  if (packStep) {
    packStep.title = 'Items Packed & Ready for Pickup';
    packStep.description = `${order.store.name} has packed your items and sealed the package for pickup.`;
    packStep.isCompleted = true;
    packStep.isCurrent = true;
    packStep.time = timeStr;
  }
  const confStep = order.timeline.find((s) => s.status === 'confirmed');
  if (confStep) {
    confStep.isCurrent = false;
    confStep.isCompleted = true;
  }

  saveDb(db);

  // 4. Publish real-time events after DB operation succeeds
  realtimeHub.broadcast('order_updated', {
    order,
    status: 'packing',
    fulfillmentStatus: 'ready_for_pickup',
    updatedBy: user.name,
    role: user.role,
  });

  realtimeHub.broadcast('items_packed_ready_for_pickup', {
    orderId: order.id,
    order,
    storeId: order.store.id,
    storeName: order.store.name,
    assignedPartnerId: order.deliveryPartner?.id,
    isAssigned: !!order.deliveryPartner,
    message: `${order.store.name} has packed the order. Accept the delivery to collect it.`,
  });

  if (!order.deliveryPartner) {
    realtimeHub.broadcast('delivery_assignment_offered', {
      orderId: order.id,
      order,
    });
  }

  res.json({ success: true, order });
});

export default router;
