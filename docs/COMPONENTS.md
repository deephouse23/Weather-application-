# 16-Bit Weather Platform - Components Library

**Version:** 0.6.0
**Last Updated:** January 2025

---

## Main Application Components

### `app/page.tsx`

Homepage with weather search and display.

**Features:**
- Weather search input with autocomplete
- Current weather display
- 5-day forecast
- Environmental data (UV, AQI, pollen)
- Interactive weather map
- Auto-location detection on mount
- Rate limiting (10 searches per hour)
- Search result caching

---

### `app/dashboard/page.tsx`

User dashboard for authenticated users.

**Features:**
- Saved locations grid
- Weather summary cards
- Add new location modal
- Quick weather details
- Theme selector
- Profile access

**Auth Required:** Yes

---

### `app/weather/[city]/page.tsx`

Dynamic city weather pages with SEO optimization.

**Features:**
- Server-side data fetching
- Dynamic metadata generation
- Detailed weather information
- Interactive map centered on city
- Breadcrumb navigation

---

## Weather Components

### `components/forecast.tsx`

5-day weather forecast display with expandable details.

**Props:**
```typescript
interface ForecastProps {
  forecast: ForecastData[];
  onDayClick?: (day: ForecastData) => void;
}
```

**Usage:**
```tsx
<Forecast forecast={forecastData} onDayClick={handleDayClick} />
```

---

### `components/expandable-forecast.tsx`

Enhanced forecast with collapsible detailed view.

**Features:**
- Animated expansion
- Hourly breakdown
- Precipitation charts
- Wind direction indicators

**Props:**
```typescript
interface ExpandableForecastProps {
  forecast: ForecastData[];
}
```

---

### `components/environmental-display.tsx`

Display environmental data (UV, AQI, pollen) in a grid.

**Props:**
```typescript
interface EnvironmentalDisplayProps {
  weatherData: WeatherData;
}
```

**Usage:**
```tsx
<EnvironmentalDisplay weatherData={data} />
```

---

### `components/air-quality-display.tsx`

Detailed air quality information with health recommendations.

**Props:**
```typescript
interface AirQualityDisplayProps {
  airQuality: AirQualityData;
  compact?: boolean;
}
```

**Features:**
- AQI level indicator
- Pollutant breakdown
- Health recommendations
- Color-coded severity

---

### `components/pollen-display.tsx`

Pollen count display with allergy information.

**Props:**
```typescript
interface PollenDisplayProps {
  pollenData: PollenData;
}
```

**Features:**
- Tree, grass, weed pollen levels
- Color-coded severity
- Allergy risk assessment

---

### `components/sunrise-sunset.tsx`

Sunrise and sunset times with moon phase.

**Props:**
```typescript
interface SunriseSunsetProps {
  sunrise: number; // Unix timestamp
  sunset: number; // Unix timestamp
  moonPhase?: number; // 0-1
}
```

**Features:**
- Formatted time display
- Moon phase icon
- Illumination percentage

---

## Map Components

### `components/weather-map-openlayers.tsx`

OpenLayers-based weather radar map with NEXRAD data.

**Props:**
```typescript
interface WeatherMapProps {
  lat: number;
  lon: number;
  mode?: 'animation' | 'static';
}
```

**Features:**
- NEXRAD radar overlay
- 49-frame animation (4-hour window)
- Timeline controls
- Location marker
- Zoom/pan controls
- Base map with OpenStreetMap tiles

**Usage:**
```tsx
<WeatherMapOpenLayers lat={37.7749} lon={-122.4194} mode="animation" />
```

---

### `components/lazy-weather-map.tsx`

Lazy-loaded wrapper for weather map to improve initial load performance.

**Props:**
```typescript
interface LazyWeatherMapProps {
  lat: number;
  lon: number;
}
```

**Usage:**
```tsx
<LazyWeatherMap lat={37.7749} lon={-122.4194} />
```

---

## Dashboard Components

### `components/dashboard/location-card.tsx`

Saved location card with weather summary.

**Props:**
```typescript
interface LocationCardProps {
  location: SavedLocation;
  onDelete: () => void;
  onClick: () => void;
}
```

**Features:**
- Weather summary
- Delete button
- Click to view details

---

### `components/dashboard/add-location-modal.tsx`

Modal for adding new saved locations.

**Features:**
- City search with autocomplete
- Coordinate input
- GPS location detection
- Form validation

**Props:**
```typescript
interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationAdded: (location: SavedLocation) => void;
}
```

---

### `components/dashboard/theme-selector.tsx`

Grid of theme options with preview.

**Features:**
- Theme preview cards
- Active theme indicator
- Instant theme switching
- Persistence to user preferences

**Props:**
```typescript
interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}
```

---

### `components/dashboard/detailed-weather-modal.tsx`

Full weather details modal from dashboard.

**Features:**
- All weather metrics
- Forecast view
- Environmental data
- Map view

**Props:**
```typescript
interface DetailedWeatherModalProps {
  location: SavedLocation;
  isOpen: boolean;
  onClose: () => void;
}
```

---

## News Components (v0.6.0)

Located in `components/news/`

### `NewsGrid.tsx`

Grid layout for news articles with auto-detection of model cards.

**Props:**
```typescript
interface NewsGridProps {
  articles: NewsArticle[];
  loading?: boolean;
}
```

---

### `NewsCard.tsx`

Standard news article card.

**Props:**
```typescript
interface NewsCardProps {
  article: NewsArticle;
}
```

**Features:**
- Article title, description, image
- Source badge
- Category badge
- Priority indicator
- Publish date

---

### `ModelCard.tsx`

Special card for GFS model graphics display.

**Props:**
```typescript
interface ModelCardProps {
  model: GFSModel;
}
```

**Features:**
- Model image display
- Forecast time indicator
- Model run information
- Click to enlarge

---

### `NewsHero.tsx`

Featured news hero section.

**Props:**
```typescript
interface NewsHeroProps {
  article: NewsArticle;
}
```

---

### `NewsFilter.tsx`

Category and priority filtering UI.

**Props:**
```typescript
interface NewsFilterProps {
  selectedCategory?: string;
  selectedPriority?: string;
  onCategoryChange: (category: string) => void;
  onPriorityChange: (priority: string) => void;
}
```

---

### `NewsTicker/`

Breaking news ticker component.

**Files:**
- `NewsTicker.tsx` - Main ticker container
- `NewsTickerItem.tsx` - Individual ticker item

**Props:**
```typescript
interface NewsTickerProps {
  items: NewsTickerItem[];
  speed?: number; // pixels per second
}
```

---

### `CategoryBadge.tsx`

Category indicator badges.

**Props:**
```typescript
interface CategoryBadgeProps {
  category: string;
}
```

---

### `PriorityIndicator.tsx`

Priority level indicators.

**Props:**
```typescript
interface PriorityIndicatorProps {
  priority: 'high' | 'medium' | 'low';
}
```

---

### `NewsEmpty.tsx`

Empty state component when no news available.

---

### `NewsSkeleton.tsx`

Loading skeleton for news cards.

---

## Games Components (v0.6.0)

Located in `components/games/`

### `GameCard.tsx`

Game card with metadata, play count, and preview.

**Props:**
```typescript
interface GameCardProps {
  game: Game;
  onPlay: () => void;
}
```

**Features:**
- Game title, description
- Category and difficulty badges
- Play count
- High score
- Preview image/icon

---

### `Leaderboard.tsx`

High score leaderboard display.

**Props:**
```typescript
interface LeaderboardProps {
  gameSlug: string;
  scores: GameScore[];
}
```

**Features:**
- Top 10 scores
- Player names
- Score values
- Timestamps
- Rank indicators

---

### `ScoreSubmitModal.tsx`

Score submission modal with validation.

**Props:**
```typescript
interface ScoreSubmitModalProps {
  gameSlug: string;
  score: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string) => void;
}
```

**Features:**
- Player name input
- Score validation
- Submit button
- Loading state

---

## Learn Components (v0.6.0)

Located in `components/learn/`

### `LearningCard.tsx`

Educational content card with links to learning sections.

**Props:**
```typescript
interface LearningCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}
```

---

## Hourly Forecast Components (v0.6.0)

### `components/hourly-forecast.tsx`

48-hour hourly forecast component.

**Props:**
```typescript
interface HourlyForecastProps {
  hourlyData: HourlyData[];
}
```

**Features:**
- Temperature, precipitation, wind, humidity per hour
- Modern weather icons (Meteocons)
- Visual temperature graphs
- Scrollable timeline

---

### `components/lazy-hourly-forecast.tsx`

Lazy-loaded wrapper for performance.

**Props:**
```typescript
interface LazyHourlyForecastProps {
  hourlyData: HourlyData[];
}
```

---

### `components/modern-weather-icon.tsx`

Modern weather icon renderer using Meteocons.

**Props:**
```typescript
interface ModernWeatherIconProps {
  condition: string;
  size?: number;
  className?: string;
}
```

**Usage:**
```tsx
<ModernWeatherIcon condition="clear-day" size={48} />
```

---

## Authentication Components

### `components/auth/auth-button.tsx`

Login/Signup button with auth state.

**Features:**
- Shows "Login" when logged out
- Shows user avatar when logged in
- Dropdown menu with profile/logout

**Props:**
```typescript
interface AuthButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
}
```

---

### `components/auth/auth-form.tsx`

Unified authentication form for login/signup.

**Props:**
```typescript
interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}
```

**Features:**
- Email/password validation (Zod schema)
- Error handling
- Loading states
- Password strength indicator (signup)

---

### `components/auth/signin-prompt-modal.tsx`

Modal prompting users to sign in for features.

**Props:**
```typescript
interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}
```

**Features:**
- Triggered when accessing auth-required features
- Direct link to login page
- Dismissible

---

## UI Components (Radix UI Based)

Located in `components/ui/`

All components are built with:
- Full keyboard accessibility
- ARIA labels
- Focus management
- TypeScript props
- Tailwind CSS styling
- Class Variance Authority for variants

### `button.tsx`

**Variants:**
- default
- destructive
- outline
- secondary
- ghost
- link

**Sizes:**
- default
- sm
- lg
- icon

**Usage:**
```tsx
<Button variant="default" size="lg">Click Me</Button>
```

---

### `input.tsx`

Form input with error states.

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
```

---

### `card.tsx`

Card container with header, content, footer.

**Components:**
- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `CardContent`
- `CardFooter`

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

---

### `dialog.tsx`

Modal dialog with overlay.

**Components:**
- `Dialog`
- `DialogTrigger`
- `DialogContent`
- `DialogHeader`
- `DialogTitle`
- `DialogDescription`
- `DialogFooter`

---

### `dropdown-menu.tsx`

Dropdown menu with keyboard navigation.

**Components:**
- `DropdownMenu`
- `DropdownMenuTrigger`
- `DropdownMenuContent`
- `DropdownMenuItem`
- `DropdownMenuSeparator`
- `DropdownMenuLabel`

---

### `tabs.tsx`

Tab navigation.

**Components:**
- `Tabs`
- `TabsList`
- `TabsTrigger`
- `TabsContent`

---

### `toast.tsx`

Toast notifications using Sonner.

**Usage:**
```tsx
import { toastService } from '@/lib/toast-service';

toastService.success('Operation successful');
toastService.error('An error occurred');
toastService.info('Information message');
toastService.warning('Warning message');
```

---

### `avatar.tsx`

User avatar with fallback.

**Components:**
- `Avatar`
- `AvatarImage`
- `AvatarFallback`

---

### `badge.tsx`

Status badges.

**Variants:**
- default
- secondary
- destructive
- outline

---

### `separator.tsx`

Divider line (horizontal or vertical).

---

### `skeleton.tsx`

Loading skeleton for content placeholders.

**Usage:**
```tsx
<Skeleton className="h-4 w-[250px]" />
```

---

### `toggle.tsx`

Toggle button with on/off states.

---

### `form.tsx`

Form field wrapper with label, description, and error message.

**Components:**
- `Form`
- `FormField`
- `FormItem`
- `FormLabel`
- `FormControl`
- `FormDescription`
- `FormMessage`

**Usage with React Hook Form:**
```tsx
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormDescription>Your email address</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

## Component Best Practices

### Performance
- Use lazy loading for heavy components (maps, charts)
- Implement React.memo for expensive re-renders
- Use dynamic imports for code splitting

### Accessibility
- All interactive components have keyboard navigation
- ARIA labels on all meaningful elements
- Focus management in modals and dropdowns
- Color contrast meets WCAG AA standards

### TypeScript
- All components have full TypeScript definitions
- Props interfaces exported for reuse
- Generic types where appropriate

### Styling
- Tailwind CSS for all styling
- CSS custom properties for theme variables
- Responsive design (mobile-first)
- Dark mode support via themes

---

**For more details:**
- [Architecture Documentation](./ARCHITECTURE.md)
- [Features Documentation](./FEATURES.md)
- [API Reference](./API_REFERENCE.md)
