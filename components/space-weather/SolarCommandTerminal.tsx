/**
 * 16-Bit Weather Platform - Solar Command Terminal Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Main space weather display container with retro terminal styling
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Activity, AlertTriangle, Clock, Radio, ChevronDown, ChevronUp, Zap, Wind, Sparkles, Satellite } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const SpaceWeatherScales = dynamic(() => import('./SpaceWeatherScales'), {
  loading: () => <LoadingSkeleton height="200px" />,
  ssr: false
});

const SunImageViewer = dynamic(() => import('./SunImageViewer'), {
  loading: () => <LoadingSkeleton height="400px" />,
  ssr: false
});

const SpaceWeatherAlertTicker = dynamic(() => import('./SpaceWeatherAlertTicker'), {
  loading: () => <LoadingSkeleton height="150px" />,
  ssr: false
});

const KpIndexGauge = dynamic(() => import('./KpIndexGauge'), {
  loading: () => <LoadingSkeleton height="250px" />,
  ssr: false
});

const SolarWindStats = dynamic(() => import('./SolarWindStats'), {
  loading: () => <LoadingSkeleton height="250px" />,
  ssr: false
});

const SunspotDisplay = dynamic(() => import('./SunspotDisplay'), {
  loading: () => <LoadingSkeleton height="200px" />,
  ssr: false
});

const XRayFluxChart = dynamic(() => import('./XRayFluxChart'), {
  loading: () => <LoadingSkeleton height="300px" />,
  ssr: false
});

const CoronagraphAnimation = dynamic(() => import('./CoronagraphAnimation'), {
  loading: () => <LoadingSkeleton height="400px" />,
  ssr: false
});

const AuroraForecastMap = dynamic(() => import('./AuroraForecastMap'), {
  loading: () => <LoadingSkeleton height="400px" />,
  ssr: false
});

// Loading skeleton component
function LoadingSkeleton({ height = '200px' }: { height?: string }) {
  return (
    <div
      className="flex items-center justify-center bg-gray-900 border-2 border-dashed border-gray-600 rounded"
      style={{ height }}
    >
      <div className="text-center text-gray-400 font-mono text-sm">
        <div className="animate-pulse">Loading...</div>
      </div>
    </div>
  );
}

// Type imports for data
import type { SpaceWeatherAlert } from './SpaceWeatherAlertTicker';
import type { KpIndexData } from './KpIndexGauge';
import type { SolarWindData } from './SolarWindStats';
import type { SunspotData } from './SunspotDisplay';
import type { XRayFluxData } from './XRayFluxChart';
import type { AuroraForecastData } from './AuroraForecastMap';
import type { SpaceWeatherScalesData } from './SpaceWeatherScales';

interface SolarCommandTerminalProps {
  scales: SpaceWeatherScalesData | null;
  alerts: SpaceWeatherAlert[];
  kpIndex: KpIndexData | null;
  solarWind: SolarWindData | null;
  sunspots: SunspotData | null;
  xrayFlux: XRayFluxData | null;
  auroraForecast: AuroraForecastData | null;
  isLoading?: boolean;
}

export default function SolarCommandTerminal({
  scales,
  alerts,
  kpIndex,
  solarWind,
  sunspots,
  xrayFlux,
  auroraForecast,
  isLoading = false
}: SolarCommandTerminalProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  // Initialize to null to avoid hydration mismatch, set on client mount
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['scales', 'sun', 'kp']));

  // Set time on client mount and update every 10 seconds
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const formatZuluTime = (date: Date) => {
    return date.toISOString().slice(11, 19) + 'Z';
  };

  const formatLocalTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Calculate status summary
  const getOverallStatus = () => {
    const kp = kpIndex?.current?.value ?? 0;
    const rScale = scales?.R?.scale ?? 0;
    const sScale = scales?.S?.scale ?? 0;
    const gScale = scales?.G?.scale ?? 0;

    const hasStorm = kp >= 5 || rScale >= 3 || sScale >= 3 || gScale >= 3;
    const hasActivity = kp >= 4 || rScale >= 1 || sScale >= 1 || gScale >= 1;

    if (hasStorm) return { text: 'STORM CONDITIONS', color: 'text-red-500', bgColor: 'bg-red-500/20' };
    if (hasActivity) return { text: 'ACTIVE', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' };
    return { text: 'QUIET', color: 'text-green-500', bgColor: 'bg-green-500/20' };
  };

  const status = getOverallStatus();

  return (
    <div className={cn('space-y-4', themeClasses.background)}>
      {/* Terminal Header */}
      <Card className={cn('container-primary', themeClasses.background)}>
        <CardHeader className={cn('border-b border-subtle py-3')}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className={cn('text-xl font-mono font-bold flex items-center gap-2', themeClasses.headerText)}>
              <Sun className="w-6 h-6 text-yellow-500" />
              SOLAR COMMAND TERMINAL
              <span className={cn('text-xs px-2 py-0.5 border-2', status.bgColor, status.color, 'border-current')}>
                {status.text}
              </span>
            </CardTitle>
            <div className="flex items-center gap-4 font-mono text-xs">
              <div className={cn('flex items-center gap-1', themeClasses.text)}>
                <Clock className="w-3 h-3" />
                <span>UTC: {currentTime ? formatZuluTime(currentTime) : '--:--:--Z'}</span>
              </div>
              <div className={cn('flex items-center gap-1', themeClasses.text)}>
                <span>LOCAL: {currentTime ? formatLocalTime(currentTime) : '--:--:--'}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Quick Status Bar */}
        <CardContent className="py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={cn('text-center p-2 container-nested')}>
              <div className={cn('text-2xl font-bold font-mono', themeClasses.accentText)}>
                {kpIndex?.current?.value?.toFixed(0) ?? '—'}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                Kp Index
              </div>
            </div>
            <div className={cn('text-center p-2 container-nested')}>
              <div className="text-2xl font-bold font-mono text-yellow-500">
                {sunspots?.current?.sunspotNumber ?? '—'}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                Sunspots
              </div>
            </div>
            <div className={cn('text-center p-2 container-nested')}>
              <div className="text-2xl font-bold font-mono text-cyan-500">
                {solarWind?.current?.speed ?? '—'}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                Wind km/s
              </div>
            </div>
            <div className={cn('text-center p-2 container-nested')}>
              <div className={cn(
                'text-2xl font-bold font-mono',
                alerts.length > 0 ? 'text-orange-500' : 'text-green-500'
              )}>
                {alerts.length > 0 ? alerts.length : 'OK'}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                Alerts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Space Weather Scales Section */}
      <Card className={cn('container-primary', themeClasses.background)}>
        <button
          onClick={() => toggleSection('scales')}
          className={cn(
            'w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors'
          )}
          aria-expanded={expandedSections.has('scales')}
          aria-controls="section-scales-content"
          aria-label="Toggle NOAA Space Weather Scales section"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" aria-hidden="true" />
            <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
              NOAA Space Weather Scales (R-S-G)
            </span>
          </div>
          {expandedSections.has('scales') ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
        {expandedSections.has('scales') && (
          <CardContent id="section-scales-content" className="p-4">
            <SpaceWeatherScales scales={scales} isLoading={isLoading} />
          </CardContent>
        )}
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className={cn('container-primary', themeClasses.background)}>
          <button
            onClick={() => toggleSection('alerts')}
            className="w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors"
            aria-expanded={expandedSections.has('alerts')}
            aria-controls="section-alerts-content"
            aria-label={`Toggle Space Weather Alerts section, ${alerts.length} alerts`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden="true" />
              <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
                Space Weather Alerts ({alerts.length})
              </span>
            </div>
            {expandedSections.has('alerts') ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {expandedSections.has('alerts') && (
            <CardContent id="section-alerts-content" className="p-0">
              <SpaceWeatherAlertTicker alerts={alerts} isLoading={isLoading} />
            </CardContent>
          )}
        </Card>
      )}

      {/* Sun Imagery Section */}
      <Card className={cn('container-primary', themeClasses.background)}>
        <button
          onClick={() => toggleSection('sun')}
          className={cn(
            'w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors'
          )}
          aria-expanded={expandedSections.has('sun')}
          aria-controls="section-sun-content"
          aria-label="Toggle Live Sun Imagery section"
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-500" aria-hidden="true" />
            <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
              Live Sun Imagery (NASA SDO)
            </span>
          </div>
          {expandedSections.has('sun') ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
        {expandedSections.has('sun') && (
          <CardContent id="section-sun-content" className="p-4">
            <SunImageViewer />
          </CardContent>
        )}
      </Card>

      {/* Kp Index & Solar Wind Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={cn('container-primary', themeClasses.background)}>
          <button
            onClick={() => toggleSection('kp')}
            className="w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors"
            aria-expanded={expandedSections.has('kp')}
            aria-controls="section-kp-content"
            aria-label="Toggle Kp Geomagnetic Index section"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" aria-hidden="true" />
              <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
                Kp Geomagnetic Index
              </span>
            </div>
            {expandedSections.has('kp') ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {expandedSections.has('kp') && (
            <CardContent id="section-kp-content" className="p-4">
              <KpIndexGauge data={kpIndex} isLoading={isLoading} />
            </CardContent>
          )}
        </Card>

        <Card className={cn('container-primary', themeClasses.background)}>
          <button
            onClick={() => toggleSection('wind')}
            className="w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors"
            aria-expanded={expandedSections.has('wind')}
            aria-controls="section-wind-content"
            aria-label="Toggle Real-Time Solar Wind section"
          >
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-500" aria-hidden="true" />
              <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
                Real-Time Solar Wind
              </span>
            </div>
            {expandedSections.has('wind') ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {expandedSections.has('wind') && (
            <CardContent id="section-wind-content" className="p-4">
              <SolarWindStats data={solarWind} isLoading={isLoading} />
            </CardContent>
          )}
        </Card>
      </div>

      {/* X-Ray Flux & Sunspots Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={cn('container-primary', themeClasses.background)}>
          <button
            onClick={() => toggleSection('xray')}
            className="w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors"
            aria-expanded={expandedSections.has('xray')}
            aria-controls="section-xray-content"
            aria-label="Toggle X-Ray Flux and Solar Flares section"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />
              <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
                X-Ray Flux / Solar Flares
              </span>
            </div>
            {expandedSections.has('xray') ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {expandedSections.has('xray') && (
            <CardContent id="section-xray-content" className="p-4">
              <XRayFluxChart data={xrayFlux} isLoading={isLoading} />
            </CardContent>
          )}
        </Card>

        <Card className={cn('container-primary', themeClasses.background)}>
          <button
            onClick={() => toggleSection('sunspots')}
            className="w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors"
            aria-expanded={expandedSections.has('sunspots')}
            aria-controls="section-sunspots-content"
            aria-label="Toggle Sunspot Activity section"
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-orange-500" aria-hidden="true" />
              <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
                Sunspot Activity
              </span>
            </div>
            {expandedSections.has('sunspots') ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {expandedSections.has('sunspots') && (
            <CardContent id="section-sunspots-content" className="p-4">
              <SunspotDisplay data={sunspots} isLoading={isLoading} />
            </CardContent>
          )}
        </Card>
      </div>

      {/* Coronagraph & Aurora Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={cn('container-primary', themeClasses.background)}>
          <button
            onClick={() => toggleSection('coronagraph')}
            className="w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors"
            aria-expanded={expandedSections.has('coronagraph')}
            aria-controls="section-coronagraph-content"
            aria-label="Toggle SOHO Coronagraph CME Watch section"
          >
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-purple-500" aria-hidden="true" />
              <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
                SOHO Coronagraph (CME Watch)
              </span>
            </div>
            {expandedSections.has('coronagraph') ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {expandedSections.has('coronagraph') && (
            <CardContent id="section-coronagraph-content" className="p-4">
              <CoronagraphAnimation />
            </CardContent>
          )}
        </Card>

        <Card className={cn('container-primary', themeClasses.background)}>
          <button
            onClick={() => toggleSection('aurora')}
            className="w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors"
            aria-expanded={expandedSections.has('aurora')}
            aria-controls="section-aurora-content"
            aria-label="Toggle Aurora Forecast section"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-400" aria-hidden="true" />
              <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
                Aurora Forecast
              </span>
            </div>
            {expandedSections.has('aurora') ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {expandedSections.has('aurora') && (
            <CardContent id="section-aurora-content" className="p-4">
              <AuroraForecastMap data={auroraForecast} isLoading={isLoading} />
            </CardContent>
          )}
        </Card>
      </div>

      {/* Data Sources Section */}
      <Card className={cn('container-primary', themeClasses.background)}>
        <button
          onClick={() => toggleSection('sources')}
          className={cn(
            'w-full flex items-center justify-between p-3 border-b border-subtle hover:bg-gray-800/50 transition-colors'
          )}
          aria-expanded={expandedSections.has('sources')}
          aria-controls="section-sources-content"
          aria-label="Toggle Data Sources section"
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-green-500" aria-hidden="true" />
            <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
              Data Sources
            </span>
          </div>
          {expandedSections.has('sources') ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
        {expandedSections.has('sources') && (
          <CardContent id="section-sources-content" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className={cn('p-3 container-nested')}>
                <div className={cn('font-bold mb-1', themeClasses.accentText)}>NOAA SWPC</div>
                <div className={cn(themeClasses.text)}>Space Weather Prediction Center</div>
                <div className="text-green-500 mt-1">STATUS: ONLINE</div>
              </div>
              <div className={cn('p-3 container-nested')}>
                <div className={cn('font-bold mb-1', themeClasses.accentText)}>NASA SDO</div>
                <div className={cn(themeClasses.text)}>Solar Dynamics Observatory</div>
                <div className="text-green-500 mt-1">STATUS: ONLINE</div>
              </div>
              <div className={cn('p-3 container-nested')}>
                <div className={cn('font-bold mb-1', themeClasses.accentText)}>SOHO/LASCO</div>
                <div className={cn(themeClasses.text)}>ESA/NASA Solar Observatory</div>
                <div className="text-green-500 mt-1">STATUS: ONLINE</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Footer */}
      <div className={cn(
        'text-center text-xs font-mono py-3 border-t border-subtle',
        themeClasses.text
      )}>
        DATA PROVIDED BY NOAA SWPC, NASA SDO, ESA/NASA SOHO • FOR EDUCATIONAL USE • CHECK OFFICIAL SOURCES FOR CRITICAL DECISIONS
      </div>
    </div>
  );
}
