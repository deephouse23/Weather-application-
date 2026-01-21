/**
 * 16-Bit Weather Platform - Sun Image Viewer Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Displays NASA SDO sun imagery with wavelength selector
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Sun, RefreshCw, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Wavelength {
  id: string;
  name: string;
  description: string;
  color: string;
  url512: string;
  url1024: string;
}

const WAVELENGTHS: Wavelength[] = [
  {
    id: '304',
    name: 'AIA 304',
    description: 'Chromosphere (60,000K)',
    color: 'text-orange-500',
    url512: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0304.jpg',
    url1024: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg',
  },
  {
    id: '193',
    name: 'AIA 193',
    description: 'Corona (1.2M K)',
    color: 'text-green-500',
    url512: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg',
    url1024: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg',
  },
  {
    id: '171',
    name: 'AIA 171',
    description: 'Corona (600,000K)',
    color: 'text-yellow-500',
    url512: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0171.jpg',
    url1024: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg',
  },
  {
    id: 'HMI',
    name: 'HMI',
    description: 'Sunspots (Visible)',
    color: 'text-gray-300',
    url512: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIIF.jpg',
    url1024: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIF.jpg',
  },
];

interface SunImageViewerProps {
  className?: string;
}

export default function SunImageViewer({ className }: SunImageViewerProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');
  const [selectedWavelength, setSelectedWavelength] = useState<Wavelength>(WAVELENGTHS[0]);
  const [isLoading, setIsLoading] = useState(true);
  // Initialize to null to avoid hydration mismatch
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showFullsize, setShowFullsize] = useState(false);

  // Set initial time on client mount and auto-refresh every 5 minutes
  useEffect(() => {
    setLastUpdate(new Date());
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setIsLoading(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    setIsLoading(true);
    setImageError(false);
  };

  // Add cache buster to URL (use 0 if not yet mounted to avoid hydration mismatch)
  const cacheTime = lastUpdate?.getTime() ?? 0;
  const imageUrl = `${selectedWavelength.url512}?t=${cacheTime}`;
  const fullsizeUrl = `${selectedWavelength.url1024}?t=${cacheTime}`;

  return (
    <>
      <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background, className)}>
        <CardHeader className={cn('border-b-2 py-3', themeClasses.borderColor)}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn('text-lg font-mono font-bold flex items-center gap-2', themeClasses.headerText)}>
              <Sun className="w-5 h-5 text-orange-500" />
              SUN VIEWER
              <span className={cn('text-xs px-2 py-0.5', themeClasses.accentBg, themeClasses.borderColor, 'border')}>
                SDO
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="font-mono text-xs"
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullsize(true)}
                className="font-mono text-xs"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Sun Image */}
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden border-2 border-gray-700">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className={cn('text-sm font-mono', themeClasses.text, 'animate-pulse')}>
                  ACQUIRING SOLAR DATA...
                </div>
              </div>
            )}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="text-red-500 font-mono text-sm">SIGNAL LOST</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-2 font-mono text-xs"
                  >
                    RETRY
                  </Button>
                </div>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Sun in ${selectedWavelength.name}`}
              className={cn(
                'w-full h-full object-contain',
                isLoading && 'opacity-0',
                imageError && 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Wavelength info overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
              <div className={cn('text-xs font-mono px-2 py-1 bg-black/70 rounded', selectedWavelength.color)}>
                {selectedWavelength.name}
              </div>
              <div className={cn('text-xs font-mono px-2 py-1 bg-black/70 rounded', themeClasses.text)}>
                {selectedWavelength.description}
              </div>
            </div>
          </div>

          {/* Wavelength Selector */}
          <div className="grid grid-cols-4 gap-2">
            {WAVELENGTHS.map((wavelength) => (
              <button
                key={wavelength.id}
                onClick={() => {
                  setSelectedWavelength(wavelength);
                  setIsLoading(true);
                  setImageError(false);
                }}
                className={cn(
                  'p-2 border-2 font-mono text-xs transition-all duration-200',
                  themeClasses.borderColor,
                  selectedWavelength.id === wavelength.id
                    ? cn('border-2', wavelength.color.replace('text-', 'border-'), 'bg-gray-800')
                    : 'hover:bg-gray-800',
                  wavelength.color
                )}
                data-testid={`wavelength-${wavelength.id}`}
              >
                {wavelength.id}
              </button>
            ))}
          </div>

          {/* Last Update */}
          <div className={cn('text-xs font-mono text-center', themeClasses.text, 'opacity-70')}>
            Last update: {lastUpdate ? lastUpdate.toISOString().slice(11, 19) + 'Z' : '--:--:--'}
          </div>
        </CardContent>
      </Card>

      {/* Fullsize Modal */}
      {showFullsize && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullsize(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowFullsize(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded text-white hover:bg-black/70"
            >
              Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullsizeUrl}
              alt={`Sun in ${selectedWavelength.name} (full resolution)`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className={cn('text-center mt-2 font-mono text-sm', selectedWavelength.color)}>
              {selectedWavelength.name} - {selectedWavelength.description}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
