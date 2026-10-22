import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../auth.js';
import { realtimeHub } from '../realtime.js';

const router = Router();

// Get list of delivery partners
router.get('/partners', requireAuth, (_req, res: Response) => {
  const db = getDb();
  res.json(db.deliveryPartners);
});

// Get deliveries for current logged in delivery partner
// Get deliveries assigned to the current logged in delivery partner
router.get('/my-deliveries', requireAuth, requireRole(['delivery_partner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = getDb();

  const partnerId = user.deliveryPartnerId;
  const deliveries = db.orders.filter(
    (o) => o.deliveryPartner?.id === partnerId
  );

  res.json(deliveries);
});

// Get available dispatches waiting for a delivery partner to accept
router.get('/available-dispatches', requireAuth, requireRole(['delivery_partner', 'admin']), (_req: AuthenticatedRequest, res: Response) => {
  const db = getDb();

  // Orders that are confirmed or packing and do not have an accepted delivery partner yet
  const available = db.orders.filter(
    (o) =>
      (o.status === 'confirmed' || o.status === 'packing') &&
      (!o.deliveryPartner || o.deliveryAssignmentStatus === 'offered' || o.deliveryAssignmentStatus === 'searching' || !o.deliveryAssignmentStatus)
  );

  res.json(available);
});

// Partner accepts delivery assignment offer (Atomic Claim)
router.post('/accept-order', requireAuth, requireRole(['delivery_partner']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { orderId } = req.body;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const partner = db.deliveryPartners.find((p) => p.id === user.deliveryPartnerId) || {
    id: user.deliveryPartnerId || 'dp-ravi-01',
    name: user.name,
    phone: user.phone,
    rating: 4.8,
    totalDeliveries: 350,
    vehicleType: 'Two Wheeler (Motorcycle)',
    vehicleNumber: 'KA-09-ER-4321',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentLat: 12.3375,
    currentLng: 76.5980,
  };

  // Atomic conflict check: prevent duplicate assignment claims
  if (order.deliveryPartner && order.deliveryPartner.id !== partner.id && order.deliveryAssignmentStatus === 'accepted') {
    res.status(409).json({ error: 'This delivery offer was already claimed by another delivery partner.' });
    return;
  }

  order.deliveryPartner = partner;
  order.deliveryAssignmentStatus = 'accepted';
  order.assignedPartnerId = partner.id;

  saveDb(db);

  realtimeHub.broadcast('delivery_assigned', {
    orderId,
    deliveryPartner: partner,
    order,
  });

  realtimeHub.broadcast('order_updated', {
    order,
    status: order.status,
    deliveryPartner: partner,
  });

  res.json({ success: true, order });
});

// Partner confirms pickup from store -> transitions to 'out_for_delivery'
router.post('/pickup-order', requireAuth, requireRole(['delivery_partner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { orderId } = req.body;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  order.status = 'out_for_delivery';

  // update timeline step
  const outStep = order.timeline.find((s) => s.status === 'out_for_delivery');
  if (outStep) {
    outStep.isCompleted = true;
    outStep.isCurrent = true;
    outStep.time = timeStr;
  }
  const packStep = order.timeline.find((s) => s.status === 'packing');
  if (packStep) {
    packStep.isCompleted = true;
    packStep.isCurrent = false;
  }

  saveDb(db);

  realtimeHub.broadcast('order_updated', {
    order,
    status: 'out_for_delivery',
    updatedBy: user.name,
    role: user.role,
  });

  res.json({ success: true, order });
});

// Partner declines delivery assignment offer
router.post('/reject-order', requireAuth, requireRole(['delivery_partner']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { orderId, reason } = req.body;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.deliveryPartner?.id === user.deliveryPartnerId) {
    order.deliveryPartner = undefined;
    order.deliveryAssignmentStatus = 'searching';
  }

  saveDb(db);

  realtimeHub.broadcast('order_updated', {
    order,
    status: order.status,
    note: `Delivery declined by partner (${reason || 'Unavailable'})`,
  });

  res.json({ success: true, message: 'Delivery offer declined.' });
});

// Update delivery partner GPS coordinates in real-time
router.post('/update-location', requireAuth, requireRole(['delivery_partner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { partnerId, lat, lng, orderId } = req.body;
  const db = getDb();

  const partner = db.deliveryPartners.find((p) => p.id === partnerId);
  if (partner) {
    partner.currentLat = Number(lat);
    partner.currentLng = Number(lng);
  }

  if (orderId) {
    const order = db.orders.find((o) => o.id === orderId);
    if (order && order.deliveryPartner) {
      order.deliveryPartner.currentLat = Number(lat);
      order.deliveryPartner.currentLng = Number(lng);
    }
  }

  saveDb(db);

  realtimeHub.broadcast('delivery_location_update', {
    partnerId,
    orderId,
    lat: Number(lat),
    lng: Number(lng),
  });

  res.json({ success: true, lat, lng });
});

// Verify OTP and complete delivery
router.post('/complete-delivery', requireAuth, requireRole(['delivery_partner', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderId, otp } = req.body;

  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.deliveryOtp !== String(otp).trim()) {
    res.status(400).json({ error: 'Invalid Delivery OTP. Ask the customer to read out the 4-digit OTP shown in their app.' });
    return;
  }

  order.status = 'delivered';
  order.paymentStatus = 'paid';

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  order.timeline.forEach((step) => {
    step.isCompleted = true;
    if (step.status === 'delivered') {
      step.isCurrent = true;
      step.time = timeStr;
    } else {
      step.isCurrent = false;
    }
  });

  // Increment delivery partner counter
  if (order.deliveryPartner) {
    const partner = db.deliveryPartners.find((p) => p.id === order.deliveryPartner?.id);
    if (partner) {
      partner.totalDeliveries += 1;
    }
  }

  saveDb(db);

  realtimeHub.broadcast('order_updated', {
    order,
    status: 'delivered',
  });

  res.json({ success: true, message: 'Delivery completed successfully with OTP verification.', order });
});

export default router;
