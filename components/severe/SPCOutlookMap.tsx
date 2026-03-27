'use client';

/**
 * SPC Convective Outlook Map
 *
 * Renders SPC outlook GeoJSON polygons on an OpenLayers map.
 * Shows categorical, tornado, hail, and wind risk areas.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

// OpenLayers imports
import 'ol/ol.css';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';
import type { FeatureLike } from 'ol/Feature';

import { RISK_LABELS } from '@/lib/services/spc-outlook-service';
import type { SPCOutlookDay, SPCOutlookType } from '@/lib/services/spc-outlook-service';

const CARTO_DARK_URL = 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
const CONUS_CENTER: [number, number] = [-98.5795, 39.8283];
const CONUS_ZOOM = 4;

interface SPCOutlookMapProps {
  day: SPCOutlookDay;
  type: SPCOutlookType;
}

export default function SPCOutlookMap({ day, type }: SPCOutlookMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<OLMap | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupOverlayRef = useRef<Overlay | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupContent, setPopupContent] = useState<{ label: string; label2: string; fill: string } | null>(null);

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

    // Create popup overlay
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

    // Handle map click
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const props = feature.getProperties();
        if (props.LABEL) {
          setPopupContent({
            label: props.LABEL,
            label2: props.LABEL2 || RISK_LABELS[props.LABEL] || props.LABEL,
            fill: props.fill || '#888',
          });
          popupOverlayRef.current?.setPosition(evt.coordinate);
        }
      } else {
        setPopupContent(null);
        popupOverlayRef.current?.setPosition(undefined);
      }
    });

    // Cursor on hover
    map.on('pointermove', (evt) => {
      const hit = map.forEachFeatureAtPixel(evt.pixel, () => true);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    // Handle resize
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

  // Fetch and render outlook data when day/type changes
  const fetchOutlook = useCallback(async () => {
    if (!mapInstanceRef.current) return;

    setIsLoading(true);
    setError(null);
    setPopupContent(null);
    popupOverlayRef.current?.setPosition(undefined);

    try {
      const res = await fetch(`/api/weather/spc-outlook?day=${day}&type=${type}`);
      if (!res.ok) throw new Error('Failed to fetch outlook');
      const geojson = await res.json();

      const map = mapInstanceRef.current;

      // Remove existing vector layer
      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
      }

      if (!geojson.features || geojson.features.length === 0) {
        vectorLayerRef.current = null;
        setIsLoading(false);
        return;
      }

      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geojson, {
          featureProjection: 'EPSG:3857',
        }),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature: FeatureLike) => {
          const props = feature.getProperties();
          return new Style({
            fill: new Fill({ color: (props.fill || '#888888') + '99' }),
            stroke: new Stroke({ color: props.stroke || '#ffffff', width: 2 }),
          });
        },
        zIndex: 100,
      });

      map.addLayer(vectorLayer);
      vectorLayerRef.current = vectorLayer;

      // Fit view to features extent
      const extent = vectorSource.getExtent();
      if (extent && isFinite(extent[0])) {
        map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 7, duration: 500 });
      }
    } catch (err) {
      console.error('[SPC Outlook Map]', err);
      setError('Unable to load SPC outlook data');
    } finally {
      setIsLoading(false);
    }
  }, [day, type]);

  useEffect(() => {
    const timer = setTimeout(fetchOutlook, 100);
    return () => clearTimeout(timer);
  }, [fetchOutlook]);

  const closePopup = useCallback(() => {
    setPopupContent(null);
    popupOverlayRef.current?.setPosition(undefined);
  }, []);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden border border-border" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <p className="text-sm font-mono text-muted-foreground animate-pulse">LOADING SPC OUTLOOK...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <p className="text-sm font-mono text-orange-400">{error}</p>
        </div>
      )}

      {/* Popup */}
      <div ref={popupRef} className={cn('absolute', !popupContent && 'hidden')}>
        {popupContent && (
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg min-w-[180px]">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm border border-white/30"
                  style={{ backgroundColor: popupContent.fill }}
                />
                <span className="font-mono font-bold text-sm">{popupContent.label}</span>
              </div>
              <button onClick={closePopup} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <p className="text-xs font-mono text-muted-foreground">{popupContent.label2}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
        <span className="text-foreground font-bold">SPC OUTLOOK</span>
        {type === 'cat' ? (
          <>
            <LegendItem color="#C1E9C1" label="TSTM" />
            <LegendItem color="#66A366" label="MRGL" />
            <LegendItem color="#FFE066" label="SLGT" />
            <LegendItem color="#FFA500" label="ENH" />
            <LegendItem color="#FF0000" label="MDT" />
            <LegendItem color="#FF00FF" label="HIGH" />
          </>
        ) : (
          <>
            <LegendItem color="#66A366" label="2%" />
            <LegendItem color="#886644" label="5%" />
            <LegendItem color="#FFE066" label="10%" />
            <LegendItem color="#FF0000" label="15%" />
            <LegendItem color="#FF00FF" label="30%+" />
            <LegendItem color="#882288" label="SIGSVR" />
          </>
        )}
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
