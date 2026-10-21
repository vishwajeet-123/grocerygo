import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Settings,
  Users,
  Store as StoreIcon,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Sliders,
  CheckCircle,
  AlertTriangle,
  LogOut,
  RefreshCw,
  IndianRupee,
  Save,
  MessageSquare,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { adminApi, UserSession, storesApi, locationApi } from '../utils/api';
import { Store } from '../types';

interface AdminDashboardProps {
  currentUser: UserSession | null;
  onLogout: () => void;
  onNavigateCustomerHome: () => void;
}

export function AdminDashboard({
  currentUser,
  onLogout,
  onNavigateCustomerHome,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'stores' | 'users' | 'disputes' | 'remote_requests'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    hyperlocalMaxKm: 5,
    suburbMaxKm: 12,
    remoteMaxKm: 30,
    baseRemoteFeePerKm: 3.5,
    allowRemoteDelivery: true,
    platformCommissionRate: 5,
    announcement: 'Serving all neighborhoods and remote rural hamlets across Mysuru district.',
  });
  const [users, setUsers] = useState<UserSession[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [remoteRequests, setRemoteRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [ov, cfg, usr, str, disp, reqs] = await Promise.all([
        adminApi.getOverview().catch(() => null),
        adminApi.getConfig().catch(() => null),
        adminApi.getUsers().catch(() => []),
        storesApi.getAll().catch(() => []),
        adminApi.getDisputes().catch(() => []),
        locationApi.getRemoteRequests().catch(() => []),
      ]);

      if (ov) setOverview(ov);
      if (cfg) setConfig(cfg);
      setUsers(usr);
      setStores(str);
      setDisputes(disp);
      setRemoteRequests(reqs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingConfig(true);
      const updated = await adminApi.updateConfig(config);
      setConfig(updated);
      showToast('Platform service area & remote delivery configuration updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update config');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      showToast('User role updated successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleResolveDispute = async (disputeId: string, status: string) => {
    try {
      await adminApi.updateDispute(disputeId, {
        status,
        resolutionNotes: `Dispute status marked as ${status} by Platform Super Admin.`,
      });
      showToast(`Dispute marked as ${status}.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update dispute');
    }
  };

  const handleToggleStoreStatus = async (store: Store) => {
    try {
      await storesApi.updateStore(store.id, { isOpen: !store.isOpen });
      showToast(`Store ${store.name} marked ${!store.isOpen ? 'Open' : 'Closed'}.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update store status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-700/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">GroceryGo</span>
              <span className="text-[11px] font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500">Platform Control Center, Remote Coverage & Governance</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{currentUser?.name || 'Vishwajeet (Super Admin)'}</p>
            <p className="text-[10px] text-slate-500">Root Access • Full System RBAC</p>
          </div>
          <button
            type="button"
            onClick={onNavigateCustomerHome}
            className="text-xs text-slate-600 hover:text-emerald-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Customer App
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 overflow-x-auto">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Platform Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'config'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Remote Delivery & Service Area
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'stores'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <StoreIcon className="w-3.5 h-3.5" /> Stores ({stores.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Users & Roles ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('disputes')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'disputes'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Disputes ({disputes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('remote_requests')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'remote_requests'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Remote Requests ({remoteRequests.length})
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-purple-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Gross Merchandise Value</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  ₹{overview?.totalRevenue ? overview.totalRevenue.toLocaleString() : '12,490'}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Across Supermarkets & Kiranas</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Delivered Orders</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{overview?.deliveredOrders || 18}</p>
                <p className="text-[11px] text-slate-500 mt-1">100% verified via Customer OTP</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Registered Stores</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stores.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Kirana & Supermarkets</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Active Delivery Partners</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{overview?.totalPartners || 3}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Covering urban & remote routes</p>
              </div>
            </div>

            {/* Platform announcement banner */}
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-900">Live Platform Broadcast Announcement</p>
                <p className="text-xs text-purple-800 mt-0.5">{config.announcement}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className="text-xs font-bold text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 cursor-pointer"
              >
                Edit Broadcast
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Config (Remote & Rural Delivery Settings) */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-700" />
                Remote & Rural Delivery Service Area Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure delivery coverage radius and surcharge calculations for remote villages and distant suburbs across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allow remote delivery toggle */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Allow Remote Village & Suburb Delivery</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    When enabled, customers beyond 5 km can order with dynamic distance surcharges.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowRemoteDelivery}
                  onChange={(e) => setConfig({ ...config, allowRemoteDelivery: e.target.checked })}
                  className="w-5 h-5 accent-purple-700 cursor-pointer"
                />
              </div>

              {/* Commission */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.platformCommissionRate}
                  onChange={(e) => setConfig({ ...config, platformCommissionRate: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              {/* Hyperlocal radius */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Hyperlocal Core Radius: <span className="text-purple-700">{config.hyperlocalMaxKm} km</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={config.hyperlocalMaxKm}
                  onChange={(e) => setConfig({ ...config, hyperlocalMaxKm: Number(e.target.value) })}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Free or standard delivery zone (immediate neighborhood).</p>
              </div>

              {/* Maximum remote radius */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Maximum Remote Delivery Radius: <span className="text-purple-700 font-extrabold">{config.remoteMaxKm} km</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={config.remoteMaxKm}
                  onChange={(e) => setConfig({ ...config, remoteMaxKm: Number(e.target.value) })}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Allows ordering from distant rural hamlets up to {config.remoteMaxKm} km away.
                </p>
              </div>

              {/* Surcharge per km */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Remote Delivery Surcharge: <span className="text-purple-700">₹{config.baseRemoteFeePerKm} / km</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.baseRemoteFeePerKm}
                  onChange={(e) => setConfig({ ...config, baseRemoteFeePerKm: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Charged for distance beyond hyperlocal limit to support rural riders.</p>
              </div>

              {/* Platform announcement */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Platform Broadcast Announcement
                </label>
                <input
                  type="text"
                  value={config.announcement}
                  onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSavingConfig ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Stores */}
        {activeTab === 'stores' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Registered Supermarkets & Kirana Stores</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {stores.map((store) => (
                <div key={store.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{store.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {store.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{store.address}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {store.hours} • Min Order: {store.minOrder} • Delivery: {store.deliveryArea}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStoreStatus(store)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        store.isOpen
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {store.isOpen ? 'Open for Orders' : 'Store Closed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Users & Roles */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">User Accounts & Role Permissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Secure role-based access control (Customer, Store Owner, Delivery Partner, Admin)</p>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{user.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'store_owner'
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.role === 'delivery_partner'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{user.email} • {user.phone}</p>
                    {user.storeId && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Assigned Store: {user.storeId}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
                    >
                      <option value="customer">Customer</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="delivery_partner">Delivery Partner</option>
                      <option value="admin">Platform Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Disputes */}
        {activeTab === 'disputes' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Customer Order Dispute Resolution</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {disputes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No customer disputes logged.</div>
              ) : (
                disputes.map((dispute) => (
                  <div key={dispute.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Order #{dispute.orderId}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dispute.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dispute.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-1">Reason: {dispute.reason}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Customer: {dispute.customerName} • Store: {dispute.storeName} • Amount: ₹{dispute.amount}
                      </p>
                      {dispute.resolutionNotes && (
                        <p className="text-[11px] text-emerald-700 italic mt-1">Resolution: {dispute.resolutionNotes}</p>
                      )}
                    </div>

                    {dispute.status !== 'resolved' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleResolveDispute(dispute.id, 'resolved')}
                          className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 cursor-pointer"
                        >
                          Approve Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveDispute(dispute.id, 'rejected')}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Remote Area Delivery Demand Requests */}
        {activeTab === 'remote_requests' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Remote Area Delivery Demand Requests</h2>
                <p className="text-xs text-slate-500">
                  Customer requests from unserviced villages and remote locations across Karnataka & India
                </p>
              </div>
              <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                {remoteRequests.length} Requests Logged
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {remoteRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No remote area demand requests recorded yet.
                </div>
              ) : (
                remoteRequests.map((req) => (
                  <div key={req.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">{req.locality}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'service_expanded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Coordinates: [{req.lat?.toFixed(4)}, {req.lng?.toFixed(4)}]
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">
                        Address: {req.address}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span>Customer: <strong>{req.customerName}</strong> ({req.customerPhone})</span>
                        <span>Nearest Store: <strong>{req.nearestStoreName}</strong> ({req.distanceToNearestStoreKm} km away)</span>
                        <span>Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      {req.status !== 'service_expanded' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await fetch(`/api/location/remote-requests/${req.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'service_expanded' }),
                              });
                              showToast(`Service area configured for ${req.locality}!`);
                              loadData();
                            } catch (e) {
                              alert('Failed to update request');
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                        >
                          Expand Service
                        </button>
                      )}

                      {req.status === 'pending' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await fetch(`/api/location/remote-requests/${req.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'reviewed' }),
                              });
                              showToast(`Request marked as reviewed.`);
                              loadData();
                            } catch (e) {
                              alert('Failed to update request');
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Mark Reviewed
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
