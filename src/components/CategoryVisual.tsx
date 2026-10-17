import React from 'react';

interface CategoryVisualProps {
  type: string;
  className?: string;
}

export const CategoryVisual: React.FC<CategoryVisualProps> = ({ type, className = 'w-12 h-12' }) => {
  switch (type) {
    case 'fruits-vegetables':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Apple / Tomato */}
          <circle cx="26" cy="38" r="14" fill="#EF4444" />
          <path d="M26 24C26 20 28 17 31 16" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 20C32 20 35 18 36 15" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
          {/* Carrot */}
          <path d="M38 46L46 22C47 19 50 19 51 21L53 26L43 49C41 53 36 50 38 46Z" fill="#F97316" />
          <path d="M49 20C52 16 55 15 57 16" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
          {/* Leaf */}
          <path d="M18 32C14 28 15 22 21 21C27 20 29 25 26 31" fill="#10B981" />
        </svg>
      );
    case 'dairy-eggs':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Milk bottle */}
          <rect x="16" y="24" width="16" height="28" rx="4" fill="#38BDF8" fillOpacity="0.25" stroke="#0284C7" strokeWidth="2" />
          <path d="M20 24V17H28V24" stroke="#0284C7" strokeWidth="2" />
          <rect x="18" y="14" width="12" height="4" rx="1.5" fill="#0284C7" />
          <rect x="19" y="32" width="10" height="12" rx="2" fill="#BAE6FD" />
          <text x="21" y="41" fontSize="7" fontWeight="bold" fill="#0369A1">MILK</text>
          {/* Egg */}
          <path d="M42 51C47.5 51 51 46 51 40C51 32 46.5 25 42 25C37.5 25 33 32 33 40C33 46 36.5 51 42 51Z" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        </svg>
      );
    case 'atta-rice-grains':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Sack of Atta */}
          <path d="M16 26C16 23 20 21 32 21C44 21 48 23 48 26L45 52C45 54 41 55 32 55C23 55 19 54 19 52L16 26Z" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
          <path d="M22 21C22 17 26 15 32 15C38 15 42 17 42 21" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
          {/* Wheat icon on sack */}
          <path d="M32 28V46M32 32L27 29M32 37L27 34M32 42L27 39M32 32L37 29M32 37L37 34M32 42L37 39" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'cooking-essentials':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Oil bottle */}
          <rect x="18" y="22" width="14" height="30" rx="3" fill="#FDBA74" fillOpacity="0.4" stroke="#EA580C" strokeWidth="2" />
          <path d="M21 22V16H29V22" stroke="#EA580C" strokeWidth="2" />
          <rect x="20" y="13" width="10" height="3" rx="1" fill="#EA580C" />
          {/* Spice bowl */}
          <path d="M35 38C35 46 41 52 49 52C57 52 63 46 63 38H35Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          <circle cx="49" cy="35" r="5" fill="#EF4444" />
        </svg>
      );
    case 'snacks-beverages':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Chips pack */}
          <path d="M14 20L20 16L34 20L32 52L18 54L14 50Z" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
          <path d="M19 32L29 36" stroke="#FFE4E6" strokeWidth="2.5" strokeLinecap="round" />
          {/* Soda can */}
          <rect x="36" y="24" width="16" height="28" rx="4" fill="#FDA4AF" stroke="#BE123C" strokeWidth="2" />
          <ellipse cx="44" cy="24" rx="8" ry="3" fill="#FFE4E6" stroke="#BE123C" strokeWidth="1.5" />
          <path d="M44 32V44" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'personal-care':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Lotion dispenser */}
          <rect x="18" y="26" width="16" height="26" rx="4" fill="#99F6E4" stroke="#0D9488" strokeWidth="2" />
          <path d="M26 26V18M26 18H34M26 18H20" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Soap bar with bubbles */}
          <rect x="34" y="36" width="18" height="14" rx="4" fill="#CCFBF1" stroke="#14B8A6" strokeWidth="2" />
          <circle cx="44" cy="24" r="3" fill="#2DD4BF" fillOpacity="0.4" />
          <circle cx="50" cy="28" r="2" fill="#2DD4BF" fillOpacity="0.6" />
        </svg>
      );
    case 'household-items':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Spray bottle */}
          <path d="M22 28L28 28L30 52H18L20 34" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="2" />
          <path d="M24 28V20H29L33 22" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 23L17 26" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
          {/* Sponge / brush */}
          <rect x="34" y="34" width="18" height="18" rx="3" fill="#A5B4FC" stroke="#3730A3" strokeWidth="2" />
          <circle cx="39" cy="40" r="1.5" fill="#312E81" />
          <circle cx="45" cy="44" r="1.5" fill="#312E81" />
        </svg>
      );
    case 'baby-care':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Baby feeder bottle */}
          <rect x="22" y="24" width="16" height="28" rx="4" fill="#FBCFE8" stroke="#DB2777" strokeWidth="2" />
          <path d="M25 24V19C25 17 27 15 30 15C33 15 35 17 35 19V24" stroke="#BE185D" strokeWidth="2" fill="#FCE7F3" />
          {/* Rattle */}
          <circle cx="45" cy="26" r="8" fill="#F472B6" stroke="#9D174D" strokeWidth="2" />
          <path d="M45 34V48" stroke="#9D174D" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="45" cy="50" r="2" fill="#9D174D" />
        </svg>
      );
    case 'bakery-cakes':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Bread loaf */}
          <path d="M14 42C14 32 20 26 32 26C44 26 50 32 50 42C50 48 46 50 32 50C18 50 14 48 14 42Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          <path d="M23 32L25 40M32 30L33 42M41 32L39 40" stroke="#A16207" strokeWidth="2" strokeLinecap="round" />
          {/* Cupcake cherry */}
          <circle cx="46" cy="20" r="4" fill="#EF4444" />
          <path d="M46 16C46 13 49 12 51 13" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'pet-care':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Pet paw print */}
          <ellipse cx="32" cy="42" rx="10" ry="8" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
          <circle cx="20" cy="29" r="4.5" fill="#A3E635" stroke="#4D7C0F" strokeWidth="1.5" />
          <circle cx="28" cy="24" r="5" fill="#A3E635" stroke="#4D7C0F" strokeWidth="1.5" />
          <circle cx="36" cy="24" r="5" fill="#A3E635" stroke="#4D7C0F" strokeWidth="1.5" />
          <circle cx="44" cy="29" r="4.5" fill="#A3E635" stroke="#4D7C0F" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        </svg>
      );
  }
};
