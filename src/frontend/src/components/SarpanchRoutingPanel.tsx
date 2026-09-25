import React, { useState } from 'react';
import type { VillageData } from '../types/disaster';
import { Route, Navigation, Compass, CheckCircle2 } from 'lucide-react';

interface SarpanchRoutingPanelProps {
  village: VillageData;
  onDispatchRoute?: (routePayload: any) => void;
}

export const SarpanchRoutingPanel: React.FC<SarpanchRoutingPanelProps> = ({
  village,
  onDispatchRoute,
}) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [routeInfo, setRouteInfo] = useState<any>(null);

  const handlePanchayatDispatch = async () => {
    setIsDispatching(true);
    try {
      const coords = village.coordinates || (village as any).centroid || [87.86, 22.76];
      const res = await fetch('http://localhost:8000/api/v1/rescue/panchayat-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village_id: village.id,
          village_name: `${village.name} Gram Panchayat`,
          lon: coords[0],
          lat: coords[1],
          target_coords: [coords[0], coords[1]],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRouteInfo(data);
        if (onDispatchRoute) {
          onDispatchRoute(data);
        }
      }
    } catch (err) {
      console.error('Error computing Gram Panchayat rescue route:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 font-sans shadow-xl">
      {/* Header Emblem */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-400/20">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase">
              GRAM PANCHAYAT DISPATCH
            </span>
            <span className="text-xs font-extrabold text-white">
              {village.name} ({village.block})
            </span>
          </div>
        </div>
        <span className="bg-sky-950 text-sky-300 font-bold text-[9px] px-2 py-0.5 rounded border border-sky-800 uppercase">
          SARPANCH PORTAL
        </span>
      </div>

      {/* Main Dispatch Action CTA */}
      <button
        onClick={handlePanchayatDispatch}
        disabled={isDispatching}
        className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-black py-2.5 px-3 rounded-lg text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50 active:scale-[0.98]"
      >
        <Navigation className="w-4 h-4 fill-slate-950" />
        <span>
          {isDispatching
            ? 'Calculating Safe Corridor...'
            : 'DISPATCH RESCUE & TRANSMIT SHORTEST ROUTE'}
        </span>
      </button>

      {/* Route & Directions Output Card */}
      {routeInfo && (
        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/40 flex flex-col gap-2.5 animate-fadeIn">
          {/* Status & Metrics Summary */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-extrabold text-white truncate">
                {routeInfo.origin?.name}
              </span>
            </div>
            <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
              ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2 rounded border border-slate-800 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Total Distance
              </span>
              <strong className="text-cyan-300 font-mono font-extrabold text-sm mt-0.5">
                {routeInfo.distance_km} km
              </strong>
            </div>
            <div className="flex flex-col border-l border-slate-800 pl-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Emergency ETA
              </span>
              <strong className="text-amber-400 font-mono font-extrabold text-sm mt-0.5">
                {routeInfo.eta_minutes} mins
              </strong>
            </div>
          </div>

          {/* Turn-by-Turn Flood Navigation Directions */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Route className="w-3 h-3 text-cyan-400" />
              FLOOD DETOUR NAVIGATION STEPS:
            </span>
            <ul className="flex flex-col gap-1 text-[10px] text-slate-300 font-medium">
              {routeInfo.navigation_directions?.map((step: string, idx: number) => (
                <li
                  key={idx}
                  className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80 flex items-start gap-1.5 leading-snug"
                >
                  <span className="text-cyan-400 font-mono font-bold shrink-0">❖</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SarpanchRoutingPanel;
