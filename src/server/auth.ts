import { Request, Response, NextFunction } from 'express';
import { getDb, User, UserRole } from './db.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Simple base64 token format: base64(userId:timestamp:signature)
export function createToken(user: User): string {
  const payload = `${user.id}:${Date.now()}:${user.role}`;
  return Buffer.from(payload).toString('base64');
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    const db = getDb();
    const user = db.users.find((u) => u.id === userId);
    return user || null;
  } catch (e) {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (user) {
    req.user = user;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}

export function requireStoreAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role === 'admin') {
    // Admin has access to all stores
    return next();
  }

  const storeId = req.params.storeId || req.body.storeId || req.query.storeId;
  if (!storeId) {
    return next();
  }

  if (req.user.role === 'store_owner' && req.user.storeId !== storeId) {
    res.status(403).json({
      error: 'Access denied. You can only manage your own authorized store.',
    });
    return;
  }

  next();
}
