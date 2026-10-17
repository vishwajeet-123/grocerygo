import React from 'react';
import { MapPin, X, Check, Building2, Store } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
}

const MYSURU_AREAS = [
  {
    name: 'Hootagalli',
    address: 'Hootagalli, Mysuru, Karnataka',
    storesCount: '6 stores (3 Kirana, 3 Supermarkets)',
    pincode: '570018',
  },
  {
    name: 'Gokulam 3rd Stage',
    address: 'Gokulam, Mysuru, Karnataka',
    storesCount: '8 stores nearby',
    pincode: '570002',
  },
  {
    name: 'Jayalakshmipuram',
    address: 'Jayalakshmipuram, Mysuru, Karnataka',
    storesCount: '7 stores nearby',
    pincode: '570012',
  },
  {
    name: 'Kuvempunagar',
    address: 'Kuvempunagar, Mysuru, Karnataka',
    storesCount: '9 stores nearby',
    pincode: '570023',
  },
  {
    name: 'Saraswathipuram',
    address: 'Saraswathipuram, Mysuru, Karnataka',
    storesCount: '6 stores nearby',
    pincode: '570009',
  },
  {
    name: 'Vijayanagar 2nd Stage',
    address: 'Vijayanagar, Mysuru, Karnataka',
    storesCount: '10 stores nearby',
    pincode: '570017',
  },
  {
    name: 'Metagalli / KRS Road',
    address: 'Metagalli, Mysuru, Karnataka',
    storesCount: '5 stores nearby',
    pincode: '570016',
  },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Delivery Location</h3>
              <p className="text-xs text-slate-500">Mysuru, Karnataka Delivery Zones</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 my-3">
          GroceryGo delivers fresh produce and groceries from supermarkets and local kirana stores to your doorstep across Mysuru.
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {MYSURU_AREAS.map((area) => {
            const isSelected = selectedLocation.includes(area.name);
            return (
              <button
                key={area.name}
                type="button"
                onClick={() => {
                  onSelectLocation(area.address);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                      {area.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {area.address} · PIN: {area.pincode}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                      {area.storesCount}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Demonstration location data (No GPS permission needed)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
