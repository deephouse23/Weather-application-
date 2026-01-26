/**
 * 16-Bit Weather Platform - AI Module
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Public exports for AI functionality
 */

export {
  AIContextManager,
  contextManager,
  type UnifiedContext,
  type WeatherContext,
  type PrecipitationContext,
  type SpaceWeatherContext,
  type AviationContext,
  type AviationAlert,
  type EarthquakeContext,
  type VolcanoContext,
  type QueryParams,
  type ContextType,
} from './context-manager';

export {
  analyzeQuery,
  extractLocation,
  extractFlightInfo,
  isAuroraQuery,
  isCurrentConditionsQuery,
  isForecastQuery,
} from './query-analyzer';
