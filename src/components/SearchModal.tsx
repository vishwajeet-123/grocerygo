import React, { useState, useEffect } from 'react';
import { Search, X, Store, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { Store as StoreType } from '../types';
import { CategoryItem } from '../data/categories';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  products: Product[];
  stores: StoreType[];
  categories: CategoryItem[];
  onSelectCategory: (name: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectStore?: (storeId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  query,
  setQuery,
  products,
  stores,
  categories,
  onSelectCategory,
  onAddToCart,
  onSelectStore,
}) => {
  const [internalQuery, setInternalQuery] = useState(query);

  useEffect(() => {
    setInternalQuery(query);
  }, [query]);

  if (!isOpen) return null;

  const trimmed = internalQuery.trim().toLowerCase();

  const matchingProducts = trimmed
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          (p.storeName && p.storeName.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingStores = trimmed
    ? stores.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          s.type.toLowerCase().includes(trimmed) ||
          (s.address && s.address.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingCategories = trimmed
    ? categories.filter((c) => c.name.toLowerCase().includes(trimmed))
    : [];

  const hasResults =
    matchingProducts.length > 0 || matchingStores.length > 0 || matchingCategories.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            value={internalQuery}
            onChange={(e) => {
              setInternalQuery(e.target.value);
              setQuery(e.target.value);
            }}
            placeholder="Search products, stores or categories..."
            className="w-full text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
            autoFocus
          />
          {internalQuery && (
            <button
              type="button"
              onClick={() => {
                setInternalQuery('');
                setQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md"
          >
            Esc
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-5">
          {!trimmed ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Quick Recommendations in Mysuru
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Tomato', 'Amul Milk', 'Aashirvaad Atta', 'Kirana', 'D-Mart', 'Vegetables'].map(
                  (sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setInternalQuery(sample);
                        setQuery(sample);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs rounded-full transition-colors font-medium"
                    >
                      {sample}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : hasResults ? (
            <>
              {/* Matching Categories */}
              {matchingCategories.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Categories ({matchingCategories.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {matchingCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onSelectCategory(cat.name);
                          onClose();
                          const el = document.getElementById('featured-products');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800">{cat.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Products */}
              {matchingProducts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    Products ({matchingProducts.length})
                  </h4>
                  <div className="space-y-2">
                    {matchingProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg p-1 border border-slate-100 flex items-center justify-center shrink-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {p.quantity} · {p.category}
                            </span>
                            {p.storeName && (
                              <span className="text-[10px] text-emerald-700 block font-medium">
                                {p.storeName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block tabular-nums">
                              ₹{p.price}
                            </span>
                            {p.originalPrice > p.price && (
                              <span className="text-[10px] text-slate-400 line-through tabular-nums">
                                ₹{p.originalPrice}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart(p);
                            }}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Stores */}
              {matchingStores.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    Stores in Mysuru ({matchingStores.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchingStores.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => {
                          onSelectStore?.(st.id);
                          onClose();
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={st.image}
                            alt={st.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {st.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {st.type} · {st.distance}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            {st.deliveryTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">No results found for "{internalQuery}"</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Try searching for general grocery terms like "Tomato", "Milk", "Atta", or store names like "Kirana" or "D-Mart".
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Client-side demonstration search · Mysuru database</span>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-700 font-semibold hover:underline"
          >
            Close Search
          </button>
        </div>

      </div>
    </div>
  );
};
