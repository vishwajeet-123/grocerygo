import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Store as StoreIcon,
  Bike,
  Shield,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { authApi, UserSession } from '../utils/api';
import { Store } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserSession) => void;
  defaultRole?: 'customer' | 'store_owner' | 'delivery_partner' | 'admin';
  stores: Store[];
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = 'customer',
  stores,
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'customer' | 'store_owner' | 'delivery_partner' | 'admin'>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [storeId, setStoreId] = useState(stores[0]?.id || 'shree-lakshmi-kirana');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole]);

  useEffect(() => {
    if (isOpen) {
      authApi.getSeedAccounts().then(setDemoAccounts).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        onSuccess(res.user);
        onClose();
      } else {
        const res = await authApi.register({
          name,
          email,
          password,
          phone,
          role: role === 'admin' ? 'customer' : role, // Admin cannot self register
          storeId: role === 'store_owner' ? storeId : undefined,
        });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({ email: acc.email, password: acc.password });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              GroceryGo Auth
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {isLogin ? 'Sign In to Your Account' : 'Create a New Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control for Customers, Store Owners, Delivery Partners & Admin
          </p>
        </div>

        {/* 1-Click Demo Switcher */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Instant Demo Switcher (1-Click Login)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                className="text-left p-2 rounded-lg bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer"
              >
                <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{acc.label}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">{acc.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Role Selector Tabs (Only shown in register, or for context in login) */}
        {!isLogin && (
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Your Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                  role === 'customer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <UserIcon className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('store_owner')}
                className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                  role === 'store_owner'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <StoreIcon className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block">Store Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('delivery_partner')}
                className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                  role === 'delivery_partner'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Bike className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block">Delivery Partner</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {!isLogin && role === 'store_owner' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Assign to Store</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between login & signup */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign up here" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
