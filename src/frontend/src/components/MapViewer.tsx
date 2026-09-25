import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { VillageData, GeoJsonFeatureCollection } from '../types/disaster';
import { MapPin, Radio } from 'lucide-react';

interface MapViewerProps {
  geoJsonData: GeoJsonFeatureCollection | null;
  villages: VillageData[];
  selectedVillage: VillageData;
  onSelectVillage: (village: VillageData) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  geoJsonData,
  villages,
  selectedVillage,
  onSelectVillage,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: selectedVillage.coordinates,
      zoom: 10.5,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center with smooth flyTo animation on selected village change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: selectedVillage.coordinates,
        zoom: 12,
        essential: true,
        duration: 1400,
      });
    }
  }, [selectedVillage]);

  // Load GeoJSON Source and Layers (Boundaries & Flooded Zones Fill)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJsonData) return;

    const addGeoJsonLayers = () => {
      if (map.getSource('active-inundation-src')) {
        const src = map.getSource('active-inundation-src') as maplibregl.GeoJSONSource;
        src.setData(geoJsonData as any);
        return;
      }

      // Add GeoJSON Source
      map.addSource('active-inundation-src', {
        type: 'geojson',
        data: geoJsonData as any,
      });

      // Add Fill Layer for Flooded Zones using MapLibre case expression
      map.addLayer({
        id: 'flooded-zones-fill',
        type: 'fill',
        source: 'active-inundation-src',
        paint: {
          'fill-color': [
            'case',
            ['>', ['get', 'flooded_acres'], 0],
            '#dc2626', // Red for flooded blocks
            '#16a34a', // Green for safe blocks
          ],
          'fill-opacity': [
            'case',
            ['>', ['get', 'flooded_acres'], 0],
            0.45,
            0.15,
          ],
        },
      });

      // Add Line Layer for Authentic Block Boundaries
      map.addLayer({
        id: 'block-boundaries-line',
        type: 'line',
        source: 'active-inundation-src',
        paint: {
          'line-color': '#1e3a8a', // Dark blue boundary lines
          'line-width': 2,
        },
      });

      // Polygon Click Event -> Select Block & flyTo
      map.on('click', 'flooded-zones-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const featureProps = e.features[0].properties as any;
        const matchedVillage = villages.find(
          (v) => v.id === featureProps.id || v.name === featureProps.name
        );
        if (matchedVillage) {
          onSelectVillage(matchedVillage);
        }
      });

      // Change cursor to pointer on hover over polygons
      map.on('mouseenter', 'flooded-zones-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'flooded-zones-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.isStyleLoaded()) {
      addGeoJsonLayers();
    } else {
      map.once('load', addGeoJsonLayers);
    }
  }, [geoJsonData, villages, onSelectVillage]);

  // Render Custom Village Markers
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Safely process GeoJSON features or villages array to render markers
    if (geoJsonData?.features && geoJsonData.features.length > 0) {
      geoJsonData.features.forEach((feature) => {
        let point: [number, number] | null = null;

        // Safely extract point from Polygon geometry or Point geometry
        if (feature.geometry?.type === 'Polygon') {
          const firstVertex = feature.geometry.coordinates?.[0]?.[0];
          if (
            Array.isArray(firstVertex) &&
            firstVertex.length >= 2 &&
            typeof firstVertex[0] === 'number' &&
            typeof firstVertex[1] === 'number'
          ) {
            point = [firstVertex[0], firstVertex[1]];
          }
        } else if (feature.geometry?.type === 'Point') {
          const pt = feature.geometry.coordinates as any;
          if (
            Array.isArray(pt) &&
            pt.length >= 2 &&
            typeof pt[0] === 'number' &&
            typeof pt[1] === 'number'
          ) {
            point = [pt[0], pt[1]];
          }
        }

        // Fallback to feature properties centroid or coordinates if needed
        const props = feature.properties as any;
        if (!point && Array.isArray(props?.centroid) && props.centroid.length >= 2) {
          point = [props.centroid[0], props.centroid[1]];
        }
        if (!point && Array.isArray(props?.coordinates) && props.coordinates.length >= 2) {
          point = [props.coordinates[0], props.coordinates[1]];
        }

        // Validate that point is a valid 2-element array of numbers before calling setLngLat
        if (
          !point ||
          !Array.isArray(point) ||
          point.length < 2 ||
          typeof point[0] !== 'number' ||
          typeof point[1] !== 'number'
        ) {
          return;
        }

        const v = feature.properties;
        const isSelected = v.id === selectedVillage.id;

        const el = document.createElement('div');
        el.className =
          'cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110';

        const colorBg =
          v.threatLevel === 'CRITICAL'
            ? 'bg-red-600 border-red-800 text-white'
            : v.threatLevel === 'HIGH'
            ? 'bg-amber-600 border-amber-800 text-white'
            : v.threatLevel === 'MEDIUM'
            ? 'bg-amber-400 border-amber-600 text-slate-950'
            : 'bg-emerald-600 border-emerald-800 text-white';

        const codeLetter =
          v.threatLevel === 'CRITICAL'
            ? 'C'
            : v.threatLevel === 'HIGH'
            ? 'H'
            : v.threatLevel === 'MEDIUM'
            ? 'M'
            : 'L';

        el.innerHTML = `
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-lg border-2 ${colorBg} ${
          isSelected ? 'ring-4 ring-sky-400 scale-110 z-20' : ''
        }">
            <span>${v.name}</span>
            <span class="bg-slate-950/40 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">${codeLetter}</span>
          </div>
        `;

        el.addEventListener('click', () => {
          onSelectVillage(v);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(point)
          .addTo(currentMap);

        markersRef.current.push(marker);
      });
    } else {
      villages.forEach((v) => {
        let point: [number, number] | null = null;
        const rawCoords = v.coordinates || (v as any).centroid;
        if (
          Array.isArray(rawCoords) &&
          rawCoords.length >= 2 &&
          typeof rawCoords[0] === 'number' &&
          typeof rawCoords[1] === 'number'
        ) {
          point = [rawCoords[0], rawCoords[1]];
        }

        // Validate that point is a valid 2-element array of numbers before calling setLngLat
        if (
          !point ||
          !Array.isArray(point) ||
          point.length < 2 ||
          typeof point[0] !== 'number' ||
          typeof point[1] !== 'number'
        ) {
          return;
        }

        const isSelected = v.id === selectedVillage.id;

        const el = document.createElement('div');
        el.className =
          'cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110';

        const colorBg =
          v.threatLevel === 'CRITICAL'
            ? 'bg-red-600 border-red-800 text-white'
            : v.threatLevel === 'HIGH'
            ? 'bg-amber-600 border-amber-800 text-white'
            : v.threatLevel === 'MEDIUM'
            ? 'bg-amber-400 border-amber-600 text-slate-950'
            : 'bg-emerald-600 border-emerald-800 text-white';

        const codeLetter =
          v.threatLevel === 'CRITICAL'
            ? 'C'
            : v.threatLevel === 'HIGH'
            ? 'H'
            : v.threatLevel === 'MEDIUM'
            ? 'M'
            : 'L';

        el.innerHTML = `
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-lg border-2 ${colorBg} ${
          isSelected ? 'ring-4 ring-sky-400 scale-110 z-20' : ''
        }">
            <span>${v.name}</span>
            <span class="bg-slate-950/40 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">${codeLetter}</span>
          </div>
        `;

        el.addEventListener('click', () => {
          onSelectVillage(v);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(point)
          .addTo(currentMap);

        markersRef.current.push(marker);
      });
    }
  }, [geoJsonData, villages, selectedVillage, onSelectVillage]);

  return (
    <div className="flex-1 h-full relative overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0" />

      {/* Top Left Floating Box: SAR FLOOD OVERLAY Legend */}
      <div className="absolute top-4 left-4 z-10 bg-[#0b1626]/95 backdrop-blur-md text-white p-3 rounded-lg border border-slate-700 shadow-2xl w-64 select-none font-sans">
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
          <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
          <h4 className="text-xs font-black tracking-wide uppercase text-white">
            SAR FLOOD OVERLAY
          </h4>
        </div>

        <div className="flex flex-col gap-1.5 text-[11px] font-bold">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm shadow-red-600/50" />
              <span className="text-slate-200">CRITICAL (&gt;100cm flood)</span>
            </div>
            <span className="text-amber-400 font-extrabold">2 Villages</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-slate-200">HIGH (75-100cm flood)</span>
            </div>
            <span className="text-amber-400 font-extrabold">1 Village</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
              <span className="text-slate-200">MEDIUM (30-75cm flood)</span>
            </div>
            <span className="text-amber-400 font-extrabold">1 Village</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-slate-200">LOW (&lt;30cm flood)</span>
            </div>
            <span className="text-amber-400 font-extrabold">1 Village</span>
          </div>
        </div>
      </div>

      {/* Bottom Left Floating Box: CENTERED ON VILLAGE */}
      <div className="absolute bottom-6 left-4 z-10 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-xl flex items-center gap-3 font-sans">
        <div className="p-2 rounded-lg bg-sky-100 text-sky-800">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
            CENTERED ON VILLAGE
          </span>
          <span className="text-sm font-black text-slate-900 leading-tight">
            {selectedVillage.name} ({selectedVillage.block})
          </span>
          <span className="text-[10px] font-bold text-slate-500 font-mono">
            Coords: {selectedVillage.coordinates[0]},{' '}
            {selectedVillage.coordinates[1]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapViewer;
