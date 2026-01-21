/**
 * 16-Bit Weather Platform - Flight Conditions Terminal Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Main aviation display container with retro terminal styling
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Plane, Wind, AlertTriangle, Clock, Radio, ChevronDown, ChevronUp, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AlertTicker, { AviationAlert } from './AlertTicker';
import dynamic from 'next/dynamic';

// Lazy load TurbulenceMap to optimize performance
const TurbulenceMap = dynamic(() => import('./TurbulenceMap'), {
  loading: () => (
    <div className="h-[350px] flex items-center justify-center bg-gray-900 border-2 border-dashed border-gray-600 rounded">
      <div className="text-center text-gray-400 font-mono text-sm">
        <div className="animate-pulse">Loading Turbulence Map...</div>
      </div>
    </div>
  ),
  ssr: false
});

interface FlightConditionsTerminalProps {
  alerts: AviationAlert[];
  isLoading?: boolean;
}

export default function FlightConditionsTerminal({ alerts, isLoading = false }: FlightConditionsTerminalProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedSection, setExpandedSection] = useState<string | null>('alerts');

  // Update time every 10 seconds (reduced frequency for better performance)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const formatZuluTime = (date: Date) => {
    return date.toISOString().slice(11, 19) + 'Z';
  };

  const formatLocalTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  // Calculate alert statistics
  const alertStats = {
    total: alerts.length,
    sigmet: alerts.filter(a => a.type === 'SIGMET').length,
    airmet: alerts.filter(a => a.type === 'AIRMET').length,
    severe: alerts.filter(a => a.severity === 'severe' || a.severity === 'extreme').length
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className={cn('space-y-4', themeClasses.background)}>
      {/* Terminal Header */}
      <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
        <CardHeader className={cn('border-b-2 py-3', themeClasses.borderColor)}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className={cn('text-xl font-mono font-bold flex items-center gap-2', themeClasses.headerText)}>
              <Plane className="w-5 h-5" />
              FLIGHT CONDITIONS TERMINAL
              <span className={cn('text-xs px-2 py-0.5 border-2', themeClasses.accentBg, themeClasses.borderColor)}>
                v1.0
              </span>
            </CardTitle>
            <div className="flex items-center gap-4 font-mono text-xs">
              <div className={cn('flex items-center gap-1', themeClasses.text)}>
                <Clock className="w-3 h-3" />
                <span>ZULU: {formatZuluTime(currentTime)}</span>
              </div>
              <div className={cn('flex items-center gap-1', themeClasses.text)}>
                <span>LOCAL: {formatLocalTime(currentTime)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Status Bar */}
        <CardContent className="py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={cn('text-center p-2 border-2', themeClasses.borderColor)}>
              <div className={cn('text-2xl font-bold font-mono', themeClasses.accentText)}>
                {alertStats.total}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                Active Alerts
              </div>
            </div>
            <div className={cn('text-center p-2 border-2', themeClasses.borderColor)}>
              <div className="text-2xl font-bold font-mono text-orange-500">
                {alertStats.sigmet}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                SIGMETs
              </div>
            </div>
            <div className={cn('text-center p-2 border-2', themeClasses.borderColor)}>
              <div className="text-2xl font-bold font-mono text-yellow-500">
                {alertStats.airmet}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                AIRMETs
              </div>
            </div>
            <div className={cn('text-center p-2 border-2', themeClasses.borderColor)}>
              <div className={cn(
                'text-2xl font-bold font-mono',
                alertStats.severe > 0 ? 'text-red-500' : 'text-green-500'
              )}>
                {alertStats.severe > 0 ? alertStats.severe : 'OK'}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>
                Severe
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Ticker Section */}
      <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
        <button
          onClick={() => toggleSection('alerts')}
          className={cn(
            'w-full flex items-center justify-between p-3 border-b-2 hover:bg-gray-800/50 transition-colors',
            themeClasses.borderColor
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
              Aviation Alerts Feed
            </span>
          </div>
          {expandedSection === 'alerts' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSection === 'alerts' && (
          <CardContent className="p-0">
            <AlertTicker alerts={alerts} isLoading={isLoading} />
          </CardContent>
        )}
      </Card>

      {/* Turbulence Forecast Map Section */}
      <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
        <button
          onClick={() => toggleSection('turbulence')}
          className={cn(
            'w-full flex items-center justify-between p-3 border-b-2 hover:bg-gray-800/50 transition-colors',
            themeClasses.borderColor
          )}
        >
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-purple-500" />
            <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
              Turbulence Forecast
            </span>
          </div>
          {expandedSection === 'turbulence' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSection === 'turbulence' && (
          <CardContent className="p-4">
            <TurbulenceMap initialAltitude="all" initialHours={2} />
          </CardContent>
        )}
      </Card>

      {/* Data Sources Section */}
      <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
        <button
          onClick={() => toggleSection('sources')}
          className={cn(
            'w-full flex items-center justify-between p-3 border-b-2 hover:bg-gray-800/50 transition-colors',
            themeClasses.borderColor
          )}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-green-500" />
            <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
              Data Sources
            </span>
          </div>
          {expandedSection === 'sources' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSection === 'sources' && (
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className={cn('p-3 border-2', themeClasses.borderColor)}>
                <div className={cn('font-bold mb-1', themeClasses.accentText)}>NOAA AWC</div>
                <div className={cn(themeClasses.text)}>Aviation Weather Center</div>
                <div className="text-green-500 mt-1">STATUS: ONLINE</div>
              </div>
              <div className={cn('p-3 border-2', themeClasses.borderColor)}>
                <div className={cn('font-bold mb-1', themeClasses.accentText)}>NOAA GFS</div>
                <div className={cn(themeClasses.text)}>Global Forecast System</div>
                <div className="text-green-500 mt-1">STATUS: ONLINE</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Turbulence Guide Section */}
      <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background)}>
        <button
          onClick={() => toggleSection('guide')}
          className={cn(
            'w-full flex items-center justify-between p-3 border-b-2 hover:bg-gray-800/50 transition-colors',
            themeClasses.borderColor
          )}
        >
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-500" />
            <span className={cn('text-sm font-mono font-bold uppercase', themeClasses.headerText)}>
              Turbulence Guide
            </span>
          </div>
          {expandedSection === 'guide' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSection === 'guide' && (
          <CardContent className="p-4">
            <div className="space-y-3 font-mono text-xs">
              <div className={cn('flex items-center gap-3 p-2 border-2', themeClasses.borderColor)}>
                <div className="w-4 h-4 bg-green-500 rounded" />
                <div>
                  <span className="text-green-500 font-bold">LIGHT</span>
                  <span className={cn('ml-2', themeClasses.text)}>
                    Minor turbulence. Seat belt recommended.
                  </span>
                </div>
              </div>
              <div className={cn('flex items-center gap-3 p-2 border-2', themeClasses.borderColor)}>
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <div>
                  <span className="text-yellow-500 font-bold">MODERATE</span>
                  <span className={cn('ml-2', themeClasses.text)}>
                    Definite strains against seat belt. Unsecured objects may move.
                  </span>
                </div>
              </div>
              <div className={cn('flex items-center gap-3 p-2 border-2', themeClasses.borderColor)}>
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <div>
                  <span className="text-orange-500 font-bold">SEVERE</span>
                  <span className={cn('ml-2', themeClasses.text)}>
                    Abrupt changes in altitude/attitude. Aircraft may be momentarily out of control.
                  </span>
                </div>
              </div>
              <div className={cn('flex items-center gap-3 p-2 border-2', themeClasses.borderColor)}>
                <div className="w-4 h-4 bg-red-500 rounded" />
                <div>
                  <span className="text-red-500 font-bold">EXTREME</span>
                  <span className={cn('ml-2', themeClasses.text)}>
                    Aircraft violently tossed. Practically impossible to control. May cause structural damage.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Footer */}
      <div className={cn(
        'text-center text-xs font-mono py-3 border-t-2',
        themeClasses.borderColor,
        themeClasses.text
      )}>
        DATA PROVIDED BY NOAA AVIATION WEATHER CENTER • NOT FOR FLIGHT PLANNING • ALWAYS CHECK OFFICIAL SOURCES
      </div>
    </div>
  );
}
