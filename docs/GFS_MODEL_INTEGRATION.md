# GFS Model Integration

## Overview

The 16-Bit Weather news feed now includes **GFS (Global Forecast System) model graphics** and **NHC (National Hurricane Center) tropical weather outlooks** directly in the news stream. These model graphics are updated 4 times daily and provide professional weather model forecasts for the tropics and Americas.

## Features

### 1. GFS Model Graphics
- **Tropical Atlantic**: Latest GFS model showing mean sea level pressure and precipitation for tropical regions
- **Americas/CONUS**: North America weather model forecasts
- **Eastern Pacific**: Tropical weather potential in the Eastern Pacific

### 2. NHC Tropical Outlooks
- **2-Day Outlook**: 48-hour tropical weather formation potential for the Atlantic Basin
- **7-Day Outlook**: Extended tropical weather formation potential
- **Atlantic Satellite**: Real-time visible satellite imagery of the Atlantic hurricane basin
- **Active Storm Tracking**: Automatic detection of active tropical systems

### 3. Update Schedule
GFS models are updated 4 times daily at:
- **00:00 UTC** (7:00 PM EST)
- **06:00 UTC** (1:00 AM EST)
- **12:00 UTC** (7:00 AM EST)
- **18:00 UTC** (1:00 PM EST)

## Data Sources

### NOAA GFS (Global Forecast System)
- **Source**: NOAA NOMADS Server (https://mag.ncep.noaa.gov/)
- **License**: Public Domain (US Government)
- **Update Frequency**: 4 times daily
- **Coverage**: Global, with focus on tropics and Americas

### National Hurricane Center (NHC)
- **Source**: NOAA NHC (https://www.nhc.noaa.gov/)
- **License**: Public Domain (US Government)
- **Update Frequency**: Continuous during tropical season
- **Coverage**: Atlantic, Eastern Pacific, Central Pacific basins

## Technical Implementation

### Service Architecture

```
lib/services/gfsModelService.ts
├── fetchNHCTropicalOutlook()     # NHC graphics and outlooks
├── fetchGFSModelGraphics()        # GFS model runs
├── fetchActiveStorms()            # Active tropical system detection
└── fetchAllGFSModelNews()         # Aggregates all GFS/tropical data
```

### Integration Points

1. **News Aggregator** ([lib/services/newsAggregator.ts](../lib/services/newsAggregator.ts))
   - GFS models are now a standard news source
   - Enabled by default with source: `'gfs'`

2. **News Display** ([components/news/](../components/news/))
   - **ModelCard**: Special component for displaying weather model graphics
   - **NewsGrid**: Automatically uses ModelCard for GFS/NHC items
   - **NewsHero**: Featured model graphics use larger ModelCard variant

### Usage Example

```typescript
import { fetchAllGFSModelNews } from '@/lib/services/gfsModelService';

// Fetch all GFS and tropical model data
const gfsNews = await fetchAllGFSModelNews();

// Returns NewsItem[] with:
// - Latest GFS model run images
// - NHC tropical outlooks
// - Active storm information (if any)
```

## Model Product Details

### GFS Tropical Atlantic
- **URL Pattern**: `https://mag.ncep.noaa.gov/data/gfs/{run}/gfs_mslp_precip_tropatl_1.gif`
- **Shows**: Mean sea level pressure, precipitation
- **Region**: Tropical Atlantic (hurricane main development region)
- **Priority**: High

### GFS Americas/CONUS
- **URL Pattern**: `https://mag.ncep.noaa.gov/data/gfs/{run}/gfs_mslp_precip_us_1.gif`
- **Shows**: Mean sea level pressure, precipitation
- **Region**: North America
- **Priority**: High

### GFS Eastern Pacific
- **URL Pattern**: `https://mag.ncep.noaa.gov/data/gfs/{run}/gfs_mslp_precip_epac_1.gif`
- **Shows**: Mean sea level pressure, precipitation
- **Region**: Eastern Pacific (tropical cyclone region)
- **Priority**: Medium

### NHC 2-Day Outlook
- **URL**: `https://www.nhc.noaa.gov/xgtwo/two_atl_2d0.png`
- **Shows**: 48-hour tropical formation potential
- **Category**: Alerts
- **Priority**: High

### NHC 7-Day Outlook
- **URL**: `https://www.nhc.noaa.gov/xgtwo/two_atl_5d0.png`
- **Shows**: Extended tropical formation potential
- **Category**: Alerts
- **Priority**: Medium

## UI Components

### ModelCard Component
Location: [components/news/ModelCard.tsx](../components/news/ModelCard.tsx)

Special card designed for weather model graphics featuring:
- Large, high-quality image display (unoptimized for external sources)
- Source and timestamp badges
- Model run time indicator
- "View Full Model" link to source
- Priority indicators
- Retro terminal aesthetic matching app theme

**Variants**:
- `default`: Grid layout for news feed
- `featured`: Full-width hero display for featured models

### Automatic Detection
The news system automatically detects GFS and NHC items based on source name:
```typescript
const isModelGraphic = (item: NewsItem) => {
  return item.source === 'NOAA GFS' || item.source === 'NOAA NHC';
};
```

## Configuration

### Enable/Disable GFS Models

To enable or disable GFS models in the news feed:

```typescript
// In news API route or aggregator call
const result = await aggregateNews({
  sources: ['noaa', 'nasa', 'fox', 'reddit', 'gfs'], // Include 'gfs'
  maxItems: 30,
});
```

To disable, simply remove `'gfs'` from the sources array.

### Cache Settings

GFS model data is cached for 5 minutes by default (same as other news sources).

To modify cache duration, edit `CACHE_DURATION` in [lib/services/newsAggregator.ts](../lib/services/newsAggregator.ts).

## Best Practices

### 1. Image Loading
- GFS images use `unoptimized={true}` in Next.js Image component
- External images from NOAA servers change frequently
- Loading states show refresh spinner
- Error states display friendly fallback message

### 2. Priority Levels
- **High**: Active storms, latest GFS tropical models, 2-day NHC outlook
- **Medium**: GFS Americas, 7-day NHC outlook, Eastern Pacific
- **Low**: Satellite imagery (supplementary content)

### 3. Categorization
- **Alerts**: NHC outlooks, active storm notifications
- **Severe**: GFS model forecasts, satellite imagery

### 4. Deduplication
Model graphics are NOT deduplicated like news articles because:
- Each model run is unique
- Timestamps distinguish between different runs
- Model runs are updated only 4x daily

## Troubleshooting

### Images Not Loading
**Issue**: GFS or NHC images fail to load

**Solutions**:
1. Check NOAA server status at https://www.noaa.gov/
2. Verify model run time is recent (within last 6 hours)
3. Check browser console for CORS errors
4. Try accessing image URL directly in browser

### Outdated Model Runs
**Issue**: Model graphics show old timestamps

**Solutions**:
1. Wait for next model run (runs at 00Z, 06Z, 12Z, 18Z)
2. Clear news cache: `clearNewsCache()` from aggregator
3. Refresh browser page

### Missing Tropical Outlooks
**Issue**: NHC graphics not appearing in feed

**Solutions**:
1. Verify `'gfs'` is included in news sources
2. Check if priority filter is excluding medium/high priority items
3. Verify NHC website is accessible: https://www.nhc.noaa.gov/

## Future Enhancements

Potential additions for future versions:

1. **Additional Models**
   - European Model (ECMWF) - requires subscription
   - UKMET Model
   - Hurricane-specific models (HWRF, HAFS)

2. **Interactive Features**
   - Model animation playback
   - Multiple time steps
   - Layer overlays (wind, pressure, precipitation)

3. **Comparison Views**
   - Side-by-side model comparison
   - Ensemble model spread
   - Model accuracy tracking

4. **Storm-Specific Pages**
   - Dedicated pages for active tropical systems
   - Model track comparisons
   - Intensity forecasts

## Related Documentation

- [News Aggregator Service](../lib/services/newsAggregator.ts)
- [GFS Model Service](../lib/services/gfsModelService.ts)
- [Model Card Component](../components/news/ModelCard.tsx)
- [News API Route](../app/api/news/aggregate/route.ts)

## External Resources

- [NOAA GFS Model Info](https://www.nco.ncep.noaa.gov/pmb/products/gfs/)
- [NHC Graphics Explained](https://www.nhc.noaa.gov/aboutnhcgraphics.shtml)
- [NOMADS Server](https://nomads.ncep.noaa.gov/)
- [Tropical Tidbits](https://www.tropicaltidbits.com/) - Popular weather model visualization

## License & Attribution

All GFS model graphics and NHC tropical outlooks are **public domain** as they are produced by the US Government (NOAA).

**Attribution**: While not legally required, it's recommended to credit NOAA/NHC:
```
Data Source: NOAA Global Forecast System (GFS)
Data Source: NOAA National Hurricane Center (NHC)
```

This is already handled automatically in the news item metadata (source field).
