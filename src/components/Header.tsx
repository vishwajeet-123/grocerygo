import React, { useState } from 'react';
import { ShoppingCart, Leaf, MapPin, Search, ChevronDown, User, Check, Package, Map, LogOut, Heart, X } from 'lucide-react';

import { AppPage } from './SecondaryNavigation';
import { UserSession } from '../utils/api';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit?: (e?: React.FormEvent) => void;
  currentUser?: UserSession | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onOpenLocationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  currentPage,
  onNavigate,
  selectedLocation,
  setSelectedLocation,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenLocationModal,
}) => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else if (onOpenSearch) {
      onOpenSearch();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      
      {/* Top Main Header: ~65-70px tall */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17 gap-3 sm:gap-6">
          
          {/* Left section: Brand logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center text-emerald-950 shadow">
                  <Leaf className="w-2.5 h-2.5 fill-emerald-900" />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-emerald-900 tracking-tight leading-none">
                  GroceryGo
                </span>
                <span className="text-[11px] font-medium text-emerald-700 mt-0.5 tracking-tight">
                  Smart Local Grocery Delivery
                </span>
              </div>
            </button>
          </div>

          {/* Center-left: Long Search Bar occupying substantial portion */}
          <div className="flex-1 max-w-2xl min-w-0">
            <form onSubmit={handleFormSubmit} className="relative w-full">
              <div
                className={`flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-xl border px-3 py-1.5 transition-all ${
                  isSearchFocused
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <Search className="w-4 h-4 text-emerald-700 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search for products, stores or categories..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right section: Location + Cart + Account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* 1. Interactive Location Picker Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onOpenLocationModal) {
                  onOpenLocationModal();
                } else {
                  setIsLocationOpen(!isLocationOpen);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 transition-all border border-slate-200/80 hover:border-emerald-300 shadow-2xs cursor-pointer group"
              title="Change delivery location & open interactive map"
            >
              <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MapPin className="w-3 h-3 text-inherit" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-medium leading-none">Deliver to:</span>
                <span className="max-w-[130px] sm:max-w-[180px] lg:max-w-[220px] truncate font-bold text-slate-900 leading-tight">
                  {selectedLocation.split(',')[0] || selectedLocation}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0 ml-0.5" />
            </button>

            {/* 2. Shopping cart icon with badge */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Open Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 3. User Avatar & Name dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(!isAccountOpen);
                  setIsLocationOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                aria-expanded={isAccountOpen}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center border border-emerald-300 shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'V'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser?.name || 'Vishwajeet'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Customer'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              </button>

              {/* Account Dropdown */}
              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 text-left">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{currentUser?.name || 'Vishwajeet Waghmare'}</p>
                    <p className="text-[11px] text-slate-500">{currentUser?.email || 'customer@grocerygo.in'}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active: {currentUser?.role ? currentUser.role.replace('_', ' ').toUpperCase() : 'CUSTOMER'}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-xs text-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        onOpenAuthModal?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100 text-left font-bold"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Switch Role / Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        onNavigate('orders');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-medium"
                    >
                      <Package className="w-3.5 h-3.5 text-emerald-700" />
                      <span>My Orders & Reorders</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-800 text-left font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Store Owner Portal</span>
                      </div>
                      <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                        5
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        onNavigate('delivery');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-50 text-amber-900 text-left font-bold"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      <span>Delivery Partner Console</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-900 text-left font-bold"
                    >
                      <User className="w-3.5 h-3.5 text-purple-700" />
                      <span>Super Admin Center</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
