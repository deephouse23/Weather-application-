'use client';

/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Precipitation Card Component
 * Displays 24-hour rain and snow totals for authenticated users
 */

import { useState, useEffect } from 'react';
import { Droplets, Snowflake, Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import type { PrecipitationData } from '@/lib/types';

interface PrecipitationCardProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

export function PrecipitationCard({ latitude, longitude, className }: PrecipitationCardProps) {
  const { user, session } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getComponentStyles(theme as ThemeType, 'weather');
  
  const [precipitation, setPrecipitation] = useState<PrecipitationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!session;

  useEffect(() => {
    if (!isAuthenticated || !latitude || !longitude) {
      setPrecipitation(null);
      return;
    }

    async function fetchPrecipitation() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/weather/precipitation-history?lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required');
            return;
          }
          throw new Error('Failed to fetch precipitation data');
        }

        const data = await response.json();
        setPrecipitation(data);
      } catch (err) {
        console.error('[PrecipitationCard] Error:', err);
        setError('Unable to load precipitation data');
      } finally {
        setLoading(false);
      }
    }

    fetchPrecipitation();
  }, [isAuthenticated, latitude, longitude, session?.access_token]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className={cn(
        "weather-card-enter border-2 shadow-md bg-black/40 backdrop-blur-sm opacity-60",
        className
      )} style={{ animationDelay: '275ms' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-lg flex items-center gap-2", themeClasses.headerText)}>
              <Lock className="w-4 h-4" />
              24-Hour Precipitation
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono opacity-75">
              LOGIN REQUIRED
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <p className={cn("text-sm font-mono text-center", themeClasses.secondaryText)}>
            Sign in to view precipitation totals
          </p>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no coordinates
  if (!latitude || !longitude) {
    return null;
  }

  return (
    <Card className={cn(
      "weather-card-enter border-2 shadow-md hover:shadow-lg transition-all duration-300",
      "bg-black/40 backdrop-blur-sm",
      className
    )} style={{ animationDelay: '275ms' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-lg flex items-center gap-2", themeClasses.headerText)}>
            <Droplets className="w-5 h-5 text-blue-400" />
            24-Hour Precipitation
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-mono",
              themeClasses.borderColor,
              themeClasses.accentText
            )}
          >
            PREMIUM
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-weather-primary" />
            <span className={cn("ml-2 text-sm font-mono", themeClasses.secondaryText)}>
              Fetching data...
            </span>
          </div>
        ) : error ? (
          <p className="text-sm font-mono text-center text-red-400">{error}</p>
        ) : precipitation ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Rainfall Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className={cn("text-sm font-mono font-bold uppercase tracking-wider", themeClasses.text)}>
                  Rainfall
                </span>
              </div>
              
              <div className="text-center">
                <p className={cn("text-3xl font-bold font-mono", themeClasses.text)}>
                  {precipitation.rain24h.toFixed(2)}"
                </p>
                <p className={cn("text-xs font-mono mt-1", themeClasses.secondaryText)}>
                  Last 24 hours
                </p>
              </div>

              <div className="space-y-1">
                <Progress 
                  value={Math.min(precipitation.rain24h * 20, 100)} 
                  className="h-2 bg-gray-700"
                />
                <p className={cn("text-xs font-mono", themeClasses.secondaryText)}>
                  Current: {precipitation.currentRain > 0 
                    ? `${precipitation.currentRain.toFixed(2)}"/hr` 
                    : 'None'}
                </p>
              </div>
            </div>

            {/* Snowfall Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-cyan-300" />
                <span className={cn("text-sm font-mono font-bold uppercase tracking-wider", themeClasses.text)}>
                  Snowfall
                </span>
              </div>
              
              <div className="text-center">
                <p className={cn("text-3xl font-bold font-mono", themeClasses.text)}>
                  {precipitation.snow24h.toFixed(1)}"
                </p>
                <p className={cn("text-xs font-mono mt-1", themeClasses.secondaryText)}>
                  Last 24 hours
                </p>
              </div>

              <div className="space-y-1">
                <Progress 
                  value={Math.min(precipitation.snow24h * 10, 100)} 
                  className="h-2 bg-gray-700"
                />
                <p className={cn("text-xs font-mono", themeClasses.secondaryText)}>
                  Current: {precipitation.currentSnow > 0 
                    ? `${precipitation.currentSnow.toFixed(1)}"/hr` 
                    : 'None'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default PrecipitationCard;
