export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          preferred_units: 'metric' | 'imperial'
          default_location: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: 'metric' | 'imperial'
          default_location?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: 'metric' | 'imperial'
          default_location?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_locations: {
        Row: {
          id: string
          user_id: string
          location_name: string
          city: string
          state: string | null
          country: string
          latitude: number
          longitude: number
          is_favorite: boolean
          custom_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location_name: string
          city: string
          state?: string | null
          country: string
          latitude: number
          longitude: number
          is_favorite?: boolean
          custom_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location_name?: string
          city?: string
          state?: string | null
          country?: string
          latitude?: number
          longitude?: number
          is_favorite?: boolean
          custom_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          temperature_unit: 'celsius' | 'fahrenheit'
          wind_unit: 'mph' | 'kmh' | 'ms'
          pressure_unit: 'hpa' | 'inhg' | 'mmhg'
          auto_location: boolean
          notifications_enabled: boolean
          email_alerts: boolean
          severe_weather_alerts: boolean
          daily_forecast_email: boolean
          news_ticker_enabled: boolean
          animation_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          temperature_unit?: 'celsius' | 'fahrenheit'
          wind_unit?: 'mph' | 'kmh' | 'ms'
          pressure_unit?: 'hpa' | 'inhg' | 'mmhg'
          auto_location?: boolean
          notifications_enabled?: boolean
          email_alerts?: boolean
          severe_weather_alerts?: boolean
          daily_forecast_email?: boolean
          news_ticker_enabled?: boolean
          animation_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          temperature_unit?: 'celsius' | 'fahrenheit'
          wind_unit?: 'mph' | 'kmh' | 'ms'
          pressure_unit?: 'hpa' | 'inhg' | 'mmhg'
          auto_location?: boolean
          notifications_enabled?: boolean
          email_alerts?: boolean
          severe_weather_alerts?: boolean
          daily_forecast_email?: boolean
          news_ticker_enabled?: boolean
          animation_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type SavedLocation = Database['public']['Tables']['saved_locations']['Row']
export type SavedLocationInsert = Database['public']['Tables']['saved_locations']['Insert']
export type SavedLocationUpdate = Database['public']['Tables']['saved_locations']['Update']

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']