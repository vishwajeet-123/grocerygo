import { Order, DeliveryLocation, ServiceAreaConfig } from '../types';
import { STORES } from './stores';
import { PRODUCTS } from './products';

export const DEFAULT_SERVICE_AREA_CONFIG: ServiceAreaConfig = {
  hyperlocalMaxKm: 5,
  suburbMaxKm: 12,
  remoteMaxKm: 30, // Configurable remote delivery radius (never hardcoded to 3 km)
  baseRemoteFeePerKm: 3.5,
  allowRemoteDelivery: true,
};

// Realistic delivery localities in and around Mysuru, Karnataka
// Specifically including distant suburbs and rural/remote villages as requested
export const MYSURU_LOCALITIES: DeliveryLocation[] = [
  {
    id: 'loc-hootagalli-main',
    name: 'Hootagalli Main',
    address: '#123, 5th Cross, Hootagalli, Mysuru - 570018',
    landmark: 'Near Primary Health Center',
    lat: 12.3375,
    lng: 76.5980,
    distanceKm: 0.8,
    estimatedMins: 18,
    isRemote: false,
    localityType: 'hyperlocal',
    deliveryFee: 0,
    areaTag: 'Hyperlocal Core',
  },
  {
    id: 'loc-belavadi-village',
    name: 'Belavadi Village',
    address: 'Belavadi Village Main Road, Near Gram Panchayat, Mysuru - 570018',
    landmark: 'Belavadi Temple Arch',
    lat: 12.3290,
    lng: 76.5840,
    distanceKm: 2.1,
    estimatedMins: 22,
    isRemote: false,
    localityType: 'hyperlocal',
    deliveryFee: 15,
    areaTag: 'Hyperlocal Core',
  },
  {
    id: 'loc-vijayanagar-4th',
    name: 'Vijayanagar 4th Stage',
    address: 'Plot #42, 2nd Main, Vijayanagar 4th Stage, Mysuru - 570032',
    landmark: 'Near Basaveshwara Circle',
    lat: 12.3480,
    lng: 76.6110,
    distanceKm: 3.6,
    estimatedMins: 26,
    isRemote: false,
    localityType: 'hyperlocal',
    deliveryFee: 20,
    areaTag: 'Hyperlocal Core',
  },
  {
    id: 'loc-hebbal-1st',
    name: 'Hebbal Industrial Suburb',
    address: 'Plot 18, Hebbal 1st Stage, Near Infosys Gate 2, Mysuru - 570027',
    landmark: 'Hebbal Lake View',
    lat: 12.3610,
    lng: 76.6020,
    distanceKm: 4.5,
    estimatedMins: 30,
    isRemote: false,
    localityType: 'hyperlocal',
    deliveryFee: 25,
    areaTag: 'Hyperlocal Core',
  },
  {
    id: 'loc-gokulam-3rd',
    name: 'Gokulam 3rd Stage',
    address: '14th Cross, Gokulam 3rd Stage, Mysuru - 570002',
    landmark: 'Opposite Doctor’s Corner',
    lat: 12.3250,
    lng: 76.6280,
    distanceKm: 5.8,
    estimatedMins: 35,
    isRemote: false,
    localityType: 'suburb',
    deliveryFee: 35,
    areaTag: 'Extended Suburb',
  },
  {
    id: 'loc-kuvempunagar',
    name: 'Kuvempunagar',
    address: 'M-Block, Adichunchanagiri Road, Kuvempunagar, Mysuru - 570023',
    landmark: 'Near Complex',
    lat: 12.2880,
    lng: 76.6320,
    distanceKm: 9.2,
    estimatedMins: 45,
    isRemote: false,
    localityType: 'suburb',
    deliveryFee: 45,
    areaTag: 'Extended Suburb',
  },
  {
    id: 'loc-chamundi-foothills',
    name: 'Chamundi Hill Foothills',
    address: 'Tavarekatte Village, Foothills of Chamundi Hill, Mysuru - 570010',
    landmark: 'Near Nandi Statue Ascent',
    lat: 12.2850,
    lng: 76.6710,
    distanceKm: 11.8,
    estimatedMins: 50,
    isRemote: false,
    localityType: 'suburb',
    deliveryFee: 50,
    areaTag: 'Extended Suburb',
  },
  // REMOTE & RURAL LOCALITIES (> 12 KM - NOT RESTRICTED BY 3 KM)
  {
    id: 'loc-ilavala-grama',
    name: 'Ilavala Rural Grama (Remote)',
    address: 'Ilavala Grama Panchayat, Hunsur Highway Outskirts, Mysuru - 571130',
    landmark: 'Old Banyan Tree Chowk',
    lat: 12.3680,
    lng: 76.5020,
    distanceKm: 13.8,
    estimatedMins: 55,
    isRemote: true,
    localityType: 'remote_village',
    deliveryFee: 65,
    areaTag: 'Remote Rural Locality',
  },
  {
    id: 'loc-koorgalli-sez',
    name: 'Koorgalli SEZ Rural Belt',
    address: 'Village Border, Koorgalli Industrial Outskirts, Mysuru - 570018',
    landmark: 'Near Agro Warehouses',
    lat: 12.3550,
    lng: 76.5290,
    distanceKm: 14.5,
    estimatedMins: 60,
    isRemote: true,
    localityType: 'remote_village',
    deliveryFee: 70,
    areaTag: 'Remote Rural Locality',
  },
  {
    id: 'loc-krs-belagola',
    name: 'KRS Road - Belagola Outskirts',
    address: 'Belagola Rural Post, KRS Reservoir Canal Road, Mysuru - 571607',
    landmark: 'Canal Bridge Cross',
    lat: 12.4120,
    lng: 76.5580,
    distanceKm: 16.4,
    estimatedMins: 65,
    isRemote: true,
    localityType: 'remote_village',
    deliveryFee: 75,
    areaTag: 'Remote Rural Locality',
  },
  {
    id: 'loc-kadakola-rural',
    name: 'Kadakola Rural Belt (Remote)',
    address: 'Kadakola Village, Nanjangud Industrial Corridor, Mysuru - 571311',
    landmark: 'Railway Station Cross Road',
    lat: 12.1980,
    lng: 76.6750,
    distanceKm: 19.8,
    estimatedMins: 75,
    isRemote: true,
    localityType: 'rural_outskirt',
    deliveryFee: 85,
    areaTag: 'Remote Rural Locality',
  },
  {
    id: 'loc-bannur-meglapura',
    name: 'Bannur Road - Meglapura Outskirts',
    address: 'Meglapura Village, Bannur State Highway, Mysuru District - 571101',
    landmark: 'Cauvery Branch Irrigation Canal',
    lat: 12.3120,
    lng: 76.7820,
    distanceKm: 22.6,
    estimatedMins: 85,
    isRemote: true,
    localityType: 'rural_outskirt',
    deliveryFee: 95,
    areaTag: 'Remote Rural Locality',
  },
  {
    id: 'loc-srirangapatna-border',
    name: 'Srirangapatna Outskirts Border',
    address: 'Paschimavahini Outskirts, Bangalore-Mysuru Expressway, Mandya/Mysuru Border - 571438',
    landmark: 'River Sangama Access',
    lat: 12.4250,
    lng: 76.6890,
    distanceKm: 25.2,
    estimatedMins: 90,
    isRemote: true,
    localityType: 'rural_outskirt',
    deliveryFee: 110,
    areaTag: 'Remote Rural Locality',
  },
];

// Haversine formula to compute actual spherical distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Compute delivery feasibility, tier, fee, and estimated delivery time based on configurable radius
export function evaluateDeliveryEligibility(
  distanceKm: number,
  config: ServiceAreaConfig = DEFAULT_SERVICE_AREA_CONFIG
): {
  isDeliverable: boolean;
  localityType: 'hyperlocal' | 'suburb' | 'remote_village' | 'rural_outskirt';
  tierName: string;
  deliveryFee: number;
  estimatedMins: number;
  deliveryMode: string;
  reason?: string;
} {
  if (distanceKm <= config.hyperlocalMaxKm) {
    const fee = distanceKm <= 1.5 ? 0 : 20;
    const mins = Math.max(15, Math.round(15 + distanceKm * 3));
    return {
      isDeliverable: true,
      localityType: 'hyperlocal',
      tierName: 'Hyperlocal Express (< 5 km)',
      deliveryFee: fee,
      estimatedMins: mins,
      deliveryMode: 'Two-Wheeler Partner Delivery (15-30 mins)',
    };
  }

  if (distanceKm <= config.suburbMaxKm) {
    const fee = 35 + Math.round((distanceKm - config.hyperlocalMaxKm) * 2.5);
    const mins = Math.round(25 + distanceKm * 2.5);
    return {
      isDeliverable: true,
      localityType: 'suburb',
      tierName: 'Extended Suburb Service (5 - 12 km)',
      deliveryFee: fee,
      estimatedMins: mins,
      deliveryMode: 'Standard Two-Wheeler / GroceryGo Van',
    };
  }

  if (config.allowRemoteDelivery && distanceKm <= config.remoteMaxKm) {
    const remoteExtra = Math.round((distanceKm - config.suburbMaxKm) * config.baseRemoteFeePerKm);
    const fee = 50 + remoteExtra;
    const mins = Math.round(40 + distanceKm * 2.2);
    return {
      isDeliverable: true,
      localityType: distanceKm > 20 ? 'rural_outskirt' : 'remote_village',
      tierName: `Remote Rural Delivery (${config.suburbMaxKm} - ${config.remoteMaxKm} km)`,
      deliveryFee: fee,
      estimatedMins: mins,
      deliveryMode: 'Specialized Rural Kirana Van / Express Courier',
    };
  }

  return {
    isDeliverable: false,
    localityType: 'rural_outskirt',
    tierName: `Outside Configured Range (> ${config.remoteMaxKm} km)`,
    deliveryFee: 0,
    estimatedMins: 0,
    deliveryMode: 'Currently outside scheduled routes',
    reason: `Distance is ${distanceKm} km, which exceeds our current service boundary of ${config.remoteMaxKm} km. You can adjust the radius in Service Area Settings!`,
  };
}

// Initial demonstration orders
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8492',
    orderNumber: '#GG-MYS-8492',
    store: STORES[0], // Shree Lakshmi Kirana
    items: [
      { product: PRODUCTS.find((p) => p.id === 'slk-aashirvaad-atta') || PRODUCTS[4], quantity: 1 },
      { product: PRODUCTS.find((p) => p.id === 'slk-tomato') || PRODUCTS[0], quantity: 2 },
      { product: PRODUCTS.find((p) => p.id === 'slk-onion') || PRODUCTS[1], quantity: 1 },
      { product: PRODUCTS.find((p) => p.id === 'slk-maggi-noodles') || PRODUCTS[7], quantity: 1 },
    ],
    subtotal: 392,
    packingFee: 10,
    deliveryFee: 0,
    discount: 0,
    totalAmount: 402,
    paymentMethod: 'UPI (grocerygo@upi)',
    paymentStatus: 'paid',
    createdAt: 'Today, 09:42 AM',
    status: 'out_for_delivery',
    estimatedDeliveryTime: '10:15 AM (in 12 mins)',
    deliveryOtp: '6824',
    deliveryAddress: MYSURU_LOCALITIES[0], // Hootagalli Main
    deliveryPartner: {
      id: 'driver-ramesh',
      name: 'Ramesh Kumar',
      phone: '+91 94812 37490',
      rating: 4.8,
      totalDeliveries: 1240,
      vehicleType: 'Electric Scooter (Ather 450X)',
      vehicleNumber: 'KA-09-EV-4821',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      currentLat: 12.3384,
      currentLng: 76.5955,
    },
    timeline: [
      {
        status: 'placed',
        title: 'Order Placed',
        description: 'Received by Shree Lakshmi Kirana system',
        time: '09:42 AM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Payment verified via UPI',
        time: '09:43 AM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'packing',
        title: 'Packed & Quality Checked',
        description: 'Packed fresh vegetables & groceries in eco-bag',
        time: '09:50 AM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Ramesh Kumar is on the way with your order',
        time: '09:58 AM',
        isCompleted: true,
        isCurrent: true,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Delivered at doorstep with OTP verification',
        time: 'Expected 10:15 AM',
        isCompleted: false,
        isCurrent: false,
      },
    ],
  },
  {
    id: 'ord-7731',
    orderNumber: '#GG-MYS-7731',
    store: STORES[2], // Reliance Smart
    items: [
      { product: PRODUCTS.find((p) => p.id === 'slk-fortune-sunflower-oil') || PRODUCTS[5], quantity: 2 },
      { product: PRODUCTS.find((p) => p.id === 'slk-tata-salt') || PRODUCTS[6], quantity: 1 },
      { product: PRODUCTS.find((p) => p.id === 'slk-good-day-butter') || PRODUCTS[8], quantity: 3 },
    ],
    subtotal: 510,
    packingFee: 10,
    deliveryFee: 65,
    remoteAreaSurcharge: 20,
    discount: 30,
    totalAmount: 575,
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'cod',
    createdAt: 'Today, 08:30 AM',
    status: 'packing',
    estimatedDeliveryTime: '10:45 AM (Remote Village Delivery)',
    deliveryOtp: '4192',
    deliveryAddress: MYSURU_LOCALITIES[7], // Ilavala Rural Grama (Remote 13.8 km)
    deliveryPartner: {
      id: 'driver-manjunath',
      name: 'Manjunath Gowda',
      phone: '+91 98450 19283',
      rating: 4.9,
      totalDeliveries: 890,
      vehicleType: 'GroceryGo Delivery Van (Tata Ace)',
      vehicleNumber: 'KA-09-B-7123',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      currentLat: 12.3310,
      currentLng: 76.5650,
    },
    timeline: [
      {
        status: 'placed',
        title: 'Order Placed',
        description: 'Dispatched to Reliance Smart Belavadi Hub',
        time: '08:30 AM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'confirmed',
        title: 'Remote Route Assigned',
        description: 'Scheduled with Rural Delivery Van Route 4',
        time: '08:35 AM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'packing',
        title: 'Packing for Rural Transit',
        description: 'Securing items with heavy-duty moisture packs',
        time: '08:55 AM',
        isCompleted: true,
        isCurrent: true,
      },
      {
        status: 'out_for_delivery',
        title: 'Dispatched to Remote Village',
        description: 'Van en-route along Hunsur Highway',
        time: 'Expected 09:45 AM',
        isCompleted: false,
        isCurrent: false,
      },
      {
        status: 'delivered',
        title: 'Delivered at Ilavala Panchayat',
        description: 'Handed over with cash collection',
        time: 'Expected 10:45 AM',
        isCompleted: false,
        isCurrent: false,
      },
    ],
  },
  {
    id: 'ord-6104',
    orderNumber: '#GG-MYS-6104',
    store: STORES[1], // More Fresh Supermarket
    items: [
      { product: PRODUCTS.find((p) => p.id === 'slk-nandini-milk') || PRODUCTS[2], quantity: 3 },
      { product: PRODUCTS.find((p) => p.id === 'slk-brown-bread') || PRODUCTS[3], quantity: 1 },
      { product: PRODUCTS.find((p) => p.id === 'slk-farm-eggs') || PRODUCTS[4], quantity: 1 },
    ],
    subtotal: 215,
    packingFee: 10,
    deliveryFee: 0,
    discount: 10,
    totalAmount: 215,
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'paid',
    createdAt: 'Yesterday, 05:15 PM',
    status: 'delivered',
    estimatedDeliveryTime: 'Delivered at 05:48 PM',
    deliveryOtp: '9031',
    deliveryAddress: MYSURU_LOCALITIES[4], // Gokulam 3rd Stage
    timeline: [
      {
        status: 'placed',
        title: 'Order Placed',
        description: 'Received by More Fresh Supermarket',
        time: '05:15 PM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'confirmed',
        title: 'Confirmed',
        description: 'Payment verified',
        time: '05:16 PM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'packing',
        title: 'Packed & Sealed',
        description: 'Cold storage pack applied to dairy',
        time: '05:25 PM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Delivery partner Suresh picked up package',
        time: '05:32 PM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Delivered safely at Gokulam residence',
        time: '05:48 PM',
        isCompleted: true,
        isCurrent: true,
      },
    ],
  },
  {
    id: 'ord-5289',
    orderNumber: '#GG-MYS-5289',
    store: STORES[0], // Shree Lakshmi Kirana
    items: [
      { product: PRODUCTS.find((p) => p.id === 'slk-toor-dal') || PRODUCTS[6], quantity: 2 },
      { product: PRODUCTS.find((p) => p.id === 'slk-everest-turmeric') || PRODUCTS[9], quantity: 1 },
    ],
    subtotal: 280,
    packingFee: 10,
    deliveryFee: 0,
    discount: 0,
    totalAmount: 290,
    paymentMethod: 'UPI (Paytm)',
    paymentStatus: 'paid',
    createdAt: '12 Oct 2026, 11:20 AM',
    status: 'delivered',
    estimatedDeliveryTime: 'Delivered at 11:45 AM',
    deliveryOtp: '3318',
    deliveryAddress: MYSURU_LOCALITIES[0],
    timeline: [
      {
        status: 'placed',
        title: 'Order Placed',
        description: 'Received by Shree Lakshmi Kirana',
        time: '11:20 AM',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Order handed over successfully',
        time: '11:45 AM',
        isCompleted: true,
        isCurrent: true,
      },
    ],
  },
];
