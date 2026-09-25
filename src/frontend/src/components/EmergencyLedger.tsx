import React, { useState } from 'react';
import type { VillageData, ThreatLevel } from '../types/disaster';
import { Search, ExternalLink, Activity, Radio } from 'lucide-react';

interface EmergencyLedgerProps {
  villages: VillageData[];
  selectedVillageId: string;
  onSelectVillage: (village: VillageData) => void;
}

export const EmergencyLedger: React.FC<EmergencyLedgerProps> = ({
  villages,
  selectedVillageId,
  onSelectVillage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [threatFilter, setThreatFilter] = useState<'ALL' | ThreatLevel>('ALL');

  const filteredVillages = villages.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesThreat =
      threatFilter === 'ALL' || v.threatLevel === threatFilter;
    return matchesSearch && matchesThreat;
  });

  const criticalCount = villages.filter(
    (v) => v.threatLevel === 'CRITICAL'
  ).length;

  return (
    <aside className="w-[360px] h-full bg-[#f8fafc] flex flex-col border-r border-slate-300 z-10 shadow-2xl font-sans select-none shrink-0">
      {/* Top Banner Header */}
      <div className="bg-[#0b1626] text-white p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
            OFFICIAL DISASTER REGISTER
          </span>
          <span className="bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            LIVE SAR DATA
          </span>
        </div>
        <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
          EMERGENCY LEDGER
        </h2>
        <p className="text-[11px] text-slate-300 mt-0.5 font-medium leading-tight">
          Hooghly Basin Flood Inundation & Crop Risk Assessment
        </p>
      </div>

      {/* Search & Filter Section */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-col gap-2.5 shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search village or block..."
            className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
          />
        </div>

        {/* Threat Filter Tabs */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            Threat Filter:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setThreatFilter('ALL')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold transition-all ${
                threatFilter === 'ALL'
                  ? 'bg-sky-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setThreatFilter('CRITICAL')}
              className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-all ${
                threatFilter === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              CRITICAL
            </button>
            <button
              onClick={() => setThreatFilter('HIGH')}
              className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-all ${
                threatFilter === 'HIGH'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              HIGH
            </button>
          </div>
        </div>
      </div>

      {/* Cards Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-[#f1f5f9]/70 scrollbar-thin">
        {filteredVillages.map((village) => {
          const isSelected = village.id === selectedVillageId;

          return (
            <div
              key={village.id}
              onClick={() => onSelectVillage(village)}
              className={`bg-white rounded-lg p-3 border transition-all cursor-pointer shadow-sm relative ${
                isSelected
                  ? 'border-sky-600 ring-2 ring-sky-500/30 shadow-md bg-sky-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow'
              }`}
            >
              {/* Card Header: ID & Threat Badge */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-sky-800">
                  {village.id}{' '}
                  <span className="text-slate-500 font-medium">
                    {village.district}
                  </span>
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                    village.threatLevel === 'CRITICAL'
                      ? 'bg-red-600 text-white shadow-sm'
                      : village.threatLevel === 'HIGH'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : village.threatLevel === 'MEDIUM'
                      ? 'bg-amber-400 text-slate-900 shadow-sm'
                      : 'bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  {village.threatLevel}
                </span>
              </div>

              {/* Village Title & Block */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1 group">
                  {village.name}
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mb-2.5">
                Block: {village.block}
              </p>

              {/* 3 Metrics Box */}
              <div className="grid grid-cols-3 gap-1 bg-amber-50/40 p-2 rounded border border-amber-200/60 mb-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-extrabold text-red-700 uppercase tracking-tight flex items-center gap-0.5">
                    <Activity className="w-2.5 h-2.5 text-red-600" /> FLOOD
                    DEPTH
                  </span>
                  <span className="text-xs font-black text-slate-900 mt-0.5">
                    {village.floodDepthCm} cm
                  </span>
                </div>
                <div className="flex flex-col border-l border-amber-200/80 pl-1.5">
                  <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-tight">
                    CROP LOSS
                  </span>
                  <span className="text-xs font-black text-amber-700 mt-0.5">
                    {village.cropLossPercent}%
                  </span>
                </div>
                <div className="flex flex-col border-l border-amber-200/80 pl-1.5">
                  <span className="text-[9px] font-extrabold text-sky-800 uppercase tracking-tight">
                    FARMERS
                  </span>
                  <span className="text-xs font-black text-slate-900 mt-0.5">
                    {village.farmersCount}
                  </span>
                </div>
              </div>

              {/* Footer info line */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                <span>
                  Crop:{' '}
                  <strong className="text-slate-800">{village.cropType}</strong>
                </span>
                <span className="text-slate-400">
                  SAR & :{' '}
                  <strong className="text-slate-700">
                    {village.sarDecibels}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Status Bar */}
      <div className="bg-[#0b1626] text-white px-3 py-2 text-[10px] font-bold flex items-center justify-between border-t border-slate-800 shrink-0">
        <span className="tracking-wide">
          TOTAL MONITORED:{' '}
          <strong className="text-amber-400 font-black">
            {villages.length} VILLAGES
          </strong>
        </span>
        <span className="bg-red-600 text-white font-extrabold px-2 py-0.5 rounded text-[9px] tracking-wider uppercase shadow-sm">
          {criticalCount} CRITICAL ALERTS
        </span>
      </div>
    </aside>
  );
};

export default EmergencyLedger;
