import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
// removed ThemeType import as manual mapping is gone, but we might accept the prop for compat
import type { ThemeType } from "@/lib/theme-config"
import ModernWeatherIcon from "./modern-weather-icon"

interface ForecastDay {
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
  country?: string;
}

interface ForecastProps {
  forecast: ForecastDay[];
  theme?: ThemeType; // Kept for prop output compatibility
  onDayClick?: (index: number) => void;
  selectedDay?: number | null;
}

export default function Forecast({ forecast, onDayClick, selectedDay }: ForecastProps) {
  // Determine number of days to show (max 7, or length if less)
  const daysToShow = forecast.length >= 7 ? 7 : Math.min(forecast.length, 5);
  const displayForecast = forecast.slice(0, daysToShow);

  const title = displayForecast.length > 5 ? "7-DAY FORECAST" : "5-DAY FORECAST";

  // Dynamic grid columns based on number of days
  const gridColsClass = displayForecast.length > 5
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

  return (
    <Card className="p-3 sm:p-4 lg:p-6 border-2 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-in">
      <CardHeader className="p-0 mb-3 sm:mb-4">
        <CardTitle className="text-center text-base sm:text-lg lg:text-xl font-extrabold uppercase tracking-wider text-primary glow">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn("grid gap-2 sm:gap-3 lg:gap-4", gridColsClass)}>
          {displayForecast.map((day, index) => (
            <ForecastCard
              key={index}
              day={day}
              index={index}
              onDayClick={onDayClick}
              isSelected={selectedDay === index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastCard({ day, index, onDayClick, isSelected }: {
  day: ForecastDay;
  index: number;
  onDayClick?: (index: number) => void;
  isSelected?: boolean;
}) {
  const isUSALocation = day.country === 'US' || day.country === 'USA';
  const tempUnit = isUSALocation ? '°F' : '°C';

  // Generate date in M.DD.YY format
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + index);
  const month = targetDate.getMonth() + 1;
  const date = targetDate.getDate();
  const year = targetDate.getFullYear().toString().slice(-2);
  const formattedDate = `${month}.${date.toString().padStart(2, '0')}.${year}`;

  const handleClick = () => {
    if (onDayClick) {
      onDayClick(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 card-interactive",
        "flex flex-col justify-between min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]",
        "backdrop-blur-sm bg-card/80",
        isSelected && "ring-2 ring-primary ring-opacity-80 scale-105 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Forecast for ${day.day}: High ${Math.round(day.highTemp)}${tempUnit}, Low ${Math.round(day.lowTemp)}${tempUnit}, ${day.description}`}
      aria-pressed={isSelected}
    >
      <CardContent className="p-2 sm:p-3 flex flex-col items-center justify-between h-full">
        {/* Day - Mobile responsive */}
        <div className="text-xs sm:text-sm font-bold text-primary mb-1 uppercase tracking-wider glow text-center">
          <span className="sm:hidden">{day.day.substring(0, 3)}</span>
          <span className="hidden sm:inline">{day.day}</span>
          <div className="text-[10px] text-muted-foreground mt-1">
            {formattedDate}
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center my-2">
          <ModernWeatherIcon
            condition={day.condition}
            size={40}
            className="hover:scale-110 transition-transform drop-shadow"
          />
        </div>

        {/* Temp */}
        <div className="space-y-1 text-center">
          <div className="text-sm sm:text-base lg:text-lg font-bold text-foreground pixel-glow">
            {Math.round(day.highTemp)}{tempUnit}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">
            {Math.round(day.lowTemp)}{tempUnit}
          </div>
        </div>

        {/* Description - Mobile responsive */}
        <div className="text-[10px] text-primary/80 capitalize mt-2 text-center w-full truncate leading-tight">
          <span className="sm:hidden">
            {day.description.length > 12 ? `${day.description.substring(0, 10)}...` : day.description}
          </span>
          <span className="hidden sm:inline">
            {day.description.length > 20 ? `${day.description.substring(0, 18)}...` : day.description}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 