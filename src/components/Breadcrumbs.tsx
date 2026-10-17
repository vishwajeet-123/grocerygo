import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  currentCategoryName: string;
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentCategoryName,
  onNavigateHome,
  onNavigateCategories,
}) => {
  return (
    <div className="py-2.5">
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
        
        {/* Home */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-1 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-700" />
          <span>Home</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

        {/* Categories */}
        <button
          type="button"
          onClick={onNavigateCategories}
          className="hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <span>Categories</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

        {/* Current Active Category */}
        <span className="text-slate-900 font-semibold truncate" aria-current="page">
          {currentCategoryName}
        </span>

      </nav>
    </div>
  );
};
