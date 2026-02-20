/**
 * Theme Service - Handles theme access control and persistence
 */

import { createClient } from '@supabase/supabase-js';
import { ThemeType, isThemePremium, THEME_DEFINITIONS } from '../theme-config';

export interface UserThemePreference {
  user_id: string;
  theme_name: ThemeType;
  created_at?: string;
  updated_at?: string;
}

export class ThemeService {
  private static readonly DEFAULT_THEME: ThemeType = 'nord';
  private static readonly THEME_STORAGE_KEY = 'weather-theme';

  /**
   * Check if user can access a theme
   */
  static canAccessTheme(theme: ThemeType, isAuthenticated: boolean): boolean {
    if (!isThemePremium(theme)) {
      return true; // Free themes are accessible to everyone
    }
    return isAuthenticated; // Premium themes require authentication
  }

  /**
   * Get valid theme for user based on authentication status
   */
  static getValidTheme(requestedTheme: ThemeType, isAuthenticated: boolean): ThemeType {
    if (this.canAccessTheme(requestedTheme, isAuthenticated)) {
      return requestedTheme;
    }
    return this.DEFAULT_THEME;
  }

  /**
   * Save theme preference to Supabase for authenticated users
   */
  static async saveThemeToDatabase(
    supabase: any,
    userId: string,
    theme: ThemeType
  ): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            theme_name: theme,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;
      return {};
    } catch (error) {
      console.error('Error saving theme preference:', error);
      return { error: error as Error };
    }
  }

  /**
   * Load theme preference from Supabase for authenticated users
   */
  static async loadThemeFromDatabase(
    supabase: any,
    userId: string
  ): Promise<{ theme?: ThemeType; error?: Error }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme_name')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return { theme: data?.theme_name };
    } catch (error) {
      console.error('Error loading theme preference:', error);
      return { error: error as Error };
    }
  }

  /**
   * Save theme to local storage (for all users)
   */
  static saveThemeToLocalStorage(theme: ThemeType): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.THEME_STORAGE_KEY, theme);
      }
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }

  /**
   * Load theme from local storage
   */
  static loadThemeFromLocalStorage(): ThemeType | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
        if (savedTheme && THEME_DEFINITIONS[savedTheme as ThemeType]) {
          return savedTheme as ThemeType;
        }
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
    return null;
  }

  /**
   * Clear theme from local storage (useful when user logs out)
   */
  static clearThemeFromLocalStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.THEME_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing theme from localStorage:', error);
    }
  }

  /**
   * Apply theme to document
   */
  static applyThemeToDocument(theme: ThemeType): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Ensure exact application of standard themes mapping
      root.setAttribute('data-theme', theme);
      root.className = theme;
    }
  }
}