/**
 * 16-Bit Weather Platform - Coronagraph Animation Component
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Animated SOHO LASCO coronagraph viewer with playback controls
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CoronagraphAnimationProps {
  className?: string;
}

type Camera = 'c2' | 'c3';
type Speed = 0.5 | 1 | 2;

const FRAME_INTERVAL_MS = 500; // Time between frames during playback
const FRAME_COUNT = 12; // Number of frames to display

export default function CoronagraphAnimation({ className }: CoronagraphAnimationProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const [camera, setCamera] = useState<Camera>('c2');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedFrames, setLoadedFrames] = useState<Set<number>>(new Set());
  const [showFullsize, setShowFullsize] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Latest image URLs (always available)
  const latestUrls = {
    c2: 'https://soho.nascom.nasa.gov/data/realtime/c2/512/latest.jpg',
    c3: 'https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg',
  };

  // Get current image URL
  const getCurrentImageUrl = useCallback(() => {
    // For simplicity, we'll use the latest image with cache busting
    // In production, you'd fetch actual frame URLs from the API
    const baseUrl = latestUrls[camera];
    return `${baseUrl}?frame=${currentFrame}&t=${Date.now()}`;
  }, [camera, currentFrame, latestUrls]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const interval = FRAME_INTERVAL_MS / speed;
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % FRAME_COUNT);
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoading(false);
    setLoadedFrames((prev) => new Set([...prev, currentFrame]));
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  // Controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const stepForward = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => (prev + 1) % FRAME_COUNT);
  };

  const stepBackward = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => (prev - 1 + FRAME_COUNT) % FRAME_COUNT);
  };

  const changeSpeed = () => {
    setSpeed((prev) => {
      if (prev === 0.5) return 1;
      if (prev === 1) return 2;
      return 0.5;
    });
  };

  const changeCamera = (newCamera: Camera) => {
    setCamera(newCamera);
    setIsLoading(true);
    setLoadedFrames(new Set());
  };

  return (
    <>
      <Card className={cn('border-4', themeClasses.borderColor, themeClasses.background, className)} data-testid="coronagraph">
        <CardHeader className={cn('border-b-2 py-3', themeClasses.borderColor)}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn('text-lg font-mono font-bold flex items-center gap-2', themeClasses.headerText)}>
              CORONAGRAPH
              <span className={cn('text-xs px-2 py-0.5 border', themeClasses.borderColor, themeClasses.accentBg)}>
                LASCO
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullsize(true)}
              className="font-mono text-xs"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Coronagraph Image */}
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden border-2 border-gray-700">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className={cn('text-sm font-mono', themeClasses.text, 'animate-pulse')}>
                  ACQUIRING CORONAGRAPH DATA...
                </div>
              </div>
            )}

            {/* Current frame */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getCurrentImageUrl()}
              alt={`LASCO ${camera.toUpperCase()} Coronagraph`}
              className={cn(
                'w-full h-full object-contain transition-opacity duration-300',
                isLoading && 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              data-testid="coronagraph-frame"
            />

            {/* Camera label */}
            <div className="absolute top-2 left-2 text-xs font-mono px-2 py-1 bg-black/70 rounded text-white">
              LASCO {camera.toUpperCase()}
            </div>

            {/* Frame counter */}
            <div className="absolute top-2 right-2 text-xs font-mono px-2 py-1 bg-black/70 rounded text-white">
              Frame {currentFrame + 1}/{FRAME_COUNT}
            </div>

            {/* Play indicator */}
            {isPlaying && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs font-mono px-2 py-1 bg-black/70 rounded text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                PLAYING
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
            {Array.from({ length: FRAME_COUNT }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrame(index);
                }}
                className={cn(
                  'flex-1 transition-all duration-200',
                  index === currentFrame
                    ? 'bg-cyan-500'
                    : loadedFrames.has(index)
                      ? 'bg-gray-600 hover:bg-gray-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                )}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={stepBackward}
              className="font-mono"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              className={cn('font-mono w-20', isPlaying && 'bg-cyan-500/20 border-cyan-500')}
              data-testid="coronagraph-play"
            >
              {isPlaying ? (
                <><Pause className="w-4 h-4 mr-1" /> STOP</>
              ) : (
                <><Play className="w-4 h-4 mr-1" /> PLAY</>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={stepForward}
              className="font-mono"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={changeSpeed}
              className="font-mono w-14"
            >
              {speed}x
            </Button>
          </div>

          {/* Camera Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => changeCamera('c2')}
              className={cn(
                'p-2 border-2 font-mono text-xs transition-all duration-200',
                themeClasses.borderColor,
                camera === 'c2'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-500'
                  : cn('hover:bg-gray-800', themeClasses.text)
              )}
            >
              <div className="font-bold">C2</div>
              <div className={cn('text-xs', themeClasses.text, 'opacity-70')}>1.5-6 R☉</div>
            </button>
            <button
              onClick={() => changeCamera('c3')}
              className={cn(
                'p-2 border-2 font-mono text-xs transition-all duration-200',
                themeClasses.borderColor,
                camera === 'c3'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-500'
                  : cn('hover:bg-gray-800', themeClasses.text)
              )}
            >
              <div className="font-bold">C3</div>
              <div className={cn('text-xs', themeClasses.text, 'opacity-70')}>3.5-30 R☉</div>
            </button>
          </div>

          {/* Info */}
          <div className={cn('text-xs font-mono text-center pt-2 border-t border-gray-700', themeClasses.text, 'opacity-70')}>
            SOHO LASCO coronagraph - CME detection. R☉ = Solar Radii.
          </div>
        </CardContent>
      </Card>

      {/* Fullsize Modal */}
      {showFullsize && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
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
              src={latestUrls[camera]}
              alt={`LASCO ${camera.toUpperCase()} Coronagraph (full resolution)`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="text-center mt-2 font-mono text-sm text-white">
              SOHO LASCO {camera.toUpperCase()} - Latest Image
            </div>
          </div>
        </div>
      )}
    </>
  );
}
