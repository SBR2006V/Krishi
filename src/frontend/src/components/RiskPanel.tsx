import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  Droplets,
  Building2,
  AlertOctagon,
  MessageSquare,
} from 'lucide-react';

interface RiskPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ isOpen, onClose }) => {
  const [smsText, setSmsText] = useState(
    'হুগলি ব্লকে বন্যার সম্ভাবনা। নিরাপদ স্থানে সরে যান।'
  );
  const [isSent, setIsSent] = useState(false);

  const handleDispatchSMS = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
    }, 3000);
  };

  return (
    <div
      className={`absolute top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-md z-20 shadow-2xl p-6 flex flex-col gap-4 transition-transform duration-300 border-l border-slate-200/80 font-sans ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900">Risk Assessment</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Village Details & Risk Metrics Grid */}
      <div className="flex flex-col gap-3">
        {/* Village Field */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Village
            </span>
          </div>
          <span className="text-sm font-bold text-slate-900">Khanakul</span>
        </div>

        {/* Risk Level Badge */}
        <div className="flex items-center justify-between p-3.5 bg-red-50/80 rounded-xl border border-red-200/80">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              Risk Level
            </span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white tracking-wide shadow-sm animate-pulse">
            CRITICAL
          </span>
        </div>

        {/* Flooded Area Metric */}
        <div className="flex items-center justify-between p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/80">
          <div className="flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Flooded Area
            </span>
          </div>
          <span className="text-sm font-extrabold text-blue-900">
            12.5 acres
          </span>
        </div>
      </div>

      {/* Emergency Alert Message Section */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            Bengali SMS Alert Content
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Auto-generated
          </span>
        </label>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          rows={4}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all resize-none shadow-sm"
        />
      </div>

      {/* Feedback Alert Toast */}
      {isSent && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Emergency SMS broadcast successfully dispatched!</span>
        </div>
      )}

      {/* Dispatch SMS Button */}
      <div className="mt-auto">
        <button
          onClick={handleDispatchSMS}
          disabled={isSent}
          className="w-full bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-emerald-400" />
          <span>Dispatch SMS Alert</span>
        </button>
      </div>
    </div>
  );
};

export default RiskPanel;
