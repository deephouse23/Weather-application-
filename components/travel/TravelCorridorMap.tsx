'use client';

/**
 * Travel Corridor Map
 *
 * Renders US interstate corridors on an OpenLayers map, color-coded by
 * driving weather severity (green/yellow/orange/red).
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

import 'ol/ol.css';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Style, Stroke } from 'ol/style';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Overlay from 'ol/Overlay';
import type { FeatureLike } from 'ol/Feature';

import { SEVERITY_COLORS, type SeverityLevel } from '@/lib/services/travel-corridor-service';

const CARTO_DARK_URL = 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
const CONUS_CENTER: [number, number] = [-98.5795, 39.8283];
const CONUS_ZOOM = 4;

interface CorridorData {
  name: string;
  score: number;
  level: SeverityLevel;
  color: string;
  hazard: string;
  path: number[][];
  segments: Array<{ lat: number; lon: number; score: number; level: SeverityLevel; color: string }>;
}

interface TravelCorridorMapProps {
  corridors: CorridorData[];
  isLoading: boolean;
}

export default function TravelCorridorMap({ corridors, isLoading }: TravelCorridorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<OLMap | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupOverlayRef = useRef<Overlay | null>(null);

  const [popupContent, setPopupContent] = useState<{ name: string; score: number; level: string; hazard: string; color: string } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: CARTO_DARK_URL,
        attributions: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        crossOrigin: 'anonymous',
      }),
      opacity: 0.9,
    });

    const map = new OLMap({
      target: mapRef.current,
      layers: [baseLayer],
      view: new View({
        center: fromLonLat(CONUS_CENTER),
        zoom: CONUS_ZOOM,
      }),
    });

    mapInstanceRef.current = map;

    if (popupRef.current) {
      const overlay = new Overlay({
        element: popupRef.current,
        autoPan: { animation: { duration: 250 } },
        positioning: 'bottom-center',
        offset: [0, -10],
      });
      map.addOverlay(overlay);
      popupOverlayRef.current = overlay;
    }

    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const props = feature.getProperties();
        if (props.corridorName) {
          setPopupContent({
            name: props.corridorName,
            score: props.corridorScore,
            level: props.corridorLevel,
            hazard: props.corridorHazard,
            color: props.corridorColor,
          });
          popupOverlayRef.current?.setPosition(evt.coordinate);
        }
      } else {
        setPopupContent(null);
        popupOverlayRef.current?.setPosition(undefined);
      }
    });

    map.on('pointermove', (evt) => {
      const hit = map.forEachFeatureAtPixel(evt.pixel, () => true);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    const updateMapSize = () => mapInstanceRef.current?.updateSize();
    setTimeout(updateMapSize, 0);
    setTimeout(updateMapSize, 100);
    setTimeout(updateMapSize, 500);

    const resizeObserver = new ResizeObserver(updateMapSize);
    if (mapRef.current) resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      map.setTarget(undefined);
      map.dispose();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update corridors on map
  useEffect(() => {
    if (!mapInstanceRef.current || corridors.length === 0) return;
    const map = mapInstanceRef.current;

    if (vectorLayerRef.current) {
      map.removeLayer(vectorLayerRef.current);
    }

    const features = corridors.map((corridor) => {
      const coords = corridor.path.map(([lon, lat]) => fromLonLat([lon, lat]));
      const feature = new Feature({
        geometry: new LineString(coords),
        corridorName: corridor.name,
        corridorScore: corridor.score,
        corridorLevel: corridor.level,
        corridorHazard: corridor.hazard,
        corridorColor: corridor.color,
      });

      const width = corridor.score >= 75 ? 5 : corridor.score >= 50 ? 4 : corridor.score >= 25 ? 3 : 2;

      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: corridor.color + 'cc',
            width,
            lineCap: 'round',
            lineJoin: 'round',
          }),
        })
      );

      return feature;
    });

    const vectorSource = new VectorSource({ features });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 100,
    });

    map.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;
  }, [corridors]);

  const closePopup = useCallback(() => {
    setPopupContent(null);
    popupOverlayRef.current?.setPosition(undefined);
  }, []);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden border border-border" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <p className="text-sm font-mono text-muted-foreground animate-pulse">LOADING CORRIDOR DATA...</p>
        </div>
      )}

      {/* Popup */}
      <div ref={popupRef} className={cn('absolute', !popupContent && 'hidden')}>
        {popupContent && (
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-mono font-bold text-sm">{popupContent.name}</span>
              <button onClick={closePopup} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: popupContent.color }} />
              <span className="text-xs font-mono text-muted-foreground uppercase">{popupContent.level} - Score {popupContent.score}</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground">{popupContent.hazard}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
        <span className="text-foreground font-bold">DRIVING CONDITIONS</span>
        <LegendItem color={SEVERITY_COLORS.green} label="Clear" />
        <LegendItem color={SEVERITY_COLORS.yellow} label="Caution" />
        <LegendItem color={SEVERITY_COLORS.orange} label="Hazardous" />
        <LegendItem color={SEVERITY_COLORS.red} label="Dangerous" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
