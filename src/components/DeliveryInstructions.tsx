import React from 'react';

interface DeliveryInstructionsProps {
  instructions: string;
  onChange: (value: string) => void;
}

export const DeliveryInstructions: React.FC<DeliveryInstructionsProps> = ({
  instructions,
  onChange,
}) => {
  const maxLength = 200;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      onChange(val);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
      {/* Heading */}
      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
        2. Delivery Instructions (Optional)
      </h2>

      {/* Text Area */}
      <div className="pt-3.5 space-y-1.5">
        <div className="relative">
          <textarea
            rows={3}
            value={instructions}
            onChange={handleChange}
            placeholder="e.g. Call me when you arrive, Leave at gate, Ring the doorbell twice, etc."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Character Counter & Helper */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Delivery partner will see your note on arrival in Mysuru.</span>
          <span
            className={`font-semibold tabular-nums ${
              instructions.length >= maxLength ? 'text-red-600 font-bold' : 'text-slate-500'
            }`}
          >
            {instructions.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
};
