import { Router, Response } from 'express';
import { getDb, saveDb, User, UserRole } from '../db.js';
import { createToken, AuthenticatedRequest, requireAuth } from '../auth.js';

const router = Router();

// Register new user (customer, store_owner, delivery_partner)
// Note: admin role is strictly protected and cannot be registered via public signup
router.post('/register', (req, res: Response) => {
  const { name, email, password, phone, role = 'customer', storeId } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  if (role === 'admin') {
    res.status(403).json({ error: 'Admin role cannot be self-assigned during registration.' });
    return;
  }

  const db = getDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: password, // In production this would use bcrypt
    role: role as UserRole,
    phone: phone || '+91 90000 00000',
    storeId: role === 'store_owner' ? (storeId || 'shree-lakshmi-kirana') : undefined,
    deliveryPartnerId: role === 'delivery_partner' ? `dp-${Date.now()}` : undefined,
    savedAddresses: role === 'customer' ? [] : undefined,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const token = createToken(newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({ token, user: safeUser });
});

// Login
router.post('/login', (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const db = getDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password. Please try again.' });
    return;
  }

  const token = createToken(user);
  const { passwordHash: _, ...safeUser } = user;

  // Include attached store info if store owner
  let store = null;
  if (user.role === 'store_owner' && user.storeId) {
    store = db.stores.find((s) => s.id === user.storeId) || null;
  }

  // Include attached delivery partner info if delivery partner
  let deliveryPartner = null;
  if (user.role === 'delivery_partner' && user.deliveryPartnerId) {
    deliveryPartner = db.deliveryPartners.find((dp) => dp.id === user.deliveryPartnerId) || null;
  }

  res.json({ token, user: safeUser, store, deliveryPartner });
});

// Get Current User Profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = getDb();
  const { passwordHash: _, ...safeUser } = user;

  let store = null;
  if (user.role === 'store_owner' && user.storeId) {
    store = db.stores.find((s) => s.id === user.storeId) || null;
  }

  let deliveryPartner = null;
  if (user.role === 'delivery_partner' && user.deliveryPartnerId) {
    deliveryPartner = db.deliveryPartners.find((dp) => dp.id === user.deliveryPartnerId) || null;
  }

  res.json({ user: safeUser, store, deliveryPartner });
});

// Update Profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, phone, savedAddresses } = req.body;

  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === user.id);
  if (idx === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (name) db.users[idx].name = name;
  if (phone) db.users[idx].phone = phone;
  if (savedAddresses) db.users[idx].savedAddresses = savedAddresses;

  saveDb(db);
  const { passwordHash: _, ...safeUser } = db.users[idx];
  res.json({ user: safeUser });
});

// Seed demo accounts for quick one-click switcher
router.get('/seed-accounts', (_req, res: Response) => {
  res.json([
    {
      role: 'customer',
      label: 'Customer (Vishwajeet)',
      email: 'customer@grocerygo.in',
      password: 'Customer@123',
      description: 'Places orders from Kirana & Supermarkets with live tracking',
    },
    {
      role: 'store_owner',
      label: 'Store Owner (Ramesh - Shree Lakshmi Kirana)',
      email: 'owner@kirana.in',
      password: 'Owner@123',
      description: 'Manages Shree Lakshmi Kirana stock, prices & incoming orders',
    },
    {
      role: 'store_owner',
      label: 'Store Owner (Suresh - More Fresh Supermarket)',
      email: 'owner@morefresh.in',
      password: 'Owner@123',
      description: 'Manages More Fresh Supermarket catalog & inventory',
    },
    {
      role: 'delivery_partner',
      label: 'Delivery Partner (Ravi Kumar)',
      email: 'delivery@grocerygo.in',
      password: 'Delivery@123',
      description: 'Accepts deliveries, updates GPS, enters delivery OTP',
    },
    {
      role: 'admin',
      label: 'Platform Admin (Vishwajeet)',
      email: 'admin@grocerygo.in',
      password: 'Admin@123',
      description: 'Configures remote delivery radius, fees, disputes & stores',
    },
  ]);
});

export default router;
