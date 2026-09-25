export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface VillageData {
  id: string; // e.g. "V-101"
  district: string; // e.g. "Hooghly"
  name: string; // e.g. "Khanakul-I"
  block: string; // e.g. "Khanakul"
  threatLevel: ThreatLevel;
  floodDepthCm: number;
  cropLossPercent: number;
  farmersCount: number;
  cropType: string;
  sarDecibels: string;
  coordinates: [number, number]; // [lng, lat]
  pradhanContact: string;
  smsBengali: string;
  river?: string;
  baseline_cropland_acres?: number;
  flooded_acres?: number;
}

export interface TelemetryData {
  upstream_rain_24h_mm: number;
  upstream_rain_48h_mm: number;
  catchment_status: string;
  critical_gauges: Array<{
    station_name: string;
    river: string;
    current_water_level_m: number;
    danger_level_m: number;
  }>;
  timestamp?: string;
}

export interface GeoJsonFeatureProperties extends VillageData {}

export interface GeoJsonFeature {
  type: 'Feature';
  id: string;
  properties: GeoJsonFeatureProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}
