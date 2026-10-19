import { Order, Product, Store, DeliveryLocation } from '../types';

const TOKEN_KEY = 'grocerygo_token';
const USER_KEY = 'grocerygo_user';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'store_owner' | 'delivery_partner' | 'admin';
  phone: string;
  storeId?: string;
  deliveryPartnerId?: string;
  savedAddresses?: DeliveryLocation[];
}

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  getUser(): UserSession | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user: UserSession): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = authStorage.getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// 1. Auth API
export const authApi = {
  async register(body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'customer' | 'store_owner' | 'delivery_partner';
    storeId?: string;
  }): Promise<{ token: string; user: UserSession }> {
    const res = await request<{ token: string; user: UserSession }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async login(body: { email: string; password: string }): Promise<{
    token: string;
    user: UserSession;
    store?: Store | null;
  }> {
    const res = await request<{
      token: string;
      user: UserSession;
      store?: Store | null;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async getMe(): Promise<{ user: UserSession; store?: Store | null }> {
    const res = await request<{ user: UserSession; store?: Store | null }>('/api/auth/me');
    authStorage.setUser(res.user);
    return res;
  },

  async updateProfile(updates: Partial<UserSession>): Promise<{ user: UserSession }> {
    const res = await request<{ user: UserSession }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    authStorage.setUser(res.user);
    return res;
  },

  async getSeedAccounts(): Promise<any[]> {
    return request<any[]>('/api/auth/seed-accounts');
  },

  logout(): void {
    authStorage.clear();
  },
};

// 2. Stores API
export const storesApi = {
  async getAll(): Promise<Store[]> {
    return request<Store[]>('/api/stores');
  },

  async getById(storeId: string): Promise<Store> {
    return request<Store>(`/api/stores/${storeId}`);
  },

  async updateStore(storeId: string, updates: Partial<Store>): Promise<Store> {
    return request<Store>(`/api/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getProducts(storeId: string): Promise<any> {
    const list = await request<Product[]>(`/api/stores/${storeId}/products`);
    (list as any).products = list;
    return list;
  },

  async addProduct(storeId: string, product: Partial<Product> & { stockQuantity?: number }): Promise<Product> {
    return request<Product>(`/api/stores/${storeId}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(storeId: string, productId: string, updates: Partial<Product>): Promise<Product> {
    return request<Product>(`/api/stores/${storeId}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(storeId: string, productId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/stores/${storeId}/products/${productId}`, {
      method: 'DELETE',
    });
  },
};

// 3. Orders API
export const ordersApi = {
  async create(orderData: any): Promise<Order> {
    return request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getAll(): Promise<Order[]> {
    return request<Order[]>('/api/orders');
  },

  async getById(orderId: string): Promise<Order> {
    return request<Order>(`/api/orders/${orderId}`);
  },

  async getStoreOrders(storeId: string): Promise<any[]> {
    const orders = await this.getAll();
    return orders
      .filter((o) => o.store.id === storeId)
      .map((o: any) => ({
        ...o,
        customerName: o.customerName || (o.deliveryAddress?.name) || 'Customer',
        customerPhone: o.customerPhone || '+91 98765 43210',
        storeAcceptanceStatus: o.status === 'placed' ? 'awaiting_acceptance' : o.status,
        items: o.items.map((item: any) => ({
          name: item.product.name,
          quantity: item.product.quantity,
          unitPrice: item.product.price,
          count: item.quantity,
          image: item.product.image,
        })),
      }));
  },

  async acceptOrder(orderId: string): Promise<Order> {
    return this.updateStatus(orderId, 'confirmed');
  },

  async rejectOrder(orderId: string, reason?: string): Promise<Order> {
    return this.updateStatus(orderId, 'cancelled', { rejectionReason: reason });
  },

  async updateStatus(
    orderId: string,
    status: string,
    options?: { otp?: string; rejectionReason?: string }
  ): Promise<Order> {
    return request<Order>(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...options }),
    });
  },

  async assignDelivery(orderId: string, deliveryPartnerId: string): Promise<Order> {
    return request<Order>(`/api/orders/${orderId}/assign-delivery`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryPartnerId }),
    });
  },
};

// 4. Delivery Partner API
export const deliveryApi = {
  async getMyDeliveries(): Promise<Order[]> {
    return request<Order[]>('/api/delivery/my-deliveries');
  },

  async acceptOrder(orderId: string): Promise<{ success: boolean; order: Order }> {
    return request<{ success: boolean; order: Order }>('/api/delivery/accept-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  async updateLocation(partnerId: string, lat: number, lng: number, orderId?: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/delivery/update-location', {
      method: 'POST',
      body: JSON.stringify({ partnerId, lat, lng, orderId }),
    });
  },

  async completeDelivery(orderId: string, otp: string): Promise<{ success: boolean; order: Order; message: string }> {
    return request<{ success: boolean; order: Order; message: string }>('/api/delivery/complete-delivery', {
      method: 'POST',
      body: JSON.stringify({ orderId, otp }),
    });
  },
};

// 5. Admin API
export const adminApi = {
  async getOverview(): Promise<any> {
    return request<any>('/api/admin/overview');
  },

  async getConfig(): Promise<any> {
    return request<any>('/api/admin/config');
  },

  async updateConfig(config: any): Promise<any> {
    return request<any>('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  async getUsers(): Promise<UserSession[]> {
    return request<UserSession[]>('/api/admin/users');
  },

  async updateUser(userId: string, updates: { role?: string; storeId?: string }): Promise<UserSession> {
    return request<UserSession>(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getDisputes(): Promise<any[]> {
    return request<any[]>('/api/admin/disputes');
  },

  async updateDispute(disputeId: string, updates: { status: string; resolutionNotes?: string }): Promise<any> {
    return request<any>(`/api/admin/disputes/${disputeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// 6. Payment API
export const paymentApi = {
  async verifyPayment(details: { method: string; amount: number; upiId?: string; cardLast4?: string }): Promise<any> {
    return request<any>('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  },
};

// 7. Realtime Client via SSE
type RealtimeCallback = (event: { type: string; payload: any; timestamp: string }) => void;

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<RealtimeCallback> = new Set();
  private reconnectTimer: any = null;

  public connect(): void {
    if (this.eventSource) return;

    try {
      this.eventSource = new EventSource('/api/realtime/stream');

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((callback) => callback(data));
        } catch (e) {
          // ignore non-json
        }
      };

      this.eventSource.onerror = () => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Attempt reconnect after 3 seconds
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 3000);
      };
    } catch (e) {
      console.warn('Realtime SSE not available in this environment, falling back to local state:', e);
    }
  }

  public subscribe(callback: RealtimeCallback): () => void {
    this.listeners.add(callback);
    this.connect();

    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const realtimeClient = new RealtimeClient();

export function subscribeToRealtime(callback: (event: any) => void, _options?: any): () => void {
  return realtimeClient.subscribe(callback);
}

export interface OrderModel {
  id: string;
  orderNumber: string;
  storeId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    locality?: string;
    streetAddress: string;
    [key: string]: any;
  };
  items: Array<{
    name: string;
    quantity: string;
    unitPrice: number;
    count: number;
    image?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  storeAcceptanceStatus?: string;
  status?: string;
  [key: string]: any;
}

