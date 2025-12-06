/**
 * 16-Bit Weather Platform - RSS Feed Type Definitions
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Type definitions for RSS feed configuration and health monitoring
 */

import type { NewsCategory } from './news';

/**
 * RSS Feed Configuration
 */
export interface RSSFeedConfig {
  id: string;
  name: string;
  url: string;
  category: NewsCategory[];
  enabled: boolean;
  priority: number; // 1-10, higher = more important
  cacheDuration: number; // milliseconds
  maxAge: number; // hours
  retryAttempts: number;
  retryDelay: number; // milliseconds
  lastSuccess?: Date;
  lastError?: Date;
  errorCount: number;
  requiresAuth?: boolean;
  userAgent?: string;
  sourceId?: string; // Maps to NewsSource type
}

/**
 * Feed Health Status
 */
export interface FeedHealth {
  feedId: string;
  isHealthy: boolean;
  lastSuccess?: Date;
  lastError?: Date;
  errorCount: number;
  consecutiveFailures: number;
  successRate: number; // 0-1
  averageResponseTime?: number; // milliseconds
  lastResponseTime?: number; // milliseconds
}

/**
 * Feed Fetch Result
 */
export interface FeedFetchResult {
  feedId: string;
  success: boolean;
  items: any[]; // Parsed feed items
  error?: string;
  responseTime: number; // milliseconds
  cached: boolean;
}

/**
 * Feed Source Interface (for abstraction)
 */
export interface FeedSource {
  fetch(): Promise<any[]>;
  getHealth(): FeedHealth;
  isEnabled(): boolean;
  getConfig(): RSSFeedConfig;
}


