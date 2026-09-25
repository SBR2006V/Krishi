import React, { useState } from 'react';
import {
  ShieldAlert,
  Layers,
  MapPin,
  Radio,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface ControlSidebarProps {
  onTriggerScan?: () => void;
  onToggleRiskPanel?: () => void;
  isRiskPanelOpen?: boolean;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  onTriggerScan,
  onToggleRiskPanel,
  isRiskPanelOpen,
}) => {
  const [selectedRegion, setSelectedRegion] = useState('Hooghly Basin (WB)');
  const [layers, setLayers] = useState({
    inundationMask: true,
    villageBoundaries: true,
    cropHealth: false,
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    if (onTriggerScan) onTriggerScan();
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <aside className="absolute top-0 left-0 h-full w-80 bg-white/90 backdrop-blur-sm z-10 shadow-lg p-6 flex flex-col gap-6 font-sans border-r border-slate-200/80">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              CropSentinel AI
            </h1>
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Monitoring Active
            </p>
          </div>
        </div>
      </div>

      {/* Target Region Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          Target Region
        </label>
        <div className="relative">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer pr-10 shadow-sm"
          >
            <option value="Hooghly Basin (WB)">Hooghly Basin (WB)</option>
            <option value="Khanakul Block I & II">Khanakul Block I & II</option>
            <option value="Bardhaman East">Bardhaman East</option>
            <option value="Nadia Coastal Delta">Nadia Coastal Delta</option>
            <option value="South 24 Parganas">South 24 Parganas</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Layers Checklist */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          Active Layers
        </label>

        <div className="flex flex-col gap-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={layers.inundationMask}
              onChange={(e) =>
                setLayers((prev) => ({
                  ...prev,
                  inundationMask: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition"
            />
            <span className="group-hover:text-slate-900 transition-colors">
              Inundation Mask
            </span>
            <span className="ml-auto text-[10px] bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded-full">
              SAR
            </span>
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={layers.villageBoundaries}
              onChange={(e) =>
                setLayers((prev) => ({
                  ...prev,
                  villageBoundaries: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition"
            />
            <span className="group-hover:text-slate-900 transition-colors">
              Village Boundaries
            </span>
            <span className="ml-auto text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              Vector
            </span>
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={layers.cropHealth}
              onChange={(e) =>
                setLayers((prev) => ({ ...prev, cropHealth: e.target.checked }))
              }
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition"
            />
            <span className="group-hover:text-slate-900 transition-colors">
              NDVI Crop Stress
            </span>
            <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
              Optical
            </span>
          </label>
        </div>
      </div>

      {/* Trigger Scan Button */}
      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <Radio className="w-5 h-5 animate-spin" />
              <span>Scanning Sentinel Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Trigger Manual Scan</span>
            </>
          )}
        </button>

        {onToggleRiskPanel && (
          <button
            onClick={onToggleRiskPanel}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {isRiskPanelOpen ? 'Hide Risk Assessment' : 'Show Risk Assessment'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default ControlSidebar;
