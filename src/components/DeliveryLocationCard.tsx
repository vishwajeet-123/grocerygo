import React, { useState } from 'react';
import { MapPin, Edit3, X, Check, Home, Briefcase, Tag } from 'lucide-react';

interface DeliveryLocationCardProps {
  locationLabel: string;
  address: string;
  onUpdateLocation: (label: string, address: string) => void;
}

export const DeliveryLocationCard: React.FC<DeliveryLocationCardProps> = ({
  locationLabel,
  address,
  onUpdateLocation,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempLabel, setTempLabel] = useState(locationLabel);
  const [tempAddress, setTempAddress] = useState(address);
  const [error, setError] = useState('');

  const handleOpenModal = () => {
    setTempLabel(locationLabel);
    setTempAddress(address);
    setError('');
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAddress.trim()) {
      setError('Address cannot be blank. Please enter your street address.');
      return;
    }
    onUpdateLocation(tempLabel, tempAddress.trim());
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
        {/* Header: Title + Change button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Delivery Location
          </h2>
          <button
            type="button"
            onClick={handleOpenModal}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Change</span>
          </button>
        </div>

        {/* Content: Pin, Label & Address */}
        <div className="flex items-start gap-3 pt-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                {locationLabel}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                Default
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {address}
            </p>
          </div>
        </div>
      </div>

      {/* Address Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Edit Delivery Address</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Address Type Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Save Address As
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
                    { id: 'Work', icon: <Briefcase className="w-3.5 h-3.5" /> },
                    { id: 'Other', icon: <Tag className="w-3.5 h-3.5" /> },
                  ].map((lbl) => (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => setTempLabel(lbl.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        tempLabel === lbl.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lbl.icon}
                      <span>{lbl.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Complete Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Complete Delivery Address *
                </label>
                <textarea
                  rows={3}
                  value={tempAddress}
                  onChange={(e) => {
                    setTempAddress(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. #123, 5th Cross, Near Primary Health Center, Hootagalli, Mysuru - 570018"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white resize-none"
                />
                {error && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{error}</p>
                )}
              </div>

              {/* Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-2.5 text-[11px] text-emerald-800 leading-relaxed">
                📍 Delivery available directly to Hootagalli, Koorgalli, Belavadi, Vijayanagar, and Metagalli in Mysuru.
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Address</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
