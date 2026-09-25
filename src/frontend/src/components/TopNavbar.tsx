import React from 'react';
import { UserCheck, SlidersHorizontal, AlertOctagon, CloudRain, Activity } from 'lucide-react';

interface TopNavbarProps {
  upstreamRainMm?: number;
  criticalGaugeCount?: number;
  catchmentStatus?: string;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  upstreamRainMm = 78.4,
  criticalGaugeCount = 2,
  catchmentStatus = 'HIGH_SURGE_RISK',
  onToggleLeftPanel,
  onToggleRightPanel,
}) => {
  return (
    <header className="h-14 w-full bg-[#0b1626] text-white flex items-center justify-between px-4 z-30 shadow-md border-b border-slate-800 shrink-0 font-sans">
      {/* Left Branding Group */}
      <div className="flex items-center gap-3">
        {/* WB Govt Yellow Badge */}
        <div className="bg-amber-400 text-slate-950 font-black px-2.5 py-1 text-[11px] leading-tight tracking-tight rounded-sm shadow-sm text-center uppercase">
          Govt of West Bengal
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-wide uppercase text-white">
              CROP SENTINEL AI
            </span>
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              EMERGENCY ACTIVE
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-300">
            Department of Agriculture & Disaster Management - Hooghly Basin Division
          </span>
        </div>
      </div>

      {/* Live Environmental Telemetry Indicators */}
      <div className="hidden md:flex items-center gap-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-lg">
        {/* Upstream Rain */}
        <div className="flex items-center gap-1.5 text-xs">
          <CloudRain className="w-4 h-4 text-sky-400" />
          <span className="text-slate-300 font-medium">Upstream DVC Rain:</span>
          <strong className="text-sky-300 font-extrabold">{upstreamRainMm} mm</strong>
        </div>

        <div className="w-px h-4 bg-slate-700" />

        {/* CWC Danger Gauges */}
        <div className="flex items-center gap-1.5 text-xs">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-medium">CWC Danger Gauges:</span>
          <strong className="text-amber-400 font-extrabold">{criticalGaugeCount}</strong>
        </div>

        <div className="w-px h-4 bg-slate-700" />

        {/* Catchment Surge Status */}
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
            catchmentStatus === 'HIGH_SURGE_RISK'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {catchmentStatus}
        </span>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Emergency Ledger Toggle */}
        <button
          onClick={onToggleLeftPanel}
          className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Emergency Ledger</span>
        </button>

        {/* Dispatch Control Toggle */}
        <button
          onClick={onToggleRightPanel}
          className="bg-sky-700/80 hover:bg-sky-600 text-white font-semibold text-xs px-3 py-1.5 rounded border border-sky-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Dispatch Control</span>
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1 rounded-full text-xs ml-2">
          <div className="p-1 rounded-full bg-amber-400 text-slate-950">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-100 text-[11px]">
              Officer In-Charge
            </span>
            <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wide">
              AUTHORIZED FIELD OFFICER
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
