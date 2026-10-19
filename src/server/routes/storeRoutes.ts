import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireStoreAccess } from '../auth.js';
import { realtimeHub } from '../realtime.js';
import { Product } from '../../types.js';

const router = Router();

// Get all stores
router.get('/', (_req, res: Response) => {
  const db = getDb();
  res.json(db.stores);
});

// Get store by ID
router.get('/:storeId', (req, res: Response) => {
  const { storeId } = req.params;
  const db = getDb();
  const store = db.stores.find((s) => s.id === storeId);
  if (!store) {
    res.status(404).json({ error: 'Store not found' });
    return;
  }
  res.json(store);
});

// Update store details (hours, status open/closed, minOrder, etc.)
router.put('/:storeId', requireAuth, requireStoreAccess, (req: AuthenticatedRequest, res: Response) => {
  const { storeId } = req.params;
  const updates = req.body;

  const db = getDb();
  const idx = db.stores.findIndex((s) => s.id === storeId);
  if (idx === -1) {
    res.status(404).json({ error: 'Store not found' });
    return;
  }

  db.stores[idx] = {
    ...db.stores[idx],
    ...updates,
    id: storeId, // prevent changing store ID
  };

  saveDb(db);

  realtimeHub.broadcast('announcement', {
    storeId,
    storeName: db.stores[idx].name,
    isOpen: db.stores[idx].isOpen,
    message: `Store ${db.stores[idx].name} updated its status.`,
  });

  res.json(db.stores[idx]);
});

// Get products for a specific store
router.get('/:storeId/products', (req, res: Response) => {
  const { storeId } = req.params;
  const db = getDb();
  const products = db.products.filter((p) => p.storeId === storeId);
  res.json(products);
});

// Add new product to store catalog
router.post('/:storeId/products', requireAuth, requireStoreAccess, (req: AuthenticatedRequest, res: Response) => {
  const { storeId } = req.params;
  const { name, category, quantity, price, originalPrice, image, stockQuantity = 20, brand } = req.body;

  if (!name || !price || !category) {
    res.status(400).json({ error: 'Product name, category, and price are required' });
    return;
  }

  const db = getDb();
  const store = db.stores.find((s) => s.id === storeId);
  if (!store) {
    res.status(404).json({ error: 'Store not found' });
    return;
  }

  const newProduct: Product & { stockQuantity: number } = {
    id: `prod-${Date.now()}`,
    name,
    category,
    quantity: quantity || '1 unit',
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    storeId,
    storeName: store.name,
    storeType: store.type,
    brand: brand || store.name,
    stockQuantity: Number(stockQuantity),
    inStock: Number(stockQuantity) > 0,
    isFeatured: false,
    rating: 4.5,
  };

  db.products.push(newProduct as any);
  saveDb(db);

  realtimeHub.broadcast('inventory_updated', {
    storeId,
    action: 'add',
    product: newProduct,
  });

  res.status(201).json(newProduct);
});

// Update product in store (price, stock, inStock status)
router.put('/:storeId/products/:productId', requireAuth, requireStoreAccess, (req: AuthenticatedRequest, res: Response) => {
  const { storeId, productId } = req.params;
  const updates = req.body;

  const db = getDb();
  const idx = db.products.findIndex((p) => p.id === productId && p.storeId === storeId);
  if (idx === -1) {
    res.status(404).json({ error: 'Product not found in this store' });
    return;
  }

  const current = db.products[idx] as any;
  const updatedProduct = {
    ...current,
    ...updates,
    id: productId,
    storeId,
  };

  if (updates.stockQuantity !== undefined) {
    updatedProduct.stockQuantity = Number(updates.stockQuantity);
    updatedProduct.inStock = updatedProduct.stockQuantity > 0;
  }

  db.products[idx] = updatedProduct;
  saveDb(db);

  realtimeHub.broadcast('inventory_updated', {
    storeId,
    action: 'update',
    product: updatedProduct,
  });

  res.json(updatedProduct);
});

// Delete product
router.delete('/:storeId/products/:productId', requireAuth, requireStoreAccess, (req: AuthenticatedRequest, res: Response) => {
  const { storeId, productId } = req.params;
  const db = getDb();
  const idx = db.products.findIndex((p) => p.id === productId && p.storeId === storeId);
  if (idx === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const [removed] = db.products.splice(idx, 1);
  saveDb(db);

  realtimeHub.broadcast('inventory_updated', {
    storeId,
    action: 'delete',
    productId,
  });

  res.json({ success: true, removed });
});

export default router;
