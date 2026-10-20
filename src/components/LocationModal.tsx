import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Check,
  Building2,
  Store as StoreIcon,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { InteractiveGoogleMap, MapMarkerItem } from './InteractiveGoogleMap';
import { locationApi } from '../utils/api';
import { Store, DeliveryLocation } from '../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (addressText: string, locationObj?: DeliveryLocation) => void;
  onSelectStore?: (storeId: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
  onSelectStore,
}) => {
  // Current active pin coordinates (Default: Hootagalli, Mysuru)
  const [pinCoordinates, setPinCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 12.3392,
    lng: 76.5927,
  });

  // Location address details
  const [addressDetails, setAddressDetails] = useState<{
    address: string;
    locality: string;
    district: string;
    state: string;
    pincode: string;
    isRemote: boolean;
  }>({
    address: selectedLocation || '#123, 5th Cross, Hootagalli, Mysuru - 570018',
    locality: 'Hootagalli',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570018',
    isRemote: false,
  });

  // Search query & autocomplete results
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Configurable search radius (5 km, 10 km, 25 km, 50 km, 100 km)
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(25);

  // Nearby store query results from real backend
  const [nearbyStoreData, setNearbyStoreData] = useState<{
    stores: any[];
    surroundingLocalities: any[];
    deliveringStoresCount: number;
    hasDeliveringStores: boolean;
    totalStoresFound: number;
  }>({
    stores: [],
    surroundingLocalities: [],
    deliveringStoresCount: 0,
    hasDeliveringStores: true,
    totalStoresFound: 0,
  });
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Remote Area Request inline form state
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestPhone, setRequestPhone] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSubmittedSuccess, setRequestSubmittedSuccess] = useState(false);

  const searchDebounceRef = useRef<any>(null);

  // Query nearby stores whenever pin coordinates or radius change
  const refreshNearbyStores = useCallback(
    async (lat: number, lng: number, radius: number) => {
      setIsLoadingStores(true);
      try {
        const data = await locationApi.getNearbyStores(lat, lng, radius, 'all');
        setNearbyStoreData({
          stores: data.stores || [],
          surroundingLocalities: data.surroundingLocalities || [],
          deliveringStoresCount: data.deliveringStoresCount || 0,
          hasDeliveringStores: data.hasDeliveringStores ?? true,
          totalStoresFound: data.totalStoresFound || 0,
        });
      } catch (err) {
        console.warn('Failed to fetch nearby stores from backend:', err);
      } finally {
        setIsLoadingStores(false);
      }
    },
    []
  );

  // Reverse geocode when coordinates change
  const handleCoordinateChange = useCallback(
    async (lat: number, lng: number) => {
      setPinCoordinates({ lat, lng });
      setIsResolvingAddress(true);
      try {
        const res = await locationApi.reverseGeocode(lat, lng);
        setAddressDetails({
          address: res.address,
          locality: res.locality,
          district: res.district,
          state: res.state,
          pincode: res.pincode,
          isRemote: res.isRemote,
        });
      } catch (e) {
        console.warn('Reverse geocode failed:', e);
      } finally {
        setIsResolvingAddress(false);
      }
      refreshNearbyStores(lat, lng, searchRadiusKm);
    },
    [refreshNearbyStores, searchRadiusKm]
  );

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshNearbyStores(pinCoordinates.lat, pinCoordinates.lng, searchRadiusKm);
    }
  }, [isOpen, searchRadiusKm]);

  // Handle Search input change with debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await locationApi.geocode(text);
        setSearchResults(data.results || []);
      } catch (e) {
        console.warn('Search geocoding error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Select search result
  const handleSelectSearchResult = (result: any) => {
    setSearchResults([]);
    setSearchQuery('');
    setPinCoordinates({ lat: result.lat, lng: result.lng });
    setAddressDetails({
      address: result.name,
      locality: result.locality,
      district: result.district,
      state: result.state,
      pincode: result.pincode,
      isRemote: false,
    });
    refreshNearbyStores(result.lat, result.lng, searchRadiusKm);
  };

  // Use Current Location via Browser GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const { latitude, longitude } = pos.coords;
        handleCoordinateChange(latitude, longitude);
      },
      (err) => {
        setIsGeolocating(false);
        console.warn('Geolocation permission denied or timed out:', err);
        // Default smoothly to central Mysuru if denied
        handleCoordinateChange(12.3051, 76.6554);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Submit Remote Area Request
  const handleSubmitRemoteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName || !requestPhone) return;

    setIsSubmittingRequest(true);
    try {
      await locationApi.submitRemoteRequest({
        customerName: requestName,
        customerPhone: requestPhone,
        address: addressDetails.address,
        locality: addressDetails.locality,
        district: addressDetails.district,
        state: addressDetails.state,
        pincode: addressDetails.pincode,
        lat: pinCoordinates.lat,
        lng: pinCoordinates.lng,
        notes: requestNotes,
      });
      setRequestSubmittedSuccess(true);
      setTimeout(() => {
        setIsRequestFormOpen(false);
        setRequestSubmittedSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Failed to submit remote request:', err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Confirm Location selection
  const handleConfirmLocation = () => {
    const deliveringStores = nearbyStoreData.stores.filter((s) => s.isDeliveryEligible);
    const nearest = deliveringStores[0] || nearbyStoreData.stores[0];
    const distanceKm = nearest?.distanceKm || 2.1;
    const isRemote = distanceKm > 5 || !nearbyStoreData.hasDeliveringStores;

    const locObj: DeliveryLocation = {
      id: `loc-${Date.now()}`,
      name: addressDetails.locality || 'Delivery Address',
      address: addressDetails.address,
      landmark: `${addressDetails.district}, ${addressDetails.state}`,
      lat: pinCoordinates.lat,
      lng: pinCoordinates.lng,
      distanceKm,
      estimatedMins: nearest?.minDeliveryMins || 30,
      isRemote,
      localityType: isRemote ? 'remote_village' : 'hyperlocal',
      deliveryFee: nearest?.calculatedDeliveryFeeNum || 0,
      areaTag: isRemote ? 'Remote Area' : 'Local Delivery',
    };

    onSelectLocation(addressDetails.address, locObj);
    onClose();
  };

  if (!isOpen) return null;

  // Build markers for the map: delivery destination pin + nearby registered stores
  const mapMarkers: MapMarkerItem[] = [
    {
      id: 'customer-delivery-pin',
      title: 'Your Delivery Location',
      subtitle: addressDetails.address,
      position: pinCoordinates,
      type: 'customer',
      badge: 'Deliver Here',
      isDraggable: true,
    },
    ...nearbyStoreData.stores.map((s) => ({
      id: s.id,
      title: s.name,
      subtitle: `${s.type} · ${s.distance} (${s.deliveryTime})`,
      position: { lat: s.lat ?? 12.3392, lng: s.lng ?? 76.5927 },
      type: (s.type === 'Supermarket' ? 'store' : 'store') as any,
      badge: s.name.split(' ')[0],
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                Select Delivery Location & Discover Nearby Stores
              </h3>
              <p className="text-xs text-slate-500">
                Interactive Google Map with full India village, town & PIN code search
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar + Current Location button */}
        <div className="pt-3.5 pb-2 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search any village, town, city, locality, or 6-digit PIN code across India..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 max-h-56 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <button
                      key={`${res.name}-${i}`}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full flex items-start gap-2.5 p-2.5 hover:bg-emerald-50/80 rounded-xl text-left transition-colors cursor-pointer border-b border-slate-50 last:border-b-0"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 block truncate">
                          {res.locality || res.name.split(',')[0]}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {res.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Geolocation Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGeolocating}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isGeolocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>{isGeolocating ? 'Locating...' : 'Use Current Location'}</span>
            </button>
          </div>

          {/* Search Radius Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <Sliders className="w-3 h-3 text-emerald-700" />
              <span>Search Radius:</span>
            </span>
            {[5, 10, 25, 50, 100].map((radius) => (
              <button
                key={radius}
                type="button"
                onClick={() => setSearchRadiusKm(radius)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer shrink-0 ${
                  searchRadiusKm === radius
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {radius} km
              </button>
            ))}
            <span className="text-[10px] text-slate-400 ml-auto hidden sm:inline">
              Stores found: {nearbyStoreData.totalStoresFound} ({nearbyStoreData.deliveringStoresCount} delivering)
            </span>
          </div>
        </div>

        {/* Modal Body: Map on Left (55%) & Store / Locality details on Right (45%) */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 mt-2 overflow-hidden">
          {/* Map Column */}
          <div className="w-full lg:w-[54%] h-[260px] sm:h-[320px] lg:h-auto min-h-[240px] flex flex-col rounded-2xl overflow-hidden border border-slate-200">
            <InteractiveGoogleMap
              center={pinCoordinates}
              zoom={13}
              height="100%"
              markers={mapMarkers}
              onSelectCoordinate={(lat, lng) => handleCoordinateChange(lat, lng)}
              interactive={true}
            />
          </div>

          {/* Details & Nearby Stores Column */}
          <div className="w-full lg:w-[46%] flex flex-col min-h-0 overflow-y-auto pr-1 space-y-3">
            {/* Selected Address Card */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  <span>Selected Destination</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {pinCoordinates.lat.toFixed(4)}, {pinCoordinates.lng.toFixed(4)}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {isResolvingAddress ? 'Resolving street & locality...' : addressDetails.address}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
                {addressDetails.locality && (
                  <span className="bg-white px-2 py-0.5 rounded font-medium border border-slate-200">
                    Locality: {addressDetails.locality}
                  </span>
                )}
                {addressDetails.pincode && (
                  <span className="bg-white px-2 py-0.5 rounded font-medium border border-slate-200">
                    PIN: {addressDetails.pincode}
                  </span>
                )}
                {addressDetails.district && (
                  <span className="bg-white px-2 py-0.5 rounded font-medium border border-slate-200">
                    {addressDetails.district}, {addressDetails.state}
                  </span>
                )}
              </div>
            </div>

            {/* If NO registered store delivers to this location: Show required banner */}
            {!nearbyStoreData.hasDeliveringStores && !isLoadingStores && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-amber-950">
                      No registered GroceryGo store currently delivers to this location.
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Your chosen address is outside active store dispatch zones. We can notify
                      local kirana stores or expand route coverage for your area.
                    </p>
                  </div>
                </div>

                {/* 4 Required Action Options */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSearchRadiusKm(50)}
                    className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/70 text-amber-900 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Expand Search Radius (50 km)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRequestFormOpen(true)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                  >
                    Request Delivery in This Area
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinCoordinates({ lat: 12.3392, lng: 76.5927 });
                      handleCoordinateChange(12.3392, 76.5927);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Choose Another Location
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstStore = nearbyStoreData.stores[0];
                      if (firstStore) {
                        setPinCoordinates({ lat: firstStore.lat, lng: firstStore.lng });
                        handleCoordinateChange(firstStore.lat, firstStore.lng);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Explore Nearby Stores
                  </button>
                </div>
              </div>
            )}

            {/* Remote Request Form Dialog */}
            {isRequestFormOpen && (
              <div className="bg-white rounded-2xl p-3.5 border-2 border-emerald-500 shadow-md space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Demand Request for {addressDetails.locality || 'Remote Area'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRequestFormOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {requestSubmittedSuccess ? (
                  <div className="py-3 text-center space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                    <p className="font-bold text-xs text-slate-900">Request Recorded Successfully!</p>
                    <p className="text-[11px] text-slate-500">
                      Our administrator and local delivery partners have received your area demand.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRemoteRequest} className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Your Name</label>
                      <input
                        type="text"
                        required
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        placeholder="e.g. Ramesh Gowda"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={requestPhone}
                        onChange={(e) => setRequestPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Notes / Village details</label>
                      <textarea
                        rows={2}
                        value={requestNotes}
                        onChange={(e) => setRequestNotes(e.target.value)}
                        placeholder="e.g. 50+ households need daily kirana and dairy delivery..."
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingRequest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Submit Remote Area Request</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Surrounding Villages & Localities List */}
            {nearbyStoreData.surroundingLocalities.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span>Surrounding Villages & Towns</span>
                  <span className="text-[10px] text-slate-400 font-normal">Within {searchRadiusKm} km</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {nearbyStoreData.surroundingLocalities.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleCoordinateChange(loc.lat, loc.lng)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded-lg text-[11px] text-slate-700 transition-colors cursor-pointer"
                    >
                      <span>{loc.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        ({loc.distanceKm} km)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Registered Stores List */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Registered Stores Near Location ({nearbyStoreData.stores.length})
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {nearbyStoreData.deliveringStoresCount} Serving This Address
                </span>
              </div>

              {isLoadingStores ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Discovering registered kirana & supermarkets...</span>
                </div>
              ) : nearbyStoreData.stores.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  No stores registered within {searchRadiusKm} km. Try increasing the search radius to 50 km or 100 km.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {nearbyStoreData.stores.map((st) => (
                    <div
                      key={st.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        st.isDeliveryEligible
                          ? 'border-emerald-200 bg-white hover:border-emerald-400'
                          : 'border-slate-200 bg-slate-50/70 opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {st.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {st.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            Road: {st.roadDistanceKm} km · Straight: {st.straightLineDistanceKm} km · {st.deliveryTime}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {st.isDeliveryEligible ? (
                              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Delivers to your address ({st.calculatedDeliveryFee})</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium">
                                {st.deliveryEligibilityReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {onSelectStore && st.isDeliveryEligible && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStore(st.id);
                            handleConfirmLocation();
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shrink-0 transition-colors cursor-pointer"
                        >
                          Shop Here
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Real India coordinates & store inventory verification</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer shadow-emerald-600/20"
            >
              Confirm Delivery Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
