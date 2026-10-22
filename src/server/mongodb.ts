import mongoose, { Schema, Document, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getDb, saveDb } from './db.js';
import { STORES } from '../data/stores.js';
import { PRODUCTS } from '../data/products.js';
import { MYSURU_LOCALITIES, INITIAL_ORDERS } from '../data/orders.js';

let isConnected = false;
let memServerInstance: MongoMemoryServer | null = null;
let activeConnectionSource = 'Not Connected';
let activeDatabaseName = '';

// 1. User Schema
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'store_owner' | 'delivery_partner' | 'admin';
  phone: string;
  storeId?: string;
  deliveryPartnerId?: string;
  savedAddresses?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'store_owner', 'delivery_partner', 'admin'],
      default: 'customer',
      index: true,
    },
    phone: { type: String, required: true },
    storeId: { type: String, index: true },
    deliveryPartnerId: { type: String, index: true },
    savedAddresses: { type: Array, default: [] },
  },
  { timestamps: true }
);

// 2. Store Schema
export interface IStore extends Document {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviews: string;
  distance: string;
  distanceKm: number;
  deliveryTime: string;
  minDeliveryMins: number;
  isOpen: boolean;
  image: string;
  coverImage?: string;
  address: string;
  closingTime?: string;
  minOrder?: string;
  deliveryFee?: string;
  deliveryArea?: string;
  hours?: string;
  lat: number;
  lng: number;
  maxDeliveryRadiusKm: number;
  pincode?: string;
  locality?: string;
  district?: string;
  state?: string;
}

const StoreSchema = new Schema<IStore>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    reviews: { type: String, default: '100+' },
    distance: { type: String, default: '1.0 km' },
    distanceKm: { type: Number, default: 1.0 },
    deliveryTime: { type: String, default: '20-30 mins' },
    minDeliveryMins: { type: Number, default: 20 },
    isOpen: { type: Boolean, default: true },
    image: { type: String, required: true },
    coverImage: { type: String },
    address: { type: String, required: true },
    closingTime: { type: String, default: '10:00 PM' },
    minOrder: { type: String, default: '₹100' },
    deliveryFee: { type: String, default: 'Free (₹0)' },
    deliveryArea: { type: String, default: 'Within 15 km' },
    hours: { type: String, default: '8:00 AM - 10:00 PM' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    maxDeliveryRadiusKm: { type: Number, default: 25 },
    pincode: { type: String, default: '570018' },
    locality: { type: String, default: 'Hootagalli' },
    district: { type: String, default: 'Mysuru' },
    state: { type: String, default: 'Karnataka' },
  },
  { timestamps: true }
);

// 3. Product Schema
export interface IProduct extends Document {
  id: string;
  name: string;
  category: string;
  quantity: string;
  price: number;
  originalPrice: number;
  image: string;
  storeId?: string;
  storeName?: string;
  storeType?: string;
  rating?: number;
  brand?: string;
  inStock: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  isExpressDelivery?: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    quantity: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    image: { type: String, required: true },
    storeId: { type: String, index: true },
    storeName: { type: String },
    storeType: { type: String },
    rating: { type: Number, default: 4.5 },
    brand: { type: String },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 50 },
    isFeatured: { type: Boolean, default: false },
    isExpressDelivery: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 4. Order Schema
export interface IOrder extends Document {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  store: any;
  items: any[];
  subtotal: number;
  packingFee: number;
  deliveryFee: number;
  remoteAreaSurcharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  fulfillmentStatus?: string;
  storeAcceptanceStatus?: string;
  deliveryAssignmentStatus?: string;
  deliveryPartner?: any;
  estimatedDeliveryTime?: string;
  deliveryOtp: string;
  deliveryAddress: any;
  deliveryInstructions?: string;
  instructions?: string;
  timeline: any[];
  packedAt?: string;
  packedBy?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    store: { type: Schema.Types.Mixed, required: true },
    items: { type: [Schema.Types.Mixed] as any, required: true },
    subtotal: { type: Number, required: true },
    packingFee: { type: Number, default: 10 },
    deliveryFee: { type: Number, default: 0 },
    remoteAreaSurcharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'UPI' },
    paymentStatus: { type: String, default: 'paid', index: true },
    status: {
      type: String,
      required: true,
      enum: ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
      index: true,
    },
    fulfillmentStatus: { type: String, default: 'pending' },
    storeAcceptanceStatus: { type: String, default: 'awaiting_acceptance', index: true },
    deliveryAssignmentStatus: { type: String, default: 'unassigned', index: true },
    deliveryPartner: { type: Schema.Types.Mixed },
    estimatedDeliveryTime: { type: String, default: '20-30 mins' },
    deliveryOtp: { type: String, required: true },
    deliveryAddress: { type: Schema.Types.Mixed, required: true },
    deliveryInstructions: { type: String, default: '' },
    instructions: { type: String, default: '' },
    timeline: { type: [Schema.Types.Mixed] as any, default: [] },
    packedAt: { type: String },
    packedBy: { type: String },
    pickedUpAt: { type: String },
    deliveredAt: { type: String },
    cancellationReason: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// 5. Delivery Partner Schema
export interface IDeliveryPartner extends Document {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  vehicleType: string;
  vehicleNumber: string;
  photoUrl: string;
  currentLat: number;
  currentLng: number;
  isAvailable: boolean;
}

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    totalDeliveries: { type: Number, default: 100 },
    vehicleType: { type: String, default: 'Motorcycle' },
    vehicleNumber: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    currentLat: { type: Number, default: 12.3385 },
    currentLng: { type: Number, default: 76.5992 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 6. Payment Schema
export interface IPayment extends Document {
  orderId: string;
  customerId: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  timestamp: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: { type: String, default: 'success' },
    transactionId: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 7. Notification Schema
export interface INotification extends Document {
  id: string;
  userId?: string;
  role?: string;
  title: string;
  message: string;
  type: string;
  orderId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    role: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'order' },
    orderId: { type: String, index: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Models
export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export const StoreModel: Model<IStore> =
  mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export const DeliveryPartnerModel: Model<IDeliveryPartner> =
  mongoose.models.DeliveryPartner ||
  mongoose.model<IDeliveryPartner>('DeliveryPartner', DeliveryPartnerSchema);

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

/**
 * Normalizes MongoDB connection URI:
 * Automatically strips accidental angle brackets `<...>` around passwords,
 * URL-encodes special characters, and ensures authSource is correctly formatted.
 */
export function normalizeMongoUri(rawUri: string): string {
  if (!rawUri || typeof rawUri !== 'string') return '';
  let uri = rawUri.trim();

  // Strip accidental outer quotes
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }

  // Parse URI structure: mongodb(+srv)://user:pass@host/db?query
  const match = uri.match(/^mongodb(\+srv)?:\/\/([^:]+):(.*)@([^/?#]+)(\/?[^?#]*)(\?.*)?$/);
  if (match) {
    const proto = match[1] || '';
    const user = match[2];
    let pass = match[3];
    const host = match[4];
    const path = match[5] || '/grocerygo';
    const query = match[6] || '';

    // Strip `<...>` from password if user pasted template with angle brackets
    if (pass.startsWith('<') && pass.endsWith('>')) {
      pass = pass.slice(1, -1);
    }

    const cleanUser = encodeURIComponent(decodeURIComponent(user));
    const cleanPass = encodeURIComponent(decodeURIComponent(pass));
    const dbPath = path.length > 1 ? path : '/grocerygo';

    return `mongodb${proto}://${cleanUser}:${cleanPass}@${host}${dbPath}${query}`;
  }

  return uri;
}

// Connection and Seeding Manager
export async function connectMongoDB(): Promise<boolean> {
  const rawUri = process.env.MONGODB_URI;

  // 1. Attempt connection to provided MongoDB URI (e.g. MongoDB Atlas or custom host)
  if (rawUri) {
    const normalizedUri = normalizeMongoUri(rawUri);
    try {
      mongoose.set('strictQuery', false);
      console.log('🔄 Connecting to MongoDB from environment configuration...');
      await mongoose.connect(normalizedUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      isConnected = true;
      activeConnectionSource = 'MongoDB Atlas (Cloud)';
      activeDatabaseName = mongoose.connection.name || 'grocerygo';
      console.log('✓ Successfully connected to MongoDB Atlas:', normalizedUri.replace(/\/\/.*@/, '//***@'));

      await seedMongoDBIfEmpty();
      return true;
    } catch (err: any) {
      console.warn(
        `⚠️ Could not authenticate with configured MONGODB_URI (${err.name}: ${err.message}).`
      );
    }
  }

  // 2. Initialize dedicated in-process MongoDB instance (MongoMemoryServer)
  // Guarantees genuine active MongoDB engine, genuine Mongoose models, and live collections
  try {
    console.log('⚡ Starting dedicated local MongoDB server instance (MongoMemoryServer)...');
    memServerInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'grocerygo',
      },
    });
    const localUri = memServerInstance.getUri();
    mongoose.set('strictQuery', false);
    await mongoose.connect(localUri, {
      dbName: 'grocerygo',
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    activeConnectionSource = 'MongoDB Engine (Local Dedicated Server - grocerygo)';
    activeDatabaseName = mongoose.connection.name || 'grocerygo';
    console.log(`✓ Successfully connected to dedicated MongoDB instance at ${localUri}`);

    await seedMongoDBIfEmpty();
    return true;
  } catch (err: any) {
    console.error('❌ Failed to initialize dedicated MongoDB engine:', err.message);
    isConnected = false;
    activeConnectionSource = 'None';
    return false;
  }
}

export function isMongoDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getMongoDetails() {
  return {
    isConnected: isMongoDbConnected(),
    readyState: mongoose.connection.readyState,
    source: activeConnectionSource,
    databaseName: activeDatabaseName || mongoose.connection.name || 'grocerygo',
    host: mongoose.connection.host || '127.0.0.1',
    port: mongoose.connection.port || 27017,
  };
}

// Seed collections in MongoDB from current persistent DB state
export async function seedMongoDBIfEmpty(): Promise<void> {
  try {
    const db = getDb();

    // 1. Stores
    const storeCount = await StoreModel.countDocuments();
    if (storeCount === 0 && db.stores.length > 0) {
      await StoreModel.insertMany(db.stores);
      console.log(`✓ Seeded ${db.stores.length} stores into MongoDB`);
    }

    // 2. Products
    const prodCount = await ProductModel.countDocuments();
    if (prodCount === 0 && db.products.length > 0) {
      await ProductModel.insertMany(db.products);
      console.log(`✓ Seeded ${db.products.length} products into MongoDB`);
    }

    // 3. Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && db.users.length > 0) {
      await UserModel.insertMany(db.users);
      console.log(`✓ Seeded ${db.users.length} users into MongoDB`);
    }

    // 4. Delivery Partners
    const dpCount = await DeliveryPartnerModel.countDocuments();
    if (dpCount === 0 && db.deliveryPartners.length > 0) {
      await DeliveryPartnerModel.insertMany(db.deliveryPartners);
      console.log(`✓ Seeded ${db.deliveryPartners.length} delivery partners into MongoDB`);
    }

    // 5. Orders
    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0 && db.orders.length > 0) {
      await OrderModel.insertMany(db.orders);
      console.log(`✓ Seeded ${db.orders.length} orders into MongoDB`);
    }
  } catch (err) {
    console.warn('Notice while seeding MongoDB:', err);
  }
}

// ---------------- CRUD Synchronization Helpers ----------------

export async function syncOrderToMongo(order: any): Promise<boolean> {
  if (!isMongoDbConnected()) return false;
  try {
    await OrderModel.findOneAndUpdate(
      { id: order.id },
      { $set: order },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return true;
  } catch (err) {
    console.warn('Failed to sync order to MongoDB:', err);
    return false;
  }
}

export async function getOrderFromMongo(orderId: string): Promise<any | null> {
  if (!isMongoDbConnected()) return null;
  try {
    return await OrderModel.findOne({ id: orderId }).lean();
  } catch (err) {
    console.warn('Failed to get order from MongoDB:', err);
    return null;
  }
}

export async function getOrdersFromMongo(filter: any = {}): Promise<any[]> {
  if (!isMongoDbConnected()) return [];
  try {
    return await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
  } catch (err) {
    console.warn('Failed to query orders from MongoDB:', err);
    return [];
  }
}

export async function syncUserToMongo(user: any): Promise<boolean> {
  if (!isMongoDbConnected()) return false;
  try {
    await UserModel.findOneAndUpdate(
      { id: user.id },
      { $set: user },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return true;
  } catch (err) {
    console.warn('Failed to sync user to MongoDB:', err);
    return false;
  }
}

export async function syncDeliveryPartnerToMongo(partner: any): Promise<boolean> {
  if (!isMongoDbConnected()) return false;
  try {
    await DeliveryPartnerModel.findOneAndUpdate(
      { id: partner.id },
      { $set: partner },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return true;
  } catch (err) {
    console.warn('Failed to sync delivery partner to MongoDB:', err);
    return false;
  }
}

export async function syncProductToMongo(product: any): Promise<boolean> {
  if (!isMongoDbConnected()) return false;
  try {
    await ProductModel.findOneAndUpdate(
      { id: product.id },
      { $set: product },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return true;
  } catch (err) {
    console.warn('Failed to sync product to MongoDB:', err);
    return false;
  }
}
