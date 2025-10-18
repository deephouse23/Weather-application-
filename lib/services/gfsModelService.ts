/**
 * 16-Bit Weather Platform - GFS Model Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches GFS (Global Forecast System) model data and tropical model graphics
 * from NOAA and other public sources for display in the news feed.
 */

import type { NewsItem } from '@/components/NewsTicker/NewsTicker';
import type { NewsCategory, NewsPriority } from '@/lib/types/news';

/**
 * GFS Model Run Times (UTC)
 * Models run 4 times per day
 */
type ModelRun = '00z' | '06z' | '12z' | '18z';

/**
 * Available GFS model products
 */
export interface GFSModelProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  validTime: string;
  modelRun: ModelRun;
  region: 'tropics' | 'atlantic' | 'pacific' | 'americas' | 'global';
}

/**
 * NHC Tropical Model Graphics
 * Public domain images from National Hurricane Center
 */
const NHC_BASE_URL = 'https://www.nhc.noaa.gov';
const NHC_GRAPHICS = {
  twoDay: `${NHC_BASE_URL}/xgtwo/two_atl_2d0.png`,
  sevenDay: `${NHC_BASE_URL}/xgtwo/two_atl_5d0.png`,
  satellite: `${NHC_BASE_URL}/satellite/satellite_atl_loop-vis.gif`,
  sst: `${NHC_BASE_URL}/tafb/pac_sst.gif`,
};

/**
 * Get the most recent GFS model run time
 */
export function getLatestModelRun(): ModelRun {
  const now = new Date();
  const hour = now.getUTCHours();

  if (hour >= 0 && hour < 6) return '00z';
  if (hour >= 6 && hour < 12) return '06z';
  if (hour >= 12 && hour < 18) return '12z';
  return '18z';
}

/**
 * Format model run time for display
 */
export function formatModelRun(run: ModelRun): string {
  const hour = run.replace('z', '');
  return `${hour}:00 UTC`;
}

/**
 * Fetch National Hurricane Center tropical outlook
 */
export async function fetchNHCTropicalOutlook(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  const now = new Date();

  try {
    // 2-Day Tropical Weather Outlook
    items.push({
      id: `nhc-2day-${now.getTime()}`,
      title: 'NHC 2-Day Tropical Weather Outlook',
      description: 'National Hurricane Center 48-hour tropical weather formation potential for the Atlantic Basin',
      source: 'NOAA NHC',
      url: 'https://www.nhc.noaa.gov/gtwo.php',
      imageUrl: NHC_GRAPHICS.twoDay,
      timestamp: now,
      category: 'alerts' as NewsCategory,
      priority: 'high' as NewsPriority,
    });

    // 7-Day Tropical Weather Outlook
    items.push({
      id: `nhc-7day-${now.getTime()}`,
      title: 'NHC 7-Day Tropical Weather Outlook',
      description: 'National Hurricane Center extended tropical weather formation potential for the Atlantic Basin',
      source: 'NOAA NHC',
      url: 'https://www.nhc.noaa.gov/gtwo.php',
      imageUrl: NHC_GRAPHICS.sevenDay,
      timestamp: now,
      category: 'alerts' as NewsCategory,
      priority: 'medium' as NewsPriority,
    });

    // Atlantic Satellite Imagery
    items.push({
      id: `nhc-satellite-${now.getTime()}`,
      title: 'Atlantic Basin Satellite Imagery',
      description: 'Real-time visible satellite loop of the Atlantic hurricane basin',
      source: 'NOAA NHC',
      url: 'https://www.nhc.noaa.gov/satellite.php',
      imageUrl: NHC_GRAPHICS.satellite,
      timestamp: now,
      category: 'severe' as NewsCategory,
      priority: 'medium' as NewsPriority,
    });

    console.log(`✓ Fetched ${items.length} NHC tropical outlook items`);
    return items;
  } catch (error) {
    console.error('Error fetching NHC tropical outlook:', error);
    return [];
  }
}

/**
 * Fetch GFS model graphics from NOAA NOMADS
 * Note: These are direct links to model output images
 */
export async function fetchGFSModelGraphics(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  const now = new Date();
  const modelRun = getLatestModelRun();
  const runTime = formatModelRun(modelRun);

  try {
    // Tropical Atlantic GFS Model
    const tropicsUrl = `https://mag.ncep.noaa.gov/data/gfs/${modelRun}/gfs_mslp_precip_tropatl_1.gif`;

    items.push({
      id: `gfs-tropics-${modelRun}-${now.getTime()}`,
      title: `GFS Model - Tropical Atlantic (${runTime})`,
      description: `Latest GFS ${runTime} model run showing mean sea level pressure and precipitation for the tropical Atlantic region. Updated 4 times daily.`,
      source: 'NOAA GFS',
      url: tropicsUrl, // Direct link to image for easy viewing
      imageUrl: tropicsUrl,
      timestamp: now,
      category: 'severe' as NewsCategory,
      priority: 'high' as NewsPriority,
    });

    // Americas/CONUS GFS Model
    const americasUrl = `https://mag.ncep.noaa.gov/data/gfs/${modelRun}/gfs_mslp_precip_us_1.gif`;

    items.push({
      id: `gfs-americas-${modelRun}-${now.getTime()}`,
      title: `GFS Model - Americas (${runTime})`,
      description: `Latest GFS ${runTime} model run showing mean sea level pressure and precipitation for North America. Updated 4 times daily.`,
      source: 'NOAA GFS',
      url: americasUrl, // Direct link to image for easy viewing
      imageUrl: americasUrl,
      timestamp: now,
      category: 'severe' as NewsCategory,
      priority: 'high' as NewsPriority,
    });

    // West Coast (Western US) GFS Model
    const westCoastUrl = `https://mag.ncep.noaa.gov/data/gfs/${modelRun}/gfs_mslp_precip_wus_1.gif`;

    items.push({
      id: `gfs-west-${modelRun}-${now.getTime()}`,
      title: `GFS Model - West Coast (${runTime})`,
      description: `Latest GFS ${runTime} model run for the Western United States showing mean sea level pressure and precipitation. Updated 4 times daily.`,
      source: 'NOAA GFS',
      url: westCoastUrl, // Direct link to image for easy viewing
      imageUrl: westCoastUrl,
      timestamp: now,
      category: 'severe' as NewsCategory,
      priority: 'high' as NewsPriority,
    });

    // East Coast (Eastern US) GFS Model
    const eastCoastUrl = `https://mag.ncep.noaa.gov/data/gfs/${modelRun}/gfs_mslp_precip_eus_1.gif`;

    items.push({
      id: `gfs-east-${modelRun}-${now.getTime()}`,
      title: `GFS Model - East Coast (${runTime})`,
      description: `Latest GFS ${runTime} model run for the Eastern United States showing mean sea level pressure and precipitation. Updated 4 times daily.`,
      source: 'NOAA GFS',
      url: eastCoastUrl, // Direct link to image for easy viewing
      imageUrl: eastCoastUrl,
      timestamp: now,
      category: 'severe' as NewsCategory,
      priority: 'high' as NewsPriority,
    });

    // Eastern Pacific GFS Model
    const epacUrl = `https://mag.ncep.noaa.gov/data/gfs/${modelRun}/gfs_mslp_precip_epac_1.gif`;

    items.push({
      id: `gfs-epac-${modelRun}-${now.getTime()}`,
      title: `GFS Model - Eastern Pacific (${runTime})`,
      description: `Latest GFS ${runTime} model run showing tropical weather potential in the Eastern Pacific. Updated 4 times daily.`,
      source: 'NOAA GFS',
      url: epacUrl, // Direct link to image for easy viewing
      imageUrl: epacUrl,
      timestamp: now,
      category: 'severe' as NewsCategory,
      priority: 'medium' as NewsPriority,
    });

    console.log(`✓ Fetched ${items.length} GFS model graphics for run ${modelRun}`);
    return items;
  } catch (error) {
    console.error('Error fetching GFS model graphics:', error);
    return [];
  }
}

/**
 * Fetch active tropical systems from NHC
 * Checks if there are any active hurricanes/storms
 */
export async function fetchActiveStorms(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];

  try {
    // Fetch NHC RSS feed for active storms
    const response = await fetch('https://www.nhc.noaa.gov/index-at.xml');

    if (!response.ok) {
      console.log('No active storms RSS available');
      return [];
    }

    const xmlText = await response.text();

    // Simple XML parsing for storm entries
    // In production, you might want to use a proper XML parser
    if (xmlText.includes('<item>')) {
      const now = new Date();

      items.push({
        id: `nhc-active-${now.getTime()}`,
        title: 'Active Tropical Systems - Check NHC',
        description: 'There are active tropical systems being monitored by the National Hurricane Center. Click to view current advisories.',
        source: 'NOAA NHC',
        url: 'https://www.nhc.noaa.gov/',
        imageUrl: NHC_GRAPHICS.satellite,
        timestamp: now,
        category: 'alerts' as NewsCategory,
        priority: 'high' as NewsPriority,
      });

      console.log('✓ Active tropical systems detected');
    } else {
      console.log('✓ No active tropical systems');
    }

    return items;
  } catch (error) {
    console.error('Error checking active storms:', error);
    return [];
  }
}

/**
 * Fetch all GFS and tropical model data for news feed
 */
export async function fetchAllGFSModelNews(): Promise<NewsItem[]> {
  console.log('\n🌀 Fetching GFS & Tropical Model Data...');

  const [nhcOutlook, gfsGraphics, activeStorms] = await Promise.all([
    fetchNHCTropicalOutlook(),
    fetchGFSModelGraphics(),
    fetchActiveStorms(),
  ]);

  const allItems = [...activeStorms, ...nhcOutlook, ...gfsGraphics];

  console.log(`✓ Total GFS/Tropical items: ${allItems.length}`);

  return allItems;
}

/**
 * Get GFS model update schedule
 */
export function getModelUpdateSchedule(): string[] {
  return [
    'Models update 4 times daily at:',
    '00:00 UTC (7:00 PM EST)',
    '06:00 UTC (1:00 AM EST)',
    '12:00 UTC (7:00 AM EST)',
    '18:00 UTC (1:00 PM EST)',
  ];
}

/**
 * Check if a model run is recent (within last 6 hours)
 */
export function isRecentModelRun(modelRun: ModelRun): boolean {
  const latestRun = getLatestModelRun();
  return modelRun === latestRun;
}
