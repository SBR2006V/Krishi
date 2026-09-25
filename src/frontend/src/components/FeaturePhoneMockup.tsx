import React from 'react';
import { Signal, Battery, PhoneCall, PhoneOff } from 'lucide-react';

interface FeaturePhoneMockupProps {
  smsContent: string;
  recipientPhone: string;
  locationName: string;
}

export const FeaturePhoneMockup: React.FC<FeaturePhoneMockupProps> = ({
  smsContent,
  recipientPhone,
  locationName,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {/* Label Row */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-extrabold text-slate-700 uppercase tracking-wide">
          GEMINI BENGALI SMS MOCKUP
        </span>
        <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
          FEATURE PHONE DISPLAY
        </span>
      </div>

      {/* Feature Phone Body */}
      <div className="bg-slate-950 p-3.5 rounded-2xl border-2 border-slate-800 shadow-2xl flex flex-col items-center gap-3 w-full max-w-[340px] mx-auto">
        {/* Speaker grille */}
        <div className="w-12 h-1 bg-slate-800 rounded-full mb-0.5" />

        {/* Green Backlit LCD Screen */}
        <div className="w-full bg-[#052e16] border-2 border-emerald-950 rounded-lg p-2.5 text-[#22c55e] flex flex-col justify-between shadow-inner h-52 overflow-hidden select-text">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-[9px] border-b border-[#14532d] pb-1 mb-1.5 font-bold tracking-tight text-[#4ade80]">
            <div className="flex items-center gap-1">
              <Signal className="w-2.5 h-2.5" />
              <span>4G RSSI</span>
            </div>
            <div className="flex items-center gap-1">
              <span>85%</span>
              <Battery className="w-2.5 h-2.5" />
              <span>18:42 PM</span>
            </div>
          </div>

          {/* Recipient Header */}
          <div className="text-[10px] font-bold text-[#86efac] mb-1 leading-tight">
            TO: {recipientPhone} ({locationName})
          </div>

          {/* Bengali SMS Content */}
          <div className="text-[11px] font-medium leading-snug overflow-y-auto flex-1 text-[#4ade80] pr-1 scrollbar-thin">
            {smsContent}
          </div>

          {/* Screen Softkeys */}
          <div className="flex items-center justify-between text-[10px] font-bold pt-1.5 border-t border-[#14532d] mt-1 text-[#86efac]">
            <span>[ Options ]</span>
            <span>[ Next ]</span>
          </div>
        </div>

        {/* Feature Phone Keypad Section */}
        <div className="w-full flex flex-col gap-1.5 pt-1">
          {/* Main Action Keys: Call / OK / End */}
          <div className="grid grid-cols-3 gap-1.5">
            <button className="bg-emerald-900/90 hover:bg-emerald-800 text-emerald-300 rounded py-1 flex items-center justify-center gap-1 text-[9px] font-black tracking-wider uppercase border border-emerald-700/50 shadow-sm active:translate-y-0.5 transition-transform">
              <PhoneCall className="w-2.5 h-2.5" />
              CALL
            </button>
            <div className="bg-slate-800 text-slate-300 rounded py-1 text-center text-[9px] font-bold border border-slate-700 flex items-center justify-center">
              OK
            </div>
            <button className="bg-red-950/90 hover:bg-red-900 text-red-300 rounded py-1 flex items-center justify-center gap-1 text-[9px] font-black tracking-wider uppercase border border-red-800/50 shadow-sm active:translate-y-0.5 transition-transform">
              <PhoneOff className="w-2.5 h-2.5" />
              END
            </button>
          </div>

          {/* 3x4 Number Keypad */}
          <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-slate-400">
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              1 <span className="text-[7px] text-slate-600 block">-</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              2 <span className="text-[7px] text-slate-600 block">ABC</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              3 <span className="text-[7px] text-slate-600 block">DEF</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              4 <span className="text-[7px] text-slate-600 block">GHI</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              5 <span className="text-[7px] text-slate-600 block">JKL</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              6 <span className="text-[7px] text-slate-600 block">MNO</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              7 <span className="text-[7px] text-slate-600 block">PQRS</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              8 <span className="text-[7px] text-slate-600 block">TUV</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded py-0.5 text-center">
              9 <span className="text-[7px] text-slate-600 block">WXYZ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePhoneMockup;
