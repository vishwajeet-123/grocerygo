import React from 'react';
import { Zap, Calendar, Clock } from 'lucide-react';
import { Store } from '../types';

export type DeliveryTimeOption = 'express' | 'scheduled';

interface DeliveryTimeSelectorProps {
  selectedOption: DeliveryTimeOption;
  onSelectOption: (option: DeliveryTimeOption) => void;
  store?: Store;
}

export const DeliveryTimeSelector: React.FC<DeliveryTimeSelectorProps> = ({
  selectedOption,
  onSelectOption,
  store,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
      {/* Heading */}
      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
        3. Delivery Time
      </h2>

      {/* Two Selectable Option Cards Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5">
        {/* Option 1: Express Delivery */}
        <div
          onClick={() => onSelectOption('express')}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            selectedOption === 'express'
              ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/30 shadow-2xs'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <input
            type="radio"
            name="deliveryTimeOption"
            checked={selectedOption === 'express'}
            onChange={() => onSelectOption('express')}
            className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900">
                <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>Express Delivery</span>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Free
              </span>
            </div>

            <p className="text-xs font-extrabold text-emerald-950 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{store?.deliveryTime || '15 - 25 mins'}</span>
            </p>

            <p className="text-[11px] text-slate-500 font-medium">
              Direct dispatch from {store?.name || 'Shree Lakshmi Kirana'}
            </p>
          </div>
        </div>

        {/* Option 2: Scheduled Delivery */}
        <div
          onClick={() => onSelectOption('scheduled')}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            selectedOption === 'scheduled'
              ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/30 shadow-2xs'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <input
            type="radio"
            name="deliveryTimeOption"
            checked={selectedOption === 'scheduled'}
            onChange={() => onSelectOption('scheduled')}
            className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span>Scheduled Delivery</span>
              </div>
              <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Free
              </span>
            </div>

            <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Today, 4:00 PM - 6:00 PM</span>
            </p>

            <p className="text-[11px] text-slate-500 font-medium">
              Convenient evening grocery drop-off slot
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
