export interface WeatherPreferences {
  theme: 'dark-terminal' | 'miami-vice' | 'tron-grid' | 'amber-monitor'
  defaultLocation: string
  favoriteLocations: string[]
  units: {
    temperature: 'celsius' | 'fahrenheit' | 'kelvin'
    windSpeed: 'mph' | 'kmh' | 'ms' | 'knots'
    pressure: 'inHg' | 'hPa' | 'mmHg' | 'atm'
    visibility: 'miles' | 'kilometers'
  }
  display: {
    scanLines: boolean
    cursorBlink: 'slow' | 'normal' | 'fast' | 'off'
    soundEffects: boolean
    fontSize: 'small' | 'medium' | 'large'
    refreshInterval: 1 | 5 | 15 | 30
  }
  notifications: {
    weatherAlerts: boolean
    severity: 'high' | 'medium' | 'low'
    browser: boolean
    sound: boolean
  }
}

export const defaultPreferences: WeatherPreferences = {
  theme: 'dark-terminal',
  defaultLocation: '',
  favoriteLocations: [],
  units: {
    temperature: 'fahrenheit',
    windSpeed: 'mph',
    pressure: 'inHg',
    visibility: 'miles'
  },
  display: {
    scanLines: true,
    cursorBlink: 'normal',
    soundEffects: false,
    fontSize: 'medium',
    refreshInterval: 15
  },
  notifications: {
    weatherAlerts: true,
    severity: 'medium',
    browser: true,
    sound: false
  }
} 