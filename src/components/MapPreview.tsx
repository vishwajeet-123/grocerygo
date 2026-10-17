import React, { useState } from 'react';
import { MapPin, Navigation, Store, X, Clock, ExternalLink, ShieldAlert } from 'lucide-react';
import { STORES } from '../data/stores';

interface MapPreviewProps {
  currentLocationName?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  currentLocationName = 'Hootagalli, Mysuru',
}) => {
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const [selectedPinStore, setSelectedPinStore] = useState(STORES[0]);

  return (
    <>
      {/* Compact Map Preview Card */}
      <div className="relative w-full sm:w-[260px] lg:w-[280px] h-[115px] rounded-2xl overflow-hidden border border-emerald-200/80 shadow-xs shrink-0 group">
        {/* Background Map Graphic */}
        <img
          src="/src/assets/images/mysuru_local_map_1792253010616.jpg"
          alt="Map preview of Mysuru stores"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Semi-transparent protective gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />

        {/* Store Pins on Card */}
        <div className="absolute top-2 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-2xs border border-white">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
          <span>6 Stores in Mysuru</span>
        </div>

        {/* Bottom Bar: Action button */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white drop-shadow-xs truncate max-w-[130px]">
            {currentLocationName}
          </span>
          <button
            type="button"
            onClick={() => setIsFullMapOpen(true)}
            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Navigation className="w-3 h-3" />
            <span>View on Map</span>
          </button>
        </div>
      </div>

      {/* Full Interactive Map View Modal */}
      {isFullMapOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Mysuru Hyperlocal Store Map</h3>
                  <p className="text-xs text-slate-500">
                    Showing 6 nearby supermarkets and local kirana stores around {currentLocationName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullMapOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: Split Map + Store List */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[360px]">
              
              {/* Map Canvas (7 cols) */}
              <div className="md:col-span-7 relative bg-slate-100 overflow-hidden min-h-[260px] md:min-h-full">
                <img
                  src="/src/assets/images/mysuru_local_map_1792253010616.jpg"
                  alt="Mysuru store locator map"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Overlaid Pin Cards */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl shadow-md border border-slate-100 max-w-[240px]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedPinStore.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedPinStore.address}</p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                    <span className="font-semibold text-slate-700">{selectedPinStore.distance}</span>
                    <span className="font-bold text-emerald-700">{selectedPinStore.deliveryTime}</span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-slate-500 border border-slate-100">
                  Phase 2 Hyperlocal Preview · Google Maps API integration ready for Phase 3
                </div>
              </div>

              {/* Stores Sidebar (5 cols) */}
              <div className="md:col-span-5 p-3 overflow-y-auto max-h-[50vh] md:max-h-none space-y-2 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
                  Nearby Stores in Mysuru
                </p>
                {STORES.map((st) => {
                  const isSel = selectedPinStore.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedPinStore(st)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSel
                          ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {st.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          st.type === 'Supermarket' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {st.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{st.address}</p>
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {st.distance}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {st.deliveryTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">Selected Store: <strong className="text-slate-800">{selectedPinStore.name}</strong> ({selectedPinStore.distance})</span>
              <button
                type="button"
                onClick={() => setIsFullMapOpen(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
