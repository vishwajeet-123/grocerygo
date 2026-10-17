import React, { useState } from 'react';
import { Heart, Share2, Check } from 'lucide-react';
import { Store } from '../types';

interface StoreCoverBannerProps {
  store: Store;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const StoreCoverBanner: React.FC<StoreCoverBannerProps> = ({
  store,
  isSaved,
  onToggleSave,
}) => {
  const [shareToast, setShareToast] = useState(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `${store.name} – GroceryGo Local Grocery Delivery`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Order fresh groceries from ${store.name} in Hootagalli, Mysuru on GroceryGo!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  return (
    <div className="relative w-full h-[105px] sm:h-[115px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs group mb-0">
      {/* Cover Image */}
      <img
        src={store.coverImage || '/src/assets/images/store_kirana_cover_1792254220389.jpg'}
        alt={`${store.name} storefront cover`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        referrerPolicy="no-referrer"
      />

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

      {/* Overlay Action Buttons on Right */}
      <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 flex items-center gap-2 z-10">
        
        {/* Save Store Button */}
        <button
          type="button"
          onClick={onToggleSave}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            isSaved
              ? 'bg-white text-red-600 ring-1 ring-red-200'
              : 'bg-white/90 hover:bg-white text-slate-800 hover:text-red-600'
          }`}
          title={isSaved ? 'Store saved to favorites' : 'Save store to favorites'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              isSaved ? 'fill-red-600 text-red-600 scale-110' : 'text-slate-500'
            }`}
          />
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save Store'}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md transition-all shadow-sm cursor-pointer"
          title="Share store link"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-3.5 h-3.5 text-lime-400" />
          <span>Store link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};
