import React, { useState, useEffect } from 'react';
import TopNavbar from './components/TopNavbar';
import EmergencyLedger from './components/EmergencyLedger';
import MapViewer from './components/MapViewer';
import DispatchPanel from './components/DispatchPanel';
import { MOCK_VILLAGES } from './data/villages';
import type { VillageData, TelemetryData, GeoJsonFeatureCollection } from './types/disaster';

export const App: React.FC = () => {
  const [villages, setVillages] = useState<VillageData[]>(MOCK_VILLAGES);
  const [selectedVillage, setSelectedVillage] = useState<VillageData>(MOCK_VILLAGES[2]);
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeatureCollection | null>(null);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    upstream_rain_24h_mm: 78.4,
    upstream_rain_48h_mm: 124.2,
    catchment_status: 'HIGH_SURGE_RISK',
    critical_gauges: [],
  });

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  // Fetch Live Environmental Telemetry (Open-Meteo & CWC Gauges)
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/telemetry/live');
        if (!res.ok) throw new Error('Backend telemetry endpoint unreachable');
        const data: TelemetryData = await res.json();
        setTelemetry(data);
      } catch (err) {
        console.warn('Backend server offline. Using local public fallback for telemetry.', err);
        try {
          const fallbackRes = await fetch('/river_gauges.json');
          if (fallbackRes.ok) {
            const gauges = await fallbackRes.json();
            const criticals = gauges.filter(
              (g: any) => g.current_water_level_m >= g.danger_level_m
            );
            setTelemetry({
              upstream_rain_24h_mm: 78.4,
              upstream_rain_48h_mm: 124.2,
              catchment_status: 'HIGH_SURGE_RISK',
              critical_gauges: criticals,
            });
          }
        } catch (fallbackErr) {
          console.error('Fallback telemetry load error:', fallbackErr);
        }
      }
    };

    fetchTelemetry();
  }, []);

  // Fetch Active Inundation GeoJSON FeatureCollection
  useEffect(() => {
    const fetchGeoJsonMap = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/maps/active-inundation');
        if (!res.ok) throw new Error('Backend map endpoint unreachable');
        const data: GeoJsonFeatureCollection = await res.json();
        setGeoJsonData(data);

        // Update village list from GeoJSON feature properties if available
        if (data.features && data.features.length > 0) {
          const extractedVillages = data.features.map((f) => f.properties);
          setVillages(extractedVillages);
        }
      } catch (err) {
        console.warn('Backend map server offline. Fetching local /village_grids.geojson fallback.', err);
        try {
          const fallbackRes = await fetch('/village_grids.geojson');
          if (fallbackRes.ok) {
            const data: GeoJsonFeatureCollection = await fallbackRes.json();
            setGeoJsonData(data);
            if (data.features && data.features.length > 0) {
              const extracted = data.features.map((f) => f.properties);
              setVillages(extracted);
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback GeoJSON load error:', fallbackErr);
        }
      }
    };

    fetchGeoJsonMap();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Header Navbar with Live Telemetry */}
      <TopNavbar
        upstreamRainMm={telemetry.upstream_rain_24h_mm}
        criticalGaugeCount={telemetry.critical_gauges.length}
        catchmentStatus={telemetry.catchment_status}
        onToggleLeftPanel={() => setIsLeftPanelOpen((prev) => !prev)}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
      />

      {/* Main Content Area: Left Ledger + Map Canvas + Right Dispatch */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Emergency Ledger Panel */}
        {isLeftPanelOpen && (
          <EmergencyLedger
            villages={villages}
            selectedVillageId={selectedVillage.id}
            onSelectVillage={(v) => setSelectedVillage(v)}
          />
        )}

        {/* Center Interactive Map */}
        <MapViewer
          geoJsonData={geoJsonData}
          villages={villages}
          selectedVillage={selectedVillage}
          onSelectVillage={(v) => setSelectedVillage(v)}
        />

        {/* Right Dispatch Confirmation Panel */}
        {isRightPanelOpen && (
          <DispatchPanel
            village={selectedVillage}
            isOpen={isRightPanelOpen}
            onClose={() => setIsRightPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
