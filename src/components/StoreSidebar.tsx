import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Store } from '../types';

interface StoreSidebarProps {
  store: Store;
  categories: { id: string; name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onOpenMapModal: () => void;
}

export const StoreSidebar: React.FC<StoreSidebarProps> = ({
  store,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenMapModal,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCallOrCopy = () => {
    const phone = '+918212405678';
    if (window.innerWidth < 768) {
      window.location.href = `tel:${phone}`;
    } else {
      navigator.clipboard.writeText('+91 821 240 5678');
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <aside className="w-full lg:w-[280px] shrink-0 space-y-4">
      {/* 1. In-Store Categories Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Store Categories
          </h2>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {categories.reduce((acc, c) => acc + c.count, 0)} Items
          </span>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectCategory('All Items')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'All Items'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <span>All Items in Store</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedCategory === 'All Items'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {categories.reduce((acc, c) => acc + c.count, 0)}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Store Location & Interactive Map Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Store Location
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {store.distance}
          </span>
        </div>

        {/* Map Snapshot Visual with Pin */}
        <div
          onClick={onOpenMapModal}
          className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group shadow-2xs"
          title="Click to view interactive map"
        >
          <img
            src="/src/assets/images/store_route_map_preview_1792254220866.jpg"
            alt={`Map location of ${store.name} in Hootagalli, Mysuru`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10" />

          {/* Location Pin overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="bg-emerald-600 text-white p-1 rounded-full shadow-lg ring-2 ring-white animate-bounce">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="bg-slate-900/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
              {store.name}
            </span>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white drop-shadow">
              Hootagalli, Mysuru
            </span>
            <span className="text-[10px] font-bold text-emerald-200 group-hover:underline flex items-center gap-0.5">
              <span>View Map</span>
              <Navigation className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Address & Direction Button */}
        <div className="mt-2.5 space-y-2">
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            {store.address || '#123, Near Temple Cross, Hootagalli, Mysuru - 570018'}
          </p>

          <button
            type="button"
            onClick={onOpenMapModal}
            className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200/80 cursor-pointer shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            <span>Get Directions & Live Map</span>
          </button>
        </div>
      </div>

      {/* 3. Store Hours & Quick Policies */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 pb-1.5 border-b border-slate-100 flex items-center justify-between">
          <span>Store Information</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        </h3>

        {/* Operating Hours */}
        <div className="flex items-start gap-2 text-xs">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block">Daily Hours</span>
            <span className="text-[11px] text-slate-500">
              {store.hours || '8:00 AM – 10:00 PM'} (All Days)
            </span>
          </div>
        </div>

        {/* Delivery Area */}
        <div className="flex items-start gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block">Delivery Radius</span>
            <span className="text-[11px] text-slate-500">
              {store.deliveryArea || 'Within 3 km of Hootagalli, Mysuru'}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex items-start gap-2 text-xs">
          <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block">Payment Accepted</span>
            <span className="text-[11px] text-slate-500">
              UPI (GPay, PhonePe, Paytm), Cash on Delivery, Debit/Credit Cards
            </span>
          </div>
        </div>

        {/* Store Helpline / Contact */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCallOrCopy}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>{copiedPhone ? 'Copied +91 821 240 5678!' : 'Contact Store: +91 821 240 5678'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
