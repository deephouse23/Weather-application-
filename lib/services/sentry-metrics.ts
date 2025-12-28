/**
 * 16-Bit Weather Platform
 * 
 * Sentry Metrics Service
 * Centralized helper functions for tracking custom metrics
 * Uses Sentry SDK v10.x metrics API
 */

import * as Sentry from '@sentry/nextjs';

// API Performance Metrics
export function trackApiCall(
    apiName: string,
    responseTimeMs: number,
    success: boolean,
    attributes?: Record<string, string>
) {
    const metricName = `api.${apiName}`;

    // Track response time as distribution
    Sentry.metrics.distribution(`${metricName}.response_time`, responseTimeMs, {
        unit: 'millisecond'
    });

    // Track request count
    Sentry.metrics.count(`${metricName}.requests`);

    // Track errors separately for easy alerting
    if (!success) {
        Sentry.metrics.count(`${metricName}.errors`);
    }
}

// User Engagement Metrics
export function trackUserAction(
    action: 'search' | 'radar_view' | 'theme_change' | 'location_save' | 'ai_chat'
) {
    Sentry.metrics.count(`user.${action}`);
}

// Cache Metrics
export function trackCacheEvent(hit: boolean, _cacheType: string = 'weather') {
    const eventType = hit ? 'hit' : 'miss';
    Sentry.metrics.count(`cache.${eventType}`);
}

// Rate Limit Metrics
export function trackRateLimitExceeded(_limitType: string = 'ai_chat') {
    Sentry.metrics.count('rate_limit.exceeded');
}

// AI Chat Specific Metrics
export function trackAIChatRequest(
    _personality: string,
    responseTimeMs: number,
    _hasWeatherContext: boolean,
    success: boolean
) {
    Sentry.metrics.distribution('api.ai_chat.response_time', responseTimeMs, {
        unit: 'millisecond'
    });

    Sentry.metrics.count('api.ai_chat.requests');

    if (!success) {
        Sentry.metrics.count('api.ai_chat.errors');
    }
}

// Weather API Metrics
export function trackWeatherApiCall(
    _location: string,
    responseTimeMs: number,
    success: boolean,
    _source: 'current' | 'forecast' | 'onecall' = 'current'
) {
    Sentry.metrics.distribution('api.weather.response_time', responseTimeMs, {
        unit: 'millisecond'
    });

    Sentry.metrics.count('api.weather.requests');

    if (!success) {
        Sentry.metrics.count('api.weather.errors');
    }
}

// Page View Metrics
export function trackPageView(page: string) {
    Sentry.metrics.count(`page.view.${page.replace(/\//g, '_')}`);
}
