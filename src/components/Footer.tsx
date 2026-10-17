import React from 'react';
import { ShoppingCart, Leaf, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="about" className="border-t border-slate-100 bg-slate-50/60 mt-10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">GroceryGo</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">Smart Local Grocery Delivery</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Connecting customers with supermarkets and kirana stores across Mysuru, Karnataka
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <div className="flex items-center gap-5 text-xs font-medium text-slate-600">
            <a href="#hero" className="hover:text-emerald-700 transition-colors">Home</a>
            <a href="#categories" className="hover:text-emerald-700 transition-colors">Categories</a>
            <a href="#stores" className="hover:text-emerald-700 transition-colors">Nearby Stores</a>
            <a href="#offers" className="hover:text-emerald-700 transition-colors">Promotions</a>
            <a href="#featured-products" className="hover:text-emerald-700 transition-colors">Featured Products</a>
          </div>

          {/* Copyright */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>© {new Date().getFullYear()} GroceryGo</span>
            <span>·</span>
            <span>College Project Prototype (Phase 1)</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
