import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import TopNavbar from './components/TopNavbar';
import EmergencyLedger from './components/EmergencyLedger';
import MapViewer from './components/MapViewer';
import DispatchPanel from './components/DispatchPanel';
import LoginPage from './components/LoginPage';
import PhoneModal from './components/PhoneModal';
import { MOCK_VILLAGES } from './data/villages';
import type { VillageData, GeoJsonFeatureCollection } from './types/disaster';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth0();
  const [isDemoBypassed, setIsDemoBypassed] = useState<boolean>(false);
  const [officerPhone, setOfficerPhone] = useState<string>(localStorage.getItem('officer_phone') || '');

  // Live Telemetry Header State
  const [upstreamRain, setUpstreamRain] = useState<number | null>(null);
  const [dangerGauges, setDangerGauges] = useState<number | null>(null);
  const [riskStatus, setRiskStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Village & GeoJSON State
  const [villages, setVillages] = useState<VillageData[]>(MOCK_VILLAGES);
  const [selectedVillage, setSelectedVillage] = useState<VillageData>(MOCK_VILLAGES[2]);
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeatureCollection | null>(null);
  const [rescueRoute, setRescueRoute] = useState<any>(null);

  // Scan trigger loading state
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Layout Panel Toggles
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  // Trigger POST /api/v1/pipeline/run-scan and update map layers & ledger
  const runSarScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/pipeline/run-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Run scan request failed');
      const data: GeoJsonFeatureCollection = await res.json();
      setGeoJsonData(data);

      if (data.features && data.features.length > 0) {
        const extractedVillages: VillageData[] = data.features.map((f) => {
          const props = f.properties;
          let coords: [number, number] | undefined = props.coordinates;
          if (!coords && props.centroid && Array.isArray(props.centroid) && props.centroid.length >= 2) {
            coords = [props.centroid[0], props.centroid[1]];
          }
          if (!coords && f.geometry?.type === 'Polygon' && f.geometry.coordinates?.[0]?.[0]) {
            const pt = f.geometry.coordinates[0][0];
            if (Array.isArray(pt) && pt.length >= 2) {
              coords = [pt[0], pt[1]];
            }
          }
          if (!coords) {
            coords = [87.86, 22.76];
          }
          return {
            ...props,
            coordinates: coords,
          };
        });
        setVillages(extractedVillages);
        if (extractedVillages.length > 0) {
          setSelectedVillage((prev) => {
            const matched = extractedVillages.find((v) => v.id === prev?.id);
            return matched || extractedVillages[0];
          });
        }
      }
      setToastMessage('✓ Live SAR Inundation Recomputed');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error executing SAR pipeline scan:', err);
      setToastMessage('Scan execution failed');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsScanning(false);
    }
  };

  // Guarded village selection handler
  const handleSelectVillage = (village: any) => {
    if (!village) return;

    // Safely extract coordinates or fallback to centroid / default
    const rawCoords = village.coordinates || village.centroid;
    let coords: [number, number] = [87.86, 22.76];

    if (
      Array.isArray(rawCoords) &&
      rawCoords.length >= 2 &&
      typeof rawCoords[0] === 'number' &&
      typeof rawCoords[1] === 'number' &&
      !isNaN(rawCoords[0]) &&
      !isNaN(rawCoords[1])
    ) {
      coords = [rawCoords[0], rawCoords[1]];
    }

    const safeVillage: VillageData = {
      ...village,
      coordinates: coords,
    };

    setSelectedVillage(safeVillage);
  };

  // Fetch Live Environmental Telemetry from FastAPI (/api/v1/telemetry/live)
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/telemetry/live');
        if (!res.ok) throw new Error('Backend telemetry endpoint unreachable');
        const data = await res.json();
        
        const rain = data.upstream_dvc_rain_mm ?? data.upstream_rain_24h_mm ?? 78.4;
        const dangerCount = data.cwc_danger_gauges_count ?? (data.critical_gauges ? data.critical_gauges.length : 2);
        const risk = data.risk_status ?? data.catchment_status ?? 'HIGH_SURGE_RISK';

        setUpstreamRain(rain);
        setDangerGauges(dangerCount);
        setRiskStatus(risk);
      } catch (err) {
        console.warn('Backend server offline. Falling back to local river_gauges.json telemetry data.', err);
        try {
          const fallbackRes = await fetch('/river_gauges.json');
          if (fallbackRes.ok) {
            const gauges = await fallbackRes.json();
            const criticals = Array.isArray(gauges)
              ? gauges.filter((g: any) => g.current_water_level_m >= g.danger_level_m)
              : [];
            setUpstreamRain(78.4);
            setDangerGauges(criticals.length);
            setRiskStatus(criticals.length > 0 ? 'HIGH_SURGE_RISK' : 'NORMAL');
          }
        } catch (fallbackErr) {
          console.error('Fallback telemetry load error:', fallbackErr);
        }
      }
    };

    fetchTelemetry();
  }, []);

  // Fetch Active Inundation GeoJSON FeatureCollection from FastAPI (/api/v1/maps/active-inundation)
  useEffect(() => {
    const fetchGeoJsonMap = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/maps/active-inundation');
        if (!res.ok) throw new Error('Backend map endpoint unreachable');
        const data: GeoJsonFeatureCollection = await res.json();
        setGeoJsonData(data);

        // Update village list from GeoJSON feature properties if available
        if (data.features && data.features.length > 0) {
          const extractedVillages: VillageData[] = data.features.map((f) => {
            const props = f.properties;
            let coords: [number, number] | undefined = props.coordinates;
            if (!coords && props.centroid && Array.isArray(props.centroid) && props.centroid.length >= 2) {
              coords = [props.centroid[0], props.centroid[1]];
            }
            if (!coords && f.geometry?.type === 'Polygon' && f.geometry.coordinates?.[0]?.[0]) {
              const pt = f.geometry.coordinates[0][0];
              if (Array.isArray(pt) && pt.length >= 2) {
                coords = [pt[0], pt[1]];
              }
            }
            if (!coords) {
              coords = [87.86, 22.76];
            }
            return {
              ...props,
              coordinates: coords,
            };
          });
          setVillages(extractedVillages);
          if (extractedVillages.length > 0) {
            setSelectedVillage((prev) => {
              const matched = extractedVillages.find((v) => v.id === prev?.id);
              return matched || extractedVillages[0];
            });
          }
        }
      } catch (err) {
        console.warn('Backend map server offline. Fetching local /village_grids.geojson fallback.', err);
        try {
          const fallbackRes = await fetch('/village_grids.geojson');
          if (fallbackRes.ok) {
            const data: GeoJsonFeatureCollection = await fallbackRes.json();
            setGeoJsonData(data);
            if (data.features && data.features.length > 0) {
              const extracted: VillageData[] = data.features.map((f) => {
                const props = f.properties;
                let coords: [number, number] | undefined = props.coordinates;
                if (!coords && props.centroid && Array.isArray(props.centroid) && props.centroid.length >= 2) {
                  coords = [props.centroid[0], props.centroid[1]];
                }
                if (!coords && f.geometry?.type === 'Polygon' && f.geometry.coordinates?.[0]?.[0]) {
                  const pt = f.geometry.coordinates[0][0];
                  if (Array.isArray(pt) && pt.length >= 2) {
                    coords = [pt[0], pt[1]];
                  }
                }
                if (!coords) {
                  coords = [87.86, 22.76];
                }
                return {
                  ...props,
                  coordinates: coords,
                };
              });
              setVillages(extracted);
              if (extracted.length > 0) {
                setSelectedVillage((prev) => {
                  const matched = extracted.find((v) => v.id === prev?.id);
                  return matched || extracted[0];
                });
              }
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback GeoJSON load error:', fallbackErr);
        }
      }
    };

    fetchGeoJsonMap();
  }, []);

  // Loading State Indicator
  if (isLoading && !isDemoBypassed) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          VERIFYING AUTH0 CREDENTIALS...
        </span>
      </div>
    );
  }

  // Auth Guard: Render LoginPage when unauthenticated
  const isUserAuthenticated = isAuthenticated || isDemoBypassed;
  if (!isUserAuthenticated) {
    return <LoginPage onBypassLogin={() => setIsDemoBypassed(true)} />;
  }

  const activeOfficer = user || (isDemoBypassed ? { name: 'Officer In-Charge (BDO)', email: 'bdo.arambagh@wb.gov.in' } : null);

  const handleLogout = () => {
    if (isAuthenticated) {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
    setIsDemoBypassed(false);
  };

  const handleSavePhone = (phone: string) => {
    setOfficerPhone(phone);
    setToastMessage(`✓ Emergency contact registered: ${phone}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-950 font-sans select-none relative">
      {/* Onboarding Phone Number Modal */}
      <PhoneModal
        isOpen={isUserAuthenticated && !officerPhone}
        onSave={handleSavePhone}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm border border-emerald-400/30 animate-pulse">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar with Live Dynamic Telemetry */}
      <TopNavbar
        upstreamRainMm={upstreamRain}
        criticalGaugeCount={dangerGauges}
        catchmentStatus={riskStatus}
        onToggleLeftPanel={() => setIsLeftPanelOpen((prev) => !prev)}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
        onRunScan={runSarScan}
        isScanning={isScanning}
        user={activeOfficer}
        onLogout={handleLogout}
      />

      {/* Main Content Area: Left Ledger + Map Canvas + Right Dispatch */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Emergency Ledger Panel */}
        {isLeftPanelOpen && (
          <EmergencyLedger
            villages={villages}
            selectedVillageId={selectedVillage?.id || ''}
            onSelectVillage={handleSelectVillage}
          />
        )}

        {/* Center Interactive Map */}
        <MapViewer
          geoJsonData={geoJsonData}
          villages={villages}
          selectedVillage={selectedVillage}
          onSelectVillage={handleSelectVillage}
          rescueRoute={rescueRoute}
        />

        {/* Right Dispatch Confirmation Panel */}
        {isRightPanelOpen && selectedVillage && (
          <DispatchPanel
            village={selectedVillage}
            isOpen={isRightPanelOpen}
            onClose={() => setIsRightPanelOpen(false)}
            onDispatchRescue={(route) => setRescueRoute(route)}
            officerPhone={officerPhone}
            onTriggerToast={(msg) => {
              setToastMessage(msg);
              setTimeout(() => setToastMessage(null), 5000);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
