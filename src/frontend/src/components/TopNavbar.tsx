import React from 'react';
import { UserCheck, SlidersHorizontal, AlertOctagon, CloudRain, Activity, LogOut } from 'lucide-react';

interface TopNavbarProps {
  upstreamRainMm?: number | null;
  criticalGaugeCount?: number | null;
  catchmentStatus?: string | null;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  onRunScan?: () => void;
  isScanning?: boolean;
  user?: any;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  upstreamRainMm = null,
  criticalGaugeCount = null,
  catchmentStatus = null,
  onToggleLeftPanel,
  onToggleRightPanel,
  onRunScan,
  isScanning = false,
  user = null,
  onLogout,
}) => {
  const officerName = user?.name || user?.email || 'Officer In-Charge';
  const officerEmail = user?.email || 'officer@wb.gov.in';

  return (
    <header className="h-16 w-full bg-slate-900 text-white flex items-center justify-between px-4 border-b border-slate-800 z-30 select-none shrink-0 font-sans">
      {/* Left Branding Block */}
      <div className="flex items-center gap-3">
        {/* WB Govt Badge */}
        <div className="bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 text-xs rounded-md border border-slate-700 uppercase tracking-wide">
          GOVT OF WEST BENGAL
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-wider uppercase text-white">
              CROPSENTINEL AI
            </span>
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              EMERGENCY ACTIVE
            </span>
          </div>
          <span className="text-xs text-slate-400 block">
            Hooghly Basin Division
          </span>
        </div>
      </div>

      {/* Action & Telemetry Badges */}
      <div className="hidden lg:flex items-center gap-3">
        {/* RUN SENTINEL-1 SAR SCAN Button */}
        <button
          onClick={onRunScan}
          disabled={isScanning}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          {isScanning ? (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              Scanning SAR Backscatter...
            </>
          ) : (
            '⚡ RUN SENTINEL-1 SAR SCAN'
          )}
        </button>

        {/* Telemetry Widgets Pill */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-md text-xs">
          {/* Upstream DVC Rain */}
          <div className="flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-sky-400" />
            <span className="text-slate-300 font-medium">Upstream DVC Rain:</span>
            <strong className="text-sky-300 font-bold">
              {upstreamRainMm !== null && upstreamRainMm !== undefined ? `${upstreamRainMm} mm` : 'Fetching...'}
            </strong>
          </div>

          <div className="w-px h-4 bg-slate-700" />

          {/* CWC Danger Gauges */}
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-medium">CWC Danger Gauges:</span>
            <strong className="text-amber-400 font-bold">
              {criticalGaugeCount !== null && criticalGaugeCount !== undefined ? criticalGaugeCount : 'Fetching...'}
            </strong>
          </div>

          <div className="w-px h-4 bg-slate-700" />

          {/* Catchment Surge Status */}
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
              catchmentStatus === 'HIGH_SURGE_RISK'
                ? 'bg-red-600 text-white'
                : catchmentStatus === 'NORMAL'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {catchmentStatus || 'STANDBY'}
          </span>
        </div>
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

        {/* Profile Pill & Logout Button */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 pl-2.5 pr-1 py-1 rounded-full text-xs ml-2">
          <div className="p-1 rounded-full bg-amber-400 text-slate-950 shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight max-w-[140px] truncate">
            <span className="font-bold text-slate-100 text-[11px] truncate" title={officerName}>
              {officerName}
            </span>
            <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wide truncate" title={officerEmail}>
              {officerEmail}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full transition ml-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
