import React, { useState, useEffect } from 'react';
import type { VillageData } from '../types/disaster';
import FeaturePhoneMockup from './FeaturePhoneMockup';
import SarpanchRoutingPanel from './SarpanchRoutingPanel';
import ReportExportButton from './ReportExportButton';
import {
  Play,
  Pause,
  CheckCircle2,
  PhoneCall,
  Volume2,
  ShieldCheck,
  Droplets,
  Waves,
  X,
  Sparkles,
} from 'lucide-react';

interface DispatchPanelProps {
  village: VillageData;
  isOpen: boolean;
  onClose: () => void;
  onDispatchRescue?: (routeGeoJson: any) => void;
  officerPhone?: string;
  officerName?: string;
  onTriggerToast?: (msg: string) => void;
}

export const DispatchPanel: React.FC<DispatchPanelProps> = ({
  village,
  isOpen,
  onClose,
  onDispatchRescue,
  officerPhone = '',
  officerName = 'Saptarshi Ghosh',
  onTriggerToast,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  // Gemini 2.5 Flash Advisory State
  const [advisory, setAdvisory] = useState<{
    sms_bengali: string;
    voice_transcript_bengali: string;
    bdo_summary: string;
  } | null>(null);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState<boolean>(false);

  // Citizen Verification & Recalibration State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);

  // Rescue Dispatch State
  const [isRescueDispatched, setIsRescueDispatched] = useState(false);
  const [rescueData, setRescueData] = useState<any>(null);

  const activePhone = officerPhone || village.pradhanContact || '+91 98305 11094';

  // Automatically trigger Gemini API advisory generation when selected village changes
  useEffect(() => {
    if (!village) return;
    setIsLoadingAdvisory(true);
    fetch('http://localhost:8000/api/v1/alerts/generate-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ village }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.sms_bengali) {
          setAdvisory(data);
        }
      })
      .catch((err) => {
        console.error('Error generating Gemini 2.5 Flash advisory:', err);
      })
      .finally(() => {
        setIsLoadingAdvisory(false);
      });
  }, [village?.id, village?.name]);

  const handleRequestCitizenConfirmation = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/alerts/simulate-citizen-response?village_id=${village.id}&sar_inundation_pct=65.0&yes_votes=38&no_votes=4`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data = await res.json();
        setVerificationData(data);
      }
    } catch (err) {
      console.error('Error fetching citizen verification response:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRescueDispatch = async () => {
    setIsRescueDispatched(true);
    try {
      const coords = village.coordinates || (village as any).centroid || [87.86, 22.76];
      const res = await fetch('http://localhost:8000/api/v1/rescue/dispatch-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village_id: village.id,
          lon: coords[0],
          lat: coords[1],
          target_coords: [coords[0], coords[1]],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRescueData(data);
        if (onDispatchRescue && (data.route_geojson || data)) {
          onDispatchRescue(data);
        }
      }
    } catch (err) {
      console.error('Error dispatching rescue team:', err);
    }
  };

  const handleTransmit = async () => {
    setIsDispatched(true);
    // Also trigger rescue route dispatch automatically on transmit
    handleRescueDispatch();

    const toastMsg = `Emergency Bengali alert broadcasted to ${activePhone} and local field networks.`;
    if (onTriggerToast) {
      onTriggerToast(toastMsg);
    }

    try {
      // 1. Post to transmit-sms API
      await fetch('http://localhost:8000/api/v1/alerts/transmit-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village_id: village.id,
          phone: activePhone,
          message: village.smsBengali,
        }),
      });

      // 2. Post to scan trigger API
      const response = await fetch('http://localhost:8000/api/v1/scan/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dev-token',
        },
        body: JSON.stringify({
          bbox: [87.5, 22.5, 88.5, 23.5],
          village_id: village.id,
          phone_number: activePhone,
          language: 'Bengali',
        }),
      });

      if (!response.ok) {
        throw new Error('Backend pipeline failed to trigger');
      }

      const data = await response.json();
      console.log('Pipeline Job Queued:', data);
      setTimeout(() => setIsDispatched(false), 5000);
    } catch (error) {
      console.error('Error triggering AI pipeline / SMS alert:', error);
      setTimeout(() => setIsDispatched(false), 3000);
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
      className={`w-[360px] h-full bg-[#f8fafc] flex flex-col border-l border-slate-300 z-10 shadow-2xl font-sans select-none shrink-0 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'
      }`}
    >
      {/* Blue Header Banner */}
      <div className="bg-[#0b1626] text-white p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1">
            GEMINI & ELEVENLABS GATEWAY
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              VERIFIED
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
        {/* Target Location Card */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              TARGET LOCATION:
            </span>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                village.threatLevel === 'CRITICAL'
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
            <span className="text-xs font-bold text-slate-500">{village.district}</span>
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
              <span className="font-extrabold text-red-700 mt-0.5">{floodedAcres} Acres</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 font-medium">
            <span className="text-slate-600">
              Pradhan Contact:{' '}
              <strong className="text-slate-900 font-bold">{village.pradhanContact}</strong>
            </span>
            <span className="text-red-600 font-extrabold">{village.farmersCount} Farmers</span>
          </div>
        </div>

        {/* 1. Citizen Verification & AI Recalibration Card */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
              📡 CITIZEN VERIFICATION & AI RECALIBRATION
            </span>
            {verificationData?.threshold_met && (
              <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase">
                ✓ CONFIRMED &gt; 60%
              </span>
            )}
          </div>

          <button
            onClick={handleRequestCitizenConfirmation}
            disabled={isVerifying}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 font-extrabold py-2 px-3 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isVerifying ? (
              <span>Collecting Ground Feedback...</span>
            ) : (
              <span>📡 REQUEST CITIZEN CONFIRMATION</span>
            )}
          </button>

          {verificationData && (
            <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                <span>Ground Reports (Yes vs No):</span>
                <span className="text-emerald-700 font-extrabold">
                  {verificationData.confirmed_flood} YES / {verificationData.false_alarm} NO
                </span>
              </div>

              {/* Yes vs No Progress Visualizer */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full transition-all duration-500"
                  style={{ width: `${verificationData.yes_pct}%` }}
                />
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${verificationData.no_pct}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-medium">Recalibrated AI Confidence:</span>
                  <strong className="text-sky-700 font-black text-xs">
                    {verificationData.recalibrated_confidence}%
                  </strong>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-2">
                  <span className="text-slate-500 font-medium">Verified Flood Score:</span>
                  <strong className="text-red-600 font-black text-xs">
                    {verificationData.verified_flood_score} / 100
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gram Panchayat / Sarpanch Shortest Route Rescue Dispatch Panel */}
        <SarpanchRoutingPanel
          village={village}
          onDispatchRoute={onDispatchRescue}
        />

        {/* 2. Automated Rescue Team Dispatch Action Card */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2.5">
          <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
            🚨 AUTOMATED RESCUE DISPATCH
          </span>

          <button
            onClick={handleRescueDispatch}
            disabled={isRescueDispatched}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-80 text-white font-black py-2.5 px-3 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wide"
          >
            <span>🚨 ALERT RESCUE TEAMS (SMS / CALL)</span>
          </button>

          {rescueData && (
            <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-black text-emerald-900">
                <span>Status: Rescue Team Dispatched</span>
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase">
                  ETA: {rescueData.eta_minutes} MIN
                </span>
              </div>
              <div className="bg-slate-900 text-cyan-300 font-mono text-[10px] p-2 rounded border border-slate-800 leading-tight">
                🚒 {rescueData.origin?.name || rescueData.assigned_unit} Dispatched | Shortest Route: {rescueData.distance_km} km | ETA: {rescueData.eta_minutes} mins
              </div>
              <div className="text-[11px] text-slate-700 font-medium leading-tight">
                <div>
                  Unit: <strong>{rescueData.assigned_unit}</strong>
                </div>
                <div>
                  Distance: <strong>{rescueData.distance_km} km</strong>
                </div>
                <div>
                  Leader: <strong>{rescueData.team_leader} ({rescueData.contact})</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gemini 2.5 Flash BDO Summary Card */}
        {advisory?.bdo_summary && (
          <div className="bg-purple-950/90 text-purple-100 p-3 rounded-lg border border-purple-700/60 shadow-sm flex flex-col gap-1.5 font-sans">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-purple-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                BDO EXECUTIVE ACTION SUMMARY
              </span>
              <span className="bg-purple-800 text-purple-200 text-[9px] px-1.5 py-0.5 rounded">
                GEMINI 2.5 FLASH
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-purple-100">
              {advisory.bdo_summary}
            </p>
          </div>
        )}

        {/* Feature Phone Mockup */}
        <FeaturePhoneMockup
          smsContent={advisory?.sms_bengali || village.smsBengali}
          bdoSummary={advisory?.bdo_summary}
          recipientPhone={activePhone}
          locationName={`${village.name}`}
          isLoading={isLoadingAdvisory}
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
                  className={`bg-sky-700 h-full transition-all duration-300 ${
                    isPlayingAudio ? 'w-2/5 animate-pulse' : 'w-0'
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
              SMS Broadcast & Telephony IVR sent to {village.farmersCount} registered farmers!
            </span>
          </div>
        )}
      </div>

      {/* Bottom Dispatch CTA & Official Report Export */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0 flex flex-col gap-2">
        <ReportExportButton
          selectedVillage={village}
          officerName={officerName}
        />
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