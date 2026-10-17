import React, { useState } from 'react';
import {
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  ArrowLeft,
  Lock,
} from 'lucide-react';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'wallet';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  totalAmount: number;
  onPay: () => void;
  onBackToAddress: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  totalAmount,
  onPay,
  onBackToAddress,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Amazon Pay');

  // Test card form state
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('421');
  const [cardName, setCardName] = useState('Vishwajeet W');

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('grocerygo@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const paymentOptions: {
    id: PaymentMethod;
    name: string;
    sub: string;
    icon: React.ReactNode;
    badges: string[];
  }[] = [
    {
      id: 'upi',
      name: 'UPI (Google Pay, PhonePe, Paytm, etc.)',
      sub: 'Instant contactless payment with zero fee',
      icon: <Smartphone className="w-4 h-4 text-emerald-600" />,
      badges: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'],
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      sub: 'All major debit and credit cards supported',
      icon: <CreditCard className="w-4 h-4 text-blue-600" />,
      badges: ['Visa', 'Mastercard', 'RuPay'],
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      sub: 'Transfer directly from Indian netbanking accounts',
      icon: <Building2 className="w-4 h-4 text-indigo-600" />,
      badges: ['SBI', 'HDFC', 'ICICI', 'Axis'],
    },
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      sub: 'Pay with cash or UPI QR at your doorstep',
      icon: <Banknote className="w-4 h-4 text-emerald-700" />,
      badges: ['Cash', 'UPI on delivery'],
    },
    {
      id: 'wallet',
      name: 'Wallets',
      sub: 'Pay using connected digital balance',
      icon: <Wallet className="w-4 h-4 text-amber-600" />,
      badges: ['Amazon Pay', 'Flipkart', 'MobiKwik'],
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Payment Methods Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pb-3.5 border-b border-slate-100">
          Select Payment Method
        </h2>

        {/* Payment Methods Radio List */}
        <div className="pt-3.5 space-y-2.5">
          {paymentOptions.map((opt) => {
            const isSelected = selectedMethod === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => onSelectMethod(opt.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/30 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={isSelected}
                    onChange={() => onSelectMethod(opt.id)}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                        {opt.icon}
                        <span>{opt.name}</span>
                      </div>

                      {/* Brand pills */}
                      <div className="flex items-center gap-1">
                        {opt.badges.map((b) => (
                          <span
                            key={b}
                            className="text-[9px] font-bold bg-white text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {opt.sub}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Detail Container Based on Selected Method */}
      {selectedMethod === 'upi' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              UPI Payment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan the QR code with any UPI app or enter your UPI ID.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left: Stylized Demonstration QR Code */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-36 h-36 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center relative">
                {/* SVG QR Code Pattern */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-slate-900"
                  fill="currentColor"
                >
                  {/* Outer corner boxes */}
                  <rect x="0" y="0" width="28" height="28" rx="4" />
                  <rect x="4" y="4" width="20" height="20" fill="white" rx="2" />
                  <rect x="8" y="8" width="12" height="12" fill="currentColor" rx="1" />

                  <rect x="72" y="0" width="28" height="28" rx="4" />
                  <rect x="76" y="4" width="20" height="20" fill="white" rx="2" />
                  <rect x="80" y="8" width="12" height="12" fill="currentColor" rx="1" />

                  <rect x="0" y="72" width="28" height="28" rx="4" />
                  <rect x="4" y="76" width="20" height="20" fill="white" rx="2" />
                  <rect x="8" y="80" width="12" height="12" fill="currentColor" rx="1" />

                  {/* Demonstration QR Data Cells */}
                  <rect x="36" y="4" width="8" height="8" />
                  <rect x="52" y="4" width="12" height="8" />
                  <rect x="36" y="16" width="16" height="8" />
                  <rect x="4" y="36" width="8" height="12" />
                  <rect x="16" y="36" width="8" height="8" />
                  <rect x="36" y="36" width="24" height="24" rx="4" fill="#047857" />
                  <rect x="72" y="36" width="12" height="12" />
                  <rect x="88" y="36" width="8" height="8" />
                  <rect x="36" y="68" width="8" height="12" />
                  <rect x="52" y="68" width="12" height="8" />
                  <rect x="72" y="68" width="12" height="12" />
                  <rect x="88" y="76" width="8" height="12" />
                </svg>
              </div>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2.5">
                Scan with any UPI App
              </span>
              <span className="text-[9px] text-slate-400">
                (Demonstration QR Placeholder)
              </span>
            </div>

            {/* Right: UPI ID & Supported Apps */}
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Demonstration UPI ID
                </span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    grocerygo@upi
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Supported UPI Apps Row */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  Supported UPI Applications:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Google Pay</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>PhonePe</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Paytm UPI</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>BHIM UPI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'card' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Card Details (Demonstration Interface)
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Test Mode
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 text-[11px] text-amber-800">
            ⚠️ <strong>Notice:</strong> This is a UI prototype. Do not enter real credit or debit card credentials.
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="•••• •••• •••• ••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  CVV
                </label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Full Name"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'netbanking' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Select Your Bank
          </h3>
          <p className="text-xs text-slate-500">
            Choose your bank to simulate netbanking redirect during this prototype phase.
          </p>

          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="HDFC Bank">HDFC Bank</option>
            <option value="State Bank of India">State Bank of India (SBI)</option>
            <option value="ICICI Bank">ICICI Bank</option>
            <option value="Axis Bank">Axis Bank</option>
            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
            <option value="Karnataka Bank">Karnataka Bank</option>
          </select>
        </div>
      )}

      {selectedMethod === 'cod' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-2 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Cash on Delivery (COD)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pay ₹{totalAmount} in cash or scan the delivery agent's UPI QR code at your doorstep in Hootagalli, Mysuru. Exact change is appreciated!
          </p>
        </div>
      )}

      {selectedMethod === 'wallet' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Select Wallet
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {['Amazon Pay', 'Flipkart SuperCoins', 'MobiKwik'].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWallet(w)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedWallet === w
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                    : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Payment Button & Encrypted Message */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Back to Address Button */}
          <button
            type="button"
            onClick={onBackToAddress}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Address</span>
          </button>

          {/* Prominent Payment Button */}
          <button
            type="button"
            onClick={onPay}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-sm sm:text-base rounded-xl shadow-md transition-all cursor-pointer shadow-emerald-700/20"
          >
            <Lock className="w-4 h-4 stroke-[2.5]" />
            <span>Pay ₹{totalAmount}</span>
          </button>
        </div>

        {/* Security Message */}
        <div className="flex items-center justify-center gap-2 pt-1 text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Your payment is secured with encrypted processing when a payment provider is connected.
          </span>
        </div>
      </div>
    </div>
  );
};
