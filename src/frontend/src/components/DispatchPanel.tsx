import React, { useState } from 'react';
import type { VillageData } from '../types/disaster';
import FeaturePhoneMockup from './FeaturePhoneMockup';
import {
  Play,
  Pause,
  CheckCircle2,
  PhoneCall,
  Volume2,
  ShieldCheck,
  Droplets,
  Waves,
} from 'lucide-react';

interface DispatchPanelProps {
  village: VillageData;
  isOpen: boolean;
  onClose: () => void;
}

export const DispatchPanel: React.FC<DispatchPanelProps> = ({
  village,
  isOpen,
  onClose
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const handleTransmit = async () => {
    setIsDispatched(true);

    try {
      // Trigger the real FastAPI backend pipeline
      const response = await fetch('http://localhost:8000/api/v1/scan/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({
          bbox: [87.5, 22.5, 88.5, 23.5], // Hooghly Basin coordinates
          village_id: village.id,
          phone_number: village.pradhanContact,
          language: "Bengali"
        })
      });

      if (!response.ok) {
        throw new Error('Backend pipeline failed to trigger');
      }

      const data = await response.json();
      console.log("Pipeline Job Queued:", data);

      // Reset dispatch state after 5 seconds to show success
      setTimeout(() => setIsDispatched(false), 5000);

    } catch (error) {
      console.error("Error triggering AI pipeline:", error);
      setIsDispatched(false);
      alert("Failed to connect to the AI Backend. Ensure FastAPI is running on port 8000.");
    }
  };

  const floodedAcres =
    village.flooded_acres !== undefined
      ? village.flooded_acres
      : village.threatLevel === 'CRITICAL'
        ? 18.2
        : village.threatLevel === 'HIGH'
          ? 8.4
          : village.threatLevel === 'MEDIUM'
            ? 3.1
            : 0.0;

  return (
    <aside
      className={`w-[360px] h-full bg-[#f8fafc] flex flex-col border-l border-slate-300 z-10 shadow-2xl font-sans select-none shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'
        }`}
    >
      {/* Blue Header Banner */}
      <div className="bg-[#0b1626] text-white p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1">
            GEMINI & ELEVENLABS GATEWAY
          </span>
          <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" />
            VERIFIED
          </span>
        </div>
        <h2 className="text-lg font-black tracking-tight text-white mt-0.5 uppercase">
          DISPATCH CONFIRMATION
        </h2>
        <p className="text-[11px] text-slate-300 mt-0.5 font-medium leading-tight">
          Multilingual Telephony & IVR Alert Engine
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 bg-slate-100/90 scrollbar-thin">
        {/* Target Location & River Metadata Card */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              TARGET LOCATION:
            </span>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${village.threatLevel === 'CRITICAL'
                  ? 'bg-red-600 text-white'
                  : village.threatLevel === 'HIGH'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
            >
              {village.threatLevel} THREAT
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-black text-slate-900">
              {village.name} ({village.block})
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {village.district}
            </span>
          </div>

          {/* River & Affected Cropland Acres */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-200 text-xs mt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Waves className="w-3 h-3 text-sky-600" /> Associated River
              </span>
              <span className="font-bold text-slate-900 mt-0.5">
                {village.river || 'Damodar River'}
              </span>
            </div>
            <div className="flex flex-col border-l border-slate-200 pl-2">
              <span className="text-[9px] font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-1">
                <Droplets className="w-3 h-3 text-red-600" /> Flooded Cropland
              </span>
              <span className="font-extrabold text-red-700 mt-0.5">
                {floodedAcres} Acres
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 font-medium">
            <span className="text-slate-600">
              Pradhan Contact:{' '}
              <strong className="text-slate-900 font-bold">
                {village.pradhanContact}
              </strong>
            </span>
            <span className="text-red-600 font-extrabold">
              {village.farmersCount} Farmers
            </span>
          </div>
        </div>

        {/* Feature Phone Mockup */}
        <FeaturePhoneMockup
          smsContent={village.smsBengali}
          recipientPhone={village.pradhanContact}
          locationName={`${village.name}`}
        />

        {/* ElevenLabs Audio Prompt Widget */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-sky-700" />
              ELEVENLABS VOICE AUDIO PROMPT
            </span>
            <span className="bg-sky-800 text-white font-black px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
              BENGALI-V2
            </span>
          </div>

          {/* Audio Player Card */}
          <div className="bg-sky-50/60 p-2.5 rounded-lg border border-sky-200/80 flex items-center gap-3">
            <button
              onClick={() => setIsPlayingAudio((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-sky-700 hover:bg-sky-800 text-white flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer"
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                <span>ElevenLabs Voice Stream</span>
                <span className="text-sky-800 font-mono">
                  {isPlayingAudio ? '00:14 / 00:35' : '00:00 / 00:35'}
                </span>
              </div>
              <div className="w-full bg-sky-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`bg-sky-700 h-full transition-all duration-300 ${isPlayingAudio ? 'w-2/5 animate-pulse' : 'w-0'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert Toast */}
        {isDispatched && (
          <div className="bg-emerald-600 text-white p-3 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>
              SMS Broadcast & Telephony IVR sent to {village.farmersCount}{' '}
              registered farmers!
            </span>
          </div>
        )}
      </div>

      {/* Bottom Dispatch CTA */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <button
          onClick={handleTransmit}
          disabled={isDispatched}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-80"
        >
          <PhoneCall className="w-4 h-4 text-amber-300" />
          <span>TRANSMIT SMS + VOICE BROADCAST</span>
        </button>
      </div>
    </aside>
  );
};

export default DispatchPanel;