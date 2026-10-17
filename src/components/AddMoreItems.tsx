import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface AddMoreItemsProps {
  onAddToCart: (product: Product) => void;
}

export const AddMoreItems: React.FC<AddMoreItemsProps> = ({ onAddToCart }) => {
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Exact 4 suggested products from Section 11
  const suggestedProducts: Product[] = [
    // 1. Potato (1 kg, ₹25, orig ₹35)
    PRODUCTS.find((p) => p.id === 'slk-potato') || {
      id: 'slk-potato',
      name: 'Potato',
      category: 'Fruits & Vegetables',
      quantity: '1 kg',
      price: 25,
      originalPrice: 35,
      image: '/src/assets/images/prod_fresh_potatoes_1792249994939.jpg',
      storeId: 'shree-lakshmi-kirana',
      storeName: 'Shree Lakshmi Kirana',
    },
    // 2. Banana (1 kg, ₹50, orig ₹60)
    PRODUCTS.find((p) => p.id === 'slk-banana') || {
      id: 'slk-banana',
      name: 'Banana',
      category: 'Fruits & Vegetables',
      quantity: '1 kg',
      price: 50,
      originalPrice: 60,
      image: '/src/assets/images/prod_ripe_bananas_1792249993435.jpg',
      storeId: 'shree-lakshmi-kirana',
      storeName: 'Shree Lakshmi Kirana',
    },
    // 3. Amul Taaza Milk (1 L, ₹68, orig ₹72)
    PRODUCTS.find((p) => p.id === 'slk-amul-taaza-milk') || {
      id: 'slk-amul-taaza-milk',
      name: 'Amul Taaza Milk',
      category: 'Dairy & Eggs',
      quantity: '1 L',
      price: 68,
      originalPrice: 72,
      image: '/src/assets/images/prod_milk_pouch_1792249995129.jpg',
      storeId: 'shree-lakshmi-kirana',
      storeName: 'Shree Lakshmi Kirana',
    },
    // 4. Fortune Sunflower Oil (1 L, ₹155, orig ₹170)
    PRODUCTS.find((p) => p.id === 'slk-fortune-sunflower-oil') || {
      id: 'slk-fortune-sunflower-oil',
      name: 'Fortune Sunflower Oil',
      category: 'Cooking Essentials',
      quantity: '1 L',
      price: 155,
      originalPrice: 170,
      image: '/src/assets/images/prod_fortune_oil_pack_1792254220066.jpg',
      storeId: 'shree-lakshmi-kirana',
      storeName: 'Shree Lakshmi Kirana',
    },
  ];

  const handleAddClick = (prod: Product) => {
    onAddToCart(prod);
    setJustAddedId(prod.id);
    setTimeout(() => {
      setJustAddedId((curr) => (curr === prod.id ? null : curr));
    }, 1200);
  };

  return (
    <div className="mt-8">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 tracking-tight">
        Add more items
      </h2>

      {/* 4 compact product cards in a single horizontal row on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {suggestedProducts.map((product) => {
          const discount =
            product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
          const isJustAdded = justAddedId === product.id;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 group relative"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2">
                {discount > 0 && (
                  <span className="absolute top-1.5 left-1.5 z-10 bg-red-500 text-white font-extrabold text-[9px] px-1 py-0.2 rounded shadow-2xs">
                    {discount}% OFF
                  </span>
                )}

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {isJustAdded && (
                  <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-2xs flex items-center justify-center z-20 animate-in fade-in duration-100">
                    <span className="bg-white text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                      Added!
                    </span>
                  </div>
                )}
              </div>

              {/* Product Meta */}
              <div className="space-y-0.5 min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  {product.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {product.quantity}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={() => handleAddClick(product)}
                className="mt-2.5 w-full py-1.5 px-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
