import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Home, GraduationCap, Briefcase, MapPin, X, Check } from 'lucide-react';

export interface SavedAddress {
  id: string;
  label: 'Home' | 'College' | 'Work' | 'Other';
  recipientName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressSelectorProps {
  addresses: SavedAddress[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddNewAddress: (address: Omit<SavedAddress, 'id'>) => void;
  onEditAddress: (address: SavedAddress) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for modal
  const [formLabel, setFormLabel] = useState<'Home' | 'College' | 'Work' | 'Other'>('Home');
  const [formName, setFormName] = useState('Vishwajeet');
  const [formPhone, setFormPhone] = useState('+91 98765 43210');
  const [formStreet, setFormStreet] = useState('');
  const [formLandmark, setFormLandmark] = useState('');
  const [formPincode, setFormPincode] = useState('570018');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formError, setFormError] = useState('');

  const openNewModal = () => {
    setEditingAddress(null);
    setFormLabel('Home');
    setFormName('Vishwajeet');
    setFormPhone('+91 98765 43210');
    setFormStreet('');
    setFormLandmark('');
    setFormPincode('570018');
    setFormIsDefault(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setFormLabel(addr.label);
    setFormName(addr.recipientName || 'Vishwajeet');
    setFormPhone(addr.phone || '+91 98765 43210');
    setFormStreet(addr.streetAddress);
    setFormLandmark(addr.landmark || '');
    setFormPincode(addr.pincode || '570018');
    setFormIsDefault(addr.isDefault);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStreet.trim()) {
      setFormError('Street address is required.');
      return;
    }
    if (!formPincode.trim()) {
      setFormError('Pincode is required.');
      return;
    }

    if (editingAddress) {
      onEditAddress({
        ...editingAddress,
        label: formLabel,
        recipientName: formName.trim() || 'Vishwajeet',
        phone: formPhone.trim(),
        streetAddress: formStreet.trim(),
        landmark: formLandmark.trim(),
        pincode: formPincode.trim(),
        isDefault: formIsDefault,
      });
    } else {
      onAddNewAddress({
        label: formLabel,
        recipientName: formName.trim() || 'Vishwajeet',
        phone: formPhone.trim(),
        streetAddress: formStreet.trim(),
        landmark: formLandmark.trim(),
        pincode: formPincode.trim(),
        isDefault: formIsDefault,
      });
    }
    setIsModalOpen(false);
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-3.5 h-3.5" />;
      case 'College':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Work':
        return <Briefcase className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
      {/* Heading + Add New Address */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>1. Delivery Address</span>
        </h2>

        <button
          type="button"
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-emerald-200/60 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards List */}
      <div className="pt-3.5 space-y-3">
        {addresses.map((addr) => {
          const isSelected = addr.id === selectedAddressId;

          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr.id)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/30 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Radio Button */}
                <input
                  type="radio"
                  name="deliveryAddress"
                  checked={isSelected}
                  onChange={() => onSelectAddress(addr.id)}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />

                {/* Address Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {getLabelIcon(addr.label)}
                      <span>{addr.label}</span>
                    </span>

                    {addr.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-medium ml-1">
                      {addr.recipientName} ({addr.phone})
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed pt-0.5">
                    {addr.streetAddress}
                    {addr.landmark ? `, Near ${addr.landmark}` : ''}
                  </p>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-semibold text-slate-500">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetDefault(addr.id);
                        }}
                        className="text-emerald-700 hover:underline cursor-pointer"
                      >
                        Set as default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(addr);
                      }}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(addr.id);
                      }}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">Delete this address?</h3>
            <p className="text-xs text-slate-500 mt-1">
              This address will be removed from your saved demonstration addresses.
            </p>
            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAddress(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingAddress ? 'Edit Address' : 'Add New Delivery Address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-xs">
              {/* Address Label Pills */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Address Type
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Home', 'College', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setFormLabel(lbl)}
                      className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        formLabel === lbl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {getLabelIcon(lbl)}
                      <span>{lbl}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient & Phone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Vishwajeet"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Complete Street Address / House / Flat *
                </label>
                <textarea
                  rows={2}
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  placeholder="e.g. #123, 5th Cross, Hootagalli, Mysuru"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
                  required
                />
              </div>

              {/* Landmark & Pincode */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formLandmark}
                    onChange={(e) => setFormLandmark(e.target.value)}
                    placeholder="e.g. Near Temple Cross"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pincode (Mysuru) *
                  </label>
                  <input
                    type="text"
                    value={formPincode}
                    onChange={(e) => setFormPincode(e.target.value)}
                    placeholder="e.g. 570018"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Set as default checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-700">Set as my default delivery address</span>
              </label>

              {formError && (
                <p className="text-red-600 font-semibold">{formError}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
