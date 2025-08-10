# News Ticker Feature - v0.3.3

## Overview
The News Ticker is a real-time news feed that displays breaking news, weather alerts, and local updates in a scrolling ticker below the navigation bar. It integrates with multiple news sources to provide timely and relevant information to users.

## Features

### Phase 1 (Complete) ✅
- **Scrolling Animation**: Smooth horizontal scroll with fixed speed (30s duration)
- **Interactive Controls**: 
  - Pause/Play button to control scrolling
  - Close button with localStorage persistence
  - Refresh button for manual updates (Phase 2)
- **Category Filtering**: Breaking, Weather, Local, General news categories
- **Priority System**: High, Medium, Low priority levels
- **Theme Support**: Works with all three themes (dark, miami, tron)
- **Responsive Design**: Optimized for mobile and desktop
- **Mock Data**: Initial implementation with sample news items

### Phase 2 (Complete) ✅
- **Real News Integration**:
  - NewsAPI.org for breaking and general news
  - NOAA Weather Service for weather alerts
  - Automatic fallback to mock data if API unavailable
- **Caching System**: 5-minute cache to reduce API calls
- **Error Handling**: Graceful degradation with fallback content
- **Loading States**: Visual feedback during data fetching
- **Manual Refresh**: Button to force-refresh news content

## Setup Instructions

### 1. Get Your News API Key
1. Visit [NewsAPI.org](https://newsapi.org/register)
2. Sign up for a free account
3. Copy your API key from the dashboard

### 2. Configure Environment Variables
Add to your `.env.local` file:
```env
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key_here
```

### 3. Usage
The news ticker is automatically included in the navigation component:
```tsx
<NewsTicker 
  categories={['breaking', 'weather', 'local']}
  autoRefresh={300000} // 5 minutes
  maxItems={10}
  priority="all"
/>
```

## API Integration

### News Sources
1. **NewsAPI.org** (requires API key)
   - Breaking news
   - Local news
   - General news
   - Weather-related articles

2. **NOAA Weather Service** (no API key required)
   - Real-time weather alerts
   - Severe weather warnings
   - Emergency notifications

### Rate Limits
- NewsAPI Free Tier: 100 requests/day
- NOAA Weather API: No strict limits
- Internal caching: 5-minute cache duration

## Configuration

### News Categories
- `breaking`: Top headlines and breaking news
- `weather`: Weather alerts and climate news
- `local`: Regional and local news
- `general`: Science and technology news

### Priority Levels
- `high`: Breaking news, severe weather alerts
- `medium`: Weather warnings, important updates
- `low`: General updates, forecasts

### Customization Options
```typescript
interface NewsTickerProps {
  categories?: ('breaking' | 'weather' | 'local' | 'general')[];
  autoRefresh?: number; // milliseconds
  maxItems?: number;
  priority?: 'high' | 'medium' | 'low' | 'all';
}
```

## File Structure
```
components/NewsTicker/
├── index.tsx              # Main export
├── NewsTicker.tsx         # Core component
├── NewsTickerItem.tsx     # Individual news item
├── NewsTicker.module.css  # Styles
└── NewsTicker.test.tsx    # Unit tests

lib/
├── services/
│   └── newsService.ts     # API integration
├── hooks/
│   └── useNewsFeed.ts     # Custom hook
└── config/
    └── newsConfig.ts      # Configuration

```

## Performance Considerations

### Optimizations
- CSS transforms for smooth animation
- Will-change property for GPU acceleration
- Lazy loading of news data
- Request batching and caching
- Automatic cleanup of old cache entries

### Accessibility
- Pause on hover for readability
- Respects prefers-reduced-motion
- ARIA labels for screen readers
- Keyboard navigation support

## Troubleshooting

### No News Displaying
1. Check if `NEXT_PUBLIC_NEWS_API_KEY` is set in `.env.local`
2. Verify API key is valid at [NewsAPI.org](https://newsapi.org)
3. Check browser console for error messages
4. Ensure you haven't exceeded API rate limits

### Ticker Not Animating
1. Check if animation is paused (pause button)
2. Verify CSS is loading correctly
3. Check for JavaScript errors in console
4. Test in different browser

### News Not Updating
1. Default refresh interval is 5 minutes
2. Use refresh button for manual update
3. Check network connectivity
4. Verify API services are available

## Future Enhancements (Phase 3-4)

### Planned Features
- [ ] Geolocation-based local news
- [ ] User preference settings
- [ ] Multiple ticker speeds
- [ ] RSS feed integration
- [ ] Custom news sources
- [ ] Breaking news notifications
- [ ] Historical news archive
- [ ] Search functionality
- [ ] Category icons customization
- [ ] Multi-language support

## Testing

### Run Tests
```bash
npm test -- NewsTicker
```

### Manual Testing Checklist
- [ ] Ticker scrolls smoothly
- [ ] Pause/play works correctly
- [ ] Close button persists state
- [ ] News items are clickable
- [ ] Categories filter properly
- [ ] Priority filtering works
- [ ] Theme changes apply correctly
- [ ] Mobile responsive behavior
- [ ] API fallback works

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Optimized

## License
Copyright (C) 2025 16-Bit Weather
Licensed under Fair Source License, Version 0.9