import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../auth.js';
import { realtimeHub } from '../realtime.js';

const router = Router();

// Only admin can access these routes
router.use(requireAuth, requireRole(['admin']));

// Platform overview statistics
router.get('/overview', (_req: AuthenticatedRequest, res: Response) => {
  const db = getDb();

  const totalOrders = db.orders.length;
  const deliveredOrders = db.orders.filter((o) => o.status === 'delivered');
  const totalRevenue = db.orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalStores = db.stores.length;
  const totalPartners = db.deliveryPartners.length;
  const totalCustomers = db.users.filter((u) => u.role === 'customer').length;
  const activeDisputes = db.disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length;

  res.json({
    totalOrders,
    deliveredOrders: deliveredOrders.length,
    totalRevenue,
    totalStores,
    totalPartners,
    totalCustomers,
    activeDisputes,
    config: db.config,
  });
});

// Get current platform service area & remote delivery configuration
router.get('/config', (_req: AuthenticatedRequest, res: Response) => {
  const db = getDb();
  res.json(db.config);
});

// Update platform configuration (remote delivery radius, fees, commission, etc.)
router.put('/config', (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body;
  const db = getDb();

  db.config = {
    ...db.config,
    ...updates,
  };

  saveDb(db);

  realtimeHub.broadcast('platform_config_updated', {
    config: db.config,
  });

  res.json(db.config);
});

// Get users list
router.get('/users', (_req: AuthenticatedRequest, res: Response) => {
  const db = getDb();
  const safeUsers = db.users.map(({ passwordHash: _, ...user }) => user);
  res.json(safeUsers);
});

// Update user role or store assignment
router.patch('/users/:userId', (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { role, storeId } = req.body;

  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (role) db.users[idx].role = role;
  if (storeId !== undefined) db.users[idx].storeId = storeId;

  saveDb(db);
  const { passwordHash: _, ...safeUser } = db.users[idx];
  res.json(safeUser);
});

// Get disputes
router.get('/disputes', (_req: AuthenticatedRequest, res: Response) => {
  const db = getDb();
  res.json(db.disputes);
});

// Update / Resolve dispute
router.patch('/disputes/:disputeId', (req: AuthenticatedRequest, res: Response) => {
  const { disputeId } = req.params;
  const { status, resolutionNotes } = req.body;

  const db = getDb();
  const idx = db.disputes.findIndex((d) => d.id === disputeId);
  if (idx === -1) {
    res.status(404).json({ error: 'Dispute record not found' });
    return;
  }

  if (status) db.disputes[idx].status = status;
  if (resolutionNotes) db.disputes[idx].resolutionNotes = resolutionNotes;

  saveDb(db);
  res.json(db.disputes[idx]);
});

export default router;
