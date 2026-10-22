export interface Category {
  id: string;
  name: string;
  itemCount?: string;
  image: string;
  bgColor?: string;
  description?: string;
}

export type StoreType = 'Supermarket' | 'Local Kirana Store';

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  rating: number;
  reviews: string;
  distance: string;
  distanceKm: number;
  deliveryTime: string;
  minDeliveryMins: number;
  isOpen: boolean;
  image: string;
  coverImage?: string;
  address?: string;
  closingTime?: string;
  minOrder?: string;
  deliveryFee?: string;
  deliveryArea?: string;
  hours?: string;
  lat?: number;
  lng?: number;
  maxDeliveryRadiusKm?: number;
  pincode?: string;
  locality?: string;
  district?: string;
  state?: string;
}

export interface NearbyLocality {
  name: string;
  type: 'village' | 'town' | 'locality' | 'suburb' | 'neighborhood';
  district?: string;
  state?: string;
  pincode?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  registeredStoresCount: number;
}

export interface RemoteAreaRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  locality?: string;
  district?: string;
  state?: string;
  pincode?: string;
  lat: number;
  lng: number;
  distanceToNearestStoreKm?: number;
  nearestStoreName?: string;
  notes?: string;
  status: 'pending' | 'reviewed' | 'service_expanded' | 'rejected';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: string;
  price: number;
  originalPrice: number;
  image: string;
  storeId?: string;
  storeName?: string;
  storeType?: StoreType;
  rating?: number;
  brand?: string;
  distance?: string;
  deliveryTime?: string;
  isExpressDelivery?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortOption =
  | 'Popularity'
  | 'Price: Low to High'
  | 'Price: High to Low'
  | 'Discount'
  | 'Name: A to Z';

export interface FilterState {
  storeTypes: string[]; // ['All Stores'] or ['Supermarkets', 'Local Kirana Stores', 'Express Delivery']
  priceRanges: string[]; // ['under-50', '50-100', '100-200', 'above-200']
  brands: string[];
  discounts: number[]; // [10, 20, 30, 50]
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface DeliveryLocation {
  id: string;
  name: string;
  address: string;
  landmark?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  estimatedMins: number;
  isRemote: boolean;
  localityType: 'hyperlocal' | 'suburb' | 'remote_village' | 'rural_outskirt';
  deliveryFee: number;
  areaTag: string;
}

export interface DeliveryPartner {
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
}

export interface OrderTimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  time: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  store: Store;
  items: CartItem[];
  subtotal: number;
  packingFee: number;
  deliveryFee: number;
  remoteAreaSurcharge?: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cod' | 'refund_pending' | 'refunded';
  createdAt: string;
  status: OrderStatus;
  estimatedDeliveryTime: string;
  deliveryOtp: string;
  deliveryAddress: DeliveryLocation;
  deliveryPartner?: DeliveryPartner;
  timeline: OrderTimelineStep[];
  deliveryInstructions?: string;
  storeAcceptanceStatus?: 'awaiting_acceptance' | 'accepted' | 'rejected';
  rejectionReason?: string;
  storeAcceptedAt?: string;
  deliveryAssignmentStatus?: 'unassigned' | 'searching' | 'offered' | 'accepted' | 'rejected' | 'assigned' | 'completed' | 'failed';
  assignedPartnerId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  roadDistanceKm?: number;
  roadDurationMins?: number;
  fulfillmentStatus?: 'awaiting_preparation' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered';
  packedAt?: string;
  packedBy?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface ServiceAreaConfig {
  hyperlocalMaxKm: number; // default 5 km
  suburbMaxKm: number; // default 12 km
  remoteMaxKm: number; // default 30 km (configurable!)
  baseRemoteFeePerKm: number; // e.g. ₹3/km beyond 5 km
  allowRemoteDelivery: boolean;
}
