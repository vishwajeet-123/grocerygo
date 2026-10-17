export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  iconType: string;
  description: string;
  bannerImage: string;
  slug: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    color: 'emerald',
    bgLight: '#ecfdf5',
    iconType: 'fruits-vegetables',
    description: 'Fresh and healthy fruits and vegetables from nearby stores.',
    bannerImage: '/src/assets/images/promo_fresh_veggies_1792249946113.jpg',
  },
  {
    id: 'dairy-eggs',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    color: 'sky',
    bgLight: '#f0f9ff',
    iconType: 'dairy-eggs',
    description: 'Fresh milk, paneer, curd, butter, and farm eggs delivered fast.',
    bannerImage: '/src/assets/images/promo_dairy_breakfast_1792249962902.jpg',
  },
  {
    id: 'atta-rice-grains',
    name: 'Atta, Rice & Grains',
    slug: 'atta-rice-grains',
    color: 'amber',
    bgLight: '#fffbeb',
    iconType: 'atta-rice-grains',
    description: 'Wholesome chakki atta, basmati rice, lentils, and organic grains.',
    bannerImage: '/src/assets/images/promo_daily_staples_1792249946343.jpg',
  },
  {
    id: 'cooking-essentials',
    name: 'Cooking Essentials',
    slug: 'cooking-essentials',
    color: 'orange',
    bgLight: '#fff7ed',
    iconType: 'cooking-essentials',
    description: 'Cooking oils, pure ghee, spices, iodized salt, and pantry staples.',
    bannerImage: '/src/assets/images/promo_daily_staples_1792249946343.jpg',
  },
  {
    id: 'snacks-beverages',
    name: 'Snacks & Beverages',
    slug: 'snacks-beverages',
    color: 'rose',
    bgLight: '#fff1f2',
    iconType: 'snacks-beverages',
    description: 'Crispy snacks, namkeen, cold beverages, tea, and filter coffee.',
    bannerImage: '/src/assets/images/store_dmart_supermarket_1792249963516.jpg',
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    slug: 'personal-care',
    color: 'teal',
    bgLight: '#f0fdfa',
    iconType: 'personal-care',
    description: 'Bathing soaps, skincare, oral care, and personal hygiene essentials.',
    bannerImage: '/src/assets/images/store_supermarket_aisle_1792249945521.jpg',
  },
  {
    id: 'household-items',
    name: 'Household Items',
    slug: 'household-items',
    color: 'indigo',
    bgLight: '#eef2ff',
    iconType: 'household-items',
    description: 'Detergents, floor cleaners, dishwashing soaps, and paper towels.',
    bannerImage: '/src/assets/images/store_dmart_supermarket_1792249963516.jpg',
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    slug: 'baby-care',
    color: 'pink',
    bgLight: '#fdf2f8',
    iconType: 'baby-care',
    description: 'Baby diapers, gentle baby wipes, baby soap, and feeding bottles.',
    bannerImage: '/src/assets/images/store_supermarket_aisle_1792249945521.jpg',
  },
  {
    id: 'bakery-cakes',
    name: 'Bakery & Cakes',
    slug: 'bakery-cakes',
    color: 'yellow',
    bgLight: '#fefce8',
    iconType: 'bakery-cakes',
    description: 'Fresh wheat bread, pav buns, bakery rusks, and tea-time cakes.',
    bannerImage: '/src/assets/images/promo_dairy_breakfast_1792249962902.jpg',
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    slug: 'pet-care',
    color: 'lime',
    bgLight: '#f7fee7',
    iconType: 'pet-care',
    description: 'Nutritious dog food, cat food treats, and pet care essentials.',
    bannerImage: '/src/assets/images/store_dmart_supermarket_1792249963516.jpg',
  },
];
