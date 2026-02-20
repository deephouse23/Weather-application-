/**
 * 16-Bit Weather Platform - Turbulence Map Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Real PIREP (Pilot Report) turbulence map using OpenLayers
 * Shows actual pilot-reported turbulence observations across CONUS
 */

'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { RefreshCw, Plane, AlertTriangle, Clock, Mountain, X } from 'lucide-react';
import { safeStorage } from '@/lib/safe-storage';

// OpenLayers imports
import 'ol/ol.css';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';

// PIREP data interface (matches API response)
interface PIREPData {
  id: string;
  receiptTime: string;
  observationTime: string;
  aircraftRef: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  turbulenceType: string | null;
  turbulenceIntensity: string | null;
  turbulenceBaseFt: number | null;
  turbulenceTopFt: number | null;
  icingType: string | null;
  icingIntensity: string | null;
  icingBaseFt: number | null;
  icingTopFt: number | null;
  tempC: number | null;
  windDir: number | null;
  windSpeedKt: number | null;
  reportType: string;
  rawText: string;
}

interface TurbulenceMapProps {
  initialAltitude?: string;
  initialHours?: number;
}

// Turbulence intensity colors - 4-level scale
const TURBULENCE_COLORS: Record<string, string> = {
  NEG: '#22c55e',      // Green - Negative/Smooth
  'NEG-LGT': '#22c55e', // Green - Light
  LGT: '#22c55e',      // Green - Light
  'LGT-MOD': '#eab308', // Yellow - Light-Moderate
  MOD: '#eab308',      // Yellow - Moderate
  'MOD-SEV': '#f97316', // Orange - Moderate-Severe
  SEV: '#f97316',      // Orange - Severe
  'SEV-EXTRM': '#ef4444', // Red - Severe-Extreme
  EXTRM: '#ef4444',    // Red - Extreme
};

// Map turbulence intensity to severity level
function getSeverityLevel(intensity: string | null): 'smooth' | 'light' | 'moderate' | 'severe' | 'extreme' {
  if (!intensity) return 'smooth';
  const upper = intensity.toUpperCase();
  if (upper === 'NEG' || upper === 'SMOOTH') return 'smooth';
  if (upper.includes('LGT') && !upper.includes('MOD')) return 'light';
  if (upper.includes('MOD') && !upper.includes('SEV')) return 'moderate';
  if (upper.includes('SEV') && !upper.includes('EXTRM')) return 'severe';
  if (upper.includes('EXTRM') || upper.includes('EXTREME')) return 'extreme';
  return 'light';
}

// Get color for turbulence intensity - uses same matching logic as getSeverityLevel
function getTurbulenceColor(intensity: string | null): string {
  if (!intensity) return TURBULENCE_COLORS.NEG;
  const upper = intensity.toUpperCase();
  // First try exact match
  if (TURBULENCE_COLORS[upper]) return TURBULENCE_COLORS[upper];
  // Fall back to substring matching for non-standard values
  if (upper === 'SMOOTH') return TURBULENCE_COLORS.NEG;
  if (upper.includes('EXTRM') || upper.includes('EXTREME')) return TURBULENCE_COLORS.EXTRM;
  if (upper.includes('SEV') && !upper.includes('EXTRM')) return TURBULENCE_COLORS.SEV;
  if (upper.includes('MOD') && !upper.includes('SEV')) return TURBULENCE_COLORS.MOD;
  if (upper.includes('LGT') && !upper.includes('MOD')) return TURBULENCE_COLORS.LGT;
  return TURBULENCE_COLORS.NEG;
}

// CartoDB Dark Matter base map
const CARTO_DARK_URL = 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

// Cache configuration
const PIREP_CACHE_KEY = 'bitweather_pirep_cache';
const PIREP_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// CONUS bounds
const CONUS_CENTER = [-98.5795, 39.8283];
const CONUS_ZOOM = 4;

export default function TurbulenceMap({
  initialAltitude = 'all',
  initialHours = 2,
}: TurbulenceMapProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<OLMap | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupOverlayRef = useRef<Overlay | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [pireps, setPireps] = useState<PIREPData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPirep, setSelectedPirep] = useState<PIREPData | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now()); // For keeping age filter fresh

  // Filters
  const [hoursBack, setHoursBack] = useState(initialHours);
  const [altitudeFilter, setAltitudeFilter] = useState(initialAltitude);

  const altitudeOptions = [
    { value: 'all', label: 'All Altitudes' },
    { value: 'low', label: 'Below FL180' },
    { value: 'mid', label: 'FL180-FL350' },
    { value: 'high', label: 'Above FL350' },
  ];

  const hoursOptions = [
    { value: 1, label: '1 Hour' },
    { value: 2, label: '2 Hours' },
    { value: 4, label: '4 Hours' },
    { value: 6, label: '6 Hours' },
  ];

  // Cache helpers
  const getCachedData = useCallback((): { pireps: PIREPData[]; fetchedAt: string } | null => {
    try {
      const cached = safeStorage.getItem(PIREP_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() < parsed.expiresAt) {
          return { pireps: parsed.pireps, fetchedAt: parsed.fetchedAt };
        }
        safeStorage.removeItem(PIREP_CACHE_KEY);
      }
    } catch (err) {
      console.warn('Cache read error:', err);
    }
    return null;
  }, []);

  const setCachedData = useCallback((pirepData: PIREPData[], fetchTime: string) => {
    try {
      const cacheEntry = {
        pireps: pirepData,
        fetchedAt: fetchTime,
        expiresAt: Date.now() + PIREP_CACHE_TTL,
      };
      safeStorage.setItem(PIREP_CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (err) {
      console.warn('Cache write error:', err);
    }
  }, []);

  // Fetch PIREP data
  const fetchPirepData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCachedData();
      if (cached) {
        setPireps(cached.pireps);
        setFetchedAt(cached.fetchedAt);
        setIsLoading(false);
        setError(null);
        return;
      }
    }

    // Cancel any in-flight request to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/aviation/pireps?hours=6&turbulenceOnly=false`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch PIREP data');
      }

      const result = await response.json();

      // Check if request was aborted before updating state
      if (controller.signal.aborted) return;

      if (result.success) {
        setPireps(result.data.pireps);
        setFetchedAt(result.data.fetchedAt);
        setCachedData(result.data.pireps, result.data.fetchedAt);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      // Don't update state if request was aborted
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('PIREP fetch error:', err);
      setError('Unable to load PIREP data');
    } finally {
      // Only update loading state if this is still the current request
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [getCachedData, setCachedData]);

  // Update current time every minute to keep age filter fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Filter PIREPs based on user selections
  const filteredPireps = useMemo(() => {
    const cutoffTime = new Date(currentTime - hoursBack * 60 * 60 * 1000);

    return pireps.filter((pirep) => {
      // Time filter - skip PIREPs with missing or invalid observation times
      if (!pirep.observationTime) return false;
      const obsTime = new Date(pirep.observationTime);
      if (isNaN(obsTime.getTime()) || obsTime < cutoffTime) return false;

      // Altitude filter
      const alt = pirep.altitudeFt || 0;
      switch (altitudeFilter) {
        case 'low':
          return alt < 18000;
        case 'mid':
          return alt >= 18000 && alt <= 35000;
        case 'high':
          return alt > 35000;
        default:
          return true;
      }
    });
  }, [pireps, hoursBack, altitudeFilter, currentTime]);

  // Initial fetch with cleanup on unmount
  useEffect(() => {
    fetchPirepData();
    return () => {
      // Abort any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPirepData]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create base layer
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: CARTO_DARK_URL,
        attributions: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        crossOrigin: 'anonymous',
      }),
      opacity: 0.9,
    });

    // Create map
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
        autoPan: {
          animation: { duration: 250 },
        },
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
        const pirep = feature.get('pirep') as PIREPData;
        if (pirep) {
          setSelectedPirep(pirep);
          popupOverlayRef.current?.setPosition(evt.coordinate);
        }
      } else {
        setSelectedPirep(null);
        popupOverlayRef.current?.setPosition(undefined);
      }
    });

    // Change cursor on hover
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
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.setTarget(undefined);
      map.dispose(); // Properly release OpenLayers resources to prevent memory leaks
      mapInstanceRef.current = null;
    };
  }, []);

  // Close popup if selected PIREP is filtered out
  useEffect(() => {
    if (selectedPirep && !filteredPireps.some(p => p.id === selectedPirep.id)) {
      setSelectedPirep(null);
      popupOverlayRef.current?.setPosition(undefined);
    }
  }, [filteredPireps, selectedPirep]);

  // Update markers when filtered data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing vector layer
    if (vectorLayerRef.current) {
      map.removeLayer(vectorLayerRef.current);
    }

    // Create features from PIREPs
    const features = filteredPireps.map((pirep) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([pirep.longitude, pirep.latitude])),
        pirep,
      });

      const color = getTurbulenceColor(pirep.turbulenceIntensity);
      const severity = getSeverityLevel(pirep.turbulenceIntensity);
      const size = severity === 'smooth' ? 6 : severity === 'light' ? 8 : severity === 'moderate' ? 10 : severity === 'severe' ? 12 : 14;

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: size,
            fill: new Fill({ color: color + 'cc' }), // Semi-transparent
            stroke: new Stroke({ color: '#ffffff', width: 1.5 }),
          }),
        })
      );

      return feature;
    });

    // Create new vector layer
    const vectorSource = new VectorSource({ features });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 100,
    });

    map.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;
  }, [filteredPireps]);

  // Close popup
  const closePopup = useCallback(() => {
    setSelectedPirep(null);
    popupOverlayRef.current?.setPosition(undefined);
  }, []);

  // Format time ago
  const formatTimeAgo = (isoString: string): string => {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Unknown';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  // Format altitude
  const formatAltitude = (ft: number): string => {
    if (ft >= 18000) {
      return `FL${Math.round(ft / 100)}`;
    }
    return `${ft.toLocaleString()} ft`;
  };

  return (
    <div className={cn('space-y-3', themeClasses.background)}>
      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Hours Filter */}
        <div className="flex items-center gap-2">
          <Clock className={cn('w-4 h-4', themeClasses.accentText)} />
          <label htmlFor="hours-select" className={cn('text-xs font-mono uppercase', themeClasses.text)}>
            Age:
          </label>
          <select
            id="hours-select"
            value={hoursBack}
            onChange={(e) => setHoursBack(parseInt(e.target.value, 10))}
            className={cn(
              'px-2 py-1 text-xs font-mono border-2 rounded bg-gray-900',
              themeClasses.borderColor,
              themeClasses.text
            )}
          >
            {hoursOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Altitude Filter */}
        <div className="flex items-center gap-2">
          <Mountain className={cn('w-4 h-4', themeClasses.accentText)} />
          <label htmlFor="altitude-filter" className={cn('text-xs font-mono uppercase', themeClasses.text)}>
            Altitude:
          </label>
          <select
            id="altitude-filter"
            value={altitudeFilter}
            onChange={(e) => setAltitudeFilter(e.target.value)}
            className={cn(
              'px-2 py-1 text-xs font-mono border-2 rounded bg-gray-900',
              themeClasses.borderColor,
              themeClasses.text
            )}
          >
            {altitudeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchPirepData(true)}
          disabled={isLoading}
          className={cn(
            'p-1.5 border-2 rounded hover:bg-gray-700 transition-colors',
            themeClasses.borderColor,
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Refresh PIREP data"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </button>

        {/* PIREP Count */}
        <div className={cn('text-xs font-mono ml-auto', themeClasses.text)}>
          <span className={cn('font-bold', themeClasses.accentText)}>{filteredPireps.length}</span> PIREPs
        </div>
      </div>

      {/* Map Container */}
      <div
        className={cn(
          'relative border-4 rounded-lg overflow-hidden bg-gray-900',
          themeClasses.borderColor
        )}
        style={{ height: '400px' }}
      >
        {isLoading && !pireps.length ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <Plane className={cn('w-8 h-8 mx-auto mb-2 animate-bounce', themeClasses.accentText)} />
              <div className={cn('text-xs font-mono', themeClasses.text)}>
                Loading PIREP Data...
              </div>
            </div>
          </div>
        ) : error && !pireps.length ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center text-red-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <div className="text-xs font-mono">{error}</div>
            </div>
          </div>
        ) : null}

        {/* OpenLayers Map */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Popup */}
        <div ref={popupRef} className="absolute z-50">
          {selectedPirep && (
            <div className={cn(
              'bg-gray-900/95 border-2 rounded-lg p-3 min-w-[280px] max-w-[350px] shadow-xl backdrop-blur-sm',
              themeClasses.borderColor
            )}>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Plane className={cn('w-4 h-4', themeClasses.accentText)} />
                  <span className={cn('font-mono text-sm font-bold', themeClasses.text)}>
                    {selectedPirep.aircraftRef || 'Unknown Aircraft'}
                  </span>
                </div>
                <button
                  onClick={closePopup}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className={cn('space-y-1 text-xs font-mono', themeClasses.text)}>
                {/* Turbulence */}
                {selectedPirep.turbulenceIntensity && (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getTurbulenceColor(selectedPirep.turbulenceIntensity) }}
                    />
                    <span className="font-bold">Turbulence:</span>
                    <span>{selectedPirep.turbulenceIntensity}</span>
                    {selectedPirep.turbulenceType && (
                      <span className="opacity-60">({selectedPirep.turbulenceType})</span>
                    )}
                  </div>
                )}

                {/* Altitude */}
                <div className="flex items-center gap-2">
                  <Mountain className="w-3 h-3" />
                  <span className="font-bold">Altitude:</span>
                  <span>{formatAltitude(selectedPirep.altitudeFt)}</span>
                  {selectedPirep.turbulenceBaseFt !== null && selectedPirep.turbulenceTopFt !== null && (
                    <span className="opacity-60">
                      (TB: {formatAltitude(selectedPirep.turbulenceBaseFt)} - {formatAltitude(selectedPirep.turbulenceTopFt)})
                    </span>
                  )}
                </div>

                {/* Icing */}
                {selectedPirep.icingIntensity && (
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-weather-cold">❄</span>
                    <span className="font-bold">Icing:</span>
                    <span>{selectedPirep.icingIntensity}</span>
                    {selectedPirep.icingType && (
                      <span className="opacity-60">({selectedPirep.icingType})</span>
                    )}
                  </div>
                )}

                {/* Temperature */}
                {selectedPirep.tempC !== null && (
                  <div className="flex items-center gap-2">
                    <span>🌡</span>
                    <span className="font-bold">Temp:</span>
                    <span>{selectedPirep.tempC}°C</span>
                  </div>
                )}

                {/* Wind */}
                {selectedPirep.windDir !== null && selectedPirep.windSpeedKt !== null && (
                  <div className="flex items-center gap-2">
                    <span>💨</span>
                    <span className="font-bold">Wind:</span>
                    <span>{selectedPirep.windDir}° / {selectedPirep.windSpeedKt} kt</span>
                  </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-700">
                  <Clock className="w-3 h-3" />
                  <span className="font-bold">Observed:</span>
                  <span>{formatTimeAgo(selectedPirep.observationTime)}</span>
                </div>

                {/* Raw text (truncated) */}
                {selectedPirep.rawText && (
                  <div className="pt-1 border-t border-gray-700">
                    <div className="opacity-60 text-[10px] break-all">
                      {selectedPirep.rawText.slice(0, 150)}
                      {selectedPirep.rawText.length > 150 && '...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Attribution */}
        <div className="absolute bottom-2 left-2 bg-gray-900/80 px-2 py-1 rounded text-[10px] font-mono text-gray-400 z-20">
          PIREP Data: NOAA AWC
        </div>
      </div>

      {/* Legend */}
      <div className={cn('flex flex-wrap items-center gap-4 text-xs font-mono', themeClasses.text)}>
        <span className="uppercase font-bold">Turbulence Intensity:</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span>None/Light</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
          <span>Severe</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span>Extreme</span>
        </div>
      </div>

      {/* Data freshness */}
      <div className={cn('flex items-center gap-2 text-xs font-mono opacity-60', themeClasses.text)}>
        <Clock className="w-3 h-3" />
        <span>
          Data updated: {fetchedAt ? new Date(fetchedAt).toLocaleTimeString() : 'Loading...'}
        </span>
        <span className="mx-2">|</span>
        <span>Click markers for details</span>
      </div>
    </div>
  );
}
