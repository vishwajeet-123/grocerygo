import fs from 'fs';
import path from 'path';
import { STORES } from '../data/stores.js';
import { PRODUCTS } from '../data/products.js';
import { INITIAL_ORDERS, DEFAULT_SERVICE_AREA_CONFIG, MYSURU_LOCALITIES } from '../data/orders.js';
import { Store, Product, Order, DeliveryPartner, ServiceAreaConfig, DeliveryLocation, RemoteAreaRequest } from '../types.js';

export type UserRole = 'customer' | 'store_owner' | 'delivery_partner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain/SHA for demo authentication
  role: UserRole;
  phone: string;
  storeId?: string; // Assigned store for store owner
  deliveryPartnerId?: string; // Delivery partner profile ID
  savedAddresses?: DeliveryLocation[];
  createdAt: string;
}

export interface PlatformConfig extends ServiceAreaConfig {
  platformCommissionRate: number; // e.g. 5%
  surgePricingMultiplier: number;
  isPlatformOpen: boolean;
  announcement?: string;
}

export interface DisputeRecord {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  reason: string;
  amount: number;
  status: 'open' | 'investigating' | 'resolved' | 'refunded' | 'rejected';
  resolutionNotes?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  stores: Store[];
  products: Product[];
  orders: Order[];
  deliveryPartners: DeliveryPartner[];
  config: PlatformConfig;
  disputes: DisputeRecord[];
  remoteAreaRequests: RemoteAreaRequest[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'grocerygo-db.json');

// In-memory cache
let dbState: DatabaseSchema | null = null;

function getInitialDatabase(): DatabaseSchema {
  // Ensure every product has stockQuantity
  const productsWithStock = PRODUCTS.map((p, idx) => ({
    ...p,
    stockQuantity: (p as any).stockQuantity ?? (20 + (idx % 15) * 5),
    inStock: (p as any).stockQuantity !== 0,
  }));

  // Initial seed users for all 4 roles
  const seedUsers: User[] = [
    {
      id: 'usr-customer-1',
      name: 'Vishwajeet Waghmare',
      email: 'customer@grocerygo.in',
      passwordHash: 'Customer@123',
      role: 'customer',
      phone: '+91 98765 43210',
      savedAddresses: MYSURU_LOCALITIES.slice(0, 3),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-owner-shree-lakshmi',
      name: 'Ramesh Kumar',
      email: 'owner@kirana.in',
      passwordHash: 'Owner@123',
      role: 'store_owner',
      phone: '+91 94481 23456',
      storeId: 'shree-lakshmi-kirana',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-owner-more-fresh',
      name: 'Suresh Patel',
      email: 'owner@morefresh.in',
      passwordHash: 'Owner@123',
      role: 'store_owner',
      phone: '+91 94482 98765',
      storeId: 'more-fresh-supermarket',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-delivery-ravi',
      name: 'Ravi Kumar',
      email: 'delivery@grocerygo.in',
      passwordHash: 'Delivery@123',
      role: 'delivery_partner',
      phone: '+91 98765 12345',
      deliveryPartnerId: 'dp-ravi-01',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-admin-vishwajeet',
      name: 'Vishwajeet (Super Admin)',
      email: 'admin@grocerygo.in',
      passwordHash: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 00001',
      createdAt: new Date().toISOString(),
    },
  ];

  const seedDeliveryPartners: DeliveryPartner[] = [
    {
      id: 'dp-ravi-01',
      name: 'Ravi Kumar',
      phone: '+91 98765 12345',
      rating: 4.8,
      totalDeliveries: 342,
      vehicleType: 'Honda Activa 6G (KA-09-ER-4321)',
      vehicleNumber: 'KA-09-ER-4321',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currentLat: 12.3385,
      currentLng: 76.5992,
    },
    {
      id: 'dp-suresh-02',
      name: 'Suresh Gowda',
      phone: '+91 98765 67890',
      rating: 4.9,
      totalDeliveries: 512,
      vehicleType: 'Hero Splendor Plus (KA-09-MK-7821)',
      vehicleNumber: 'KA-09-MK-7821',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      currentLat: 12.3340,
      currentLng: 76.5920,
    },
    {
      id: 'dp-manjunath-03',
      name: 'Manjunath Swamy',
      phone: '+91 98765 89012',
      rating: 4.7,
      totalDeliveries: 189,
      vehicleType: 'Bajaj Pulsar 150 (KA-09-HG-1102)',
      vehicleNumber: 'KA-09-HG-1102',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      currentLat: 12.3250,
      currentLng: 76.5780,
    },
  ];

  const seedDisputes: DisputeRecord[] = [
    {
      id: 'disp-101',
      orderId: 'ord-8490',
      customerId: 'usr-customer-1',
      customerName: 'Ananya Sharma',
      storeId: 'shree-lakshmi-kirana',
      storeName: 'Shree Lakshmi Kirana',
      reason: '1 kg Onion had 2 spoiled pieces upon arrival',
      amount: 32,
      status: 'resolved',
      resolutionNotes: 'Store owner approved instant credit of ₹32 to customer wallet.',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    },
  ];

  const seedRemoteRequests: RemoteAreaRequest[] = [
    {
      id: 'req-remote-01',
      customerName: 'Anil Gowda',
      customerPhone: '+91 94481 99881',
      address: 'Main Road, Bilikere Village, Hunsur Taluk - 571103',
      locality: 'Bilikere Village',
      district: 'Mysuru',
      state: 'Karnataka',
      pincode: '571103',
      lat: 12.3510,
      lng: 76.4320,
      distanceToNearestStoreKm: 18.4,
      nearestStoreName: 'Reliance Smart',
      notes: 'Requesting weekend delivery of fresh vegetables and cooking essentials for farmer families.',
      status: 'pending',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },
    {
      id: 'req-remote-02',
      customerName: 'Pooja Hegde',
      customerPhone: '+91 98862 33445',
      address: 'Grama Panchayath Road, Bannur Rural - 571101',
      locality: 'Bannur Rural',
      district: 'Mysuru',
      state: 'Karnataka',
      pincode: '571101',
      lat: 12.3320,
      lng: 76.8610,
      distanceToNearestStoreKm: 27.5,
      nearestStoreName: 'D-Mart',
      notes: 'No quick grocery delivery available here. 40+ households ready to order daily essentials.',
      status: 'reviewed',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  return {
    users: seedUsers,
    stores: STORES,
    products: productsWithStock,
    orders: INITIAL_ORDERS,
    deliveryPartners: seedDeliveryPartners,
    config: {
      ...DEFAULT_SERVICE_AREA_CONFIG,
      platformCommissionRate: 5,
      surgePricingMultiplier: 1.0,
      isPlatformOpen: true,
      announcement: 'Serving all neighborhoods and remote rural hamlets across Mysuru district with standard & express delivery.',
    },
    disputes: seedDisputes,
    remoteAreaRequests: seedRemoteRequests,
  };
}

export function getDb(): DatabaseSchema {
  if (dbState) return dbState;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbState = JSON.parse(content);
      // Migration helpers
      if (!dbState!.remoteAreaRequests) {
        dbState!.remoteAreaRequests = [];
      }
      // Ensure all stores have coordinates and latest regional stores
      if (dbState!.stores) {
        dbState!.stores = STORES.map((updatedStore) => {
          const existing = dbState!.stores.find((s) => s.id === updatedStore.id);
          return existing ? { ...updatedStore, ...existing, lat: updatedStore.lat, lng: updatedStore.lng, maxDeliveryRadiusKm: updatedStore.maxDeliveryRadiusKm } : updatedStore;
        });
      }
      return dbState!;
    } catch (err) {
      console.error('Error reading db file, regenerating fresh database:', err);
    }
  }

  dbState = getInitialDatabase();
  saveDb(dbState);
  return dbState;
}

export function saveDb(data?: DatabaseSchema): void {
  if (data) dbState = data;
  if (!dbState) return;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Atomic write via temp file
  const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(dbState, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}
