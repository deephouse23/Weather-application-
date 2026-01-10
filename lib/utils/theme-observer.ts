/**
 * ThemeObserver - Ensures all dynamically loaded content inherits theme styling
 * Watches the DOM for new elements and applies the current theme
 */

import { ThemeType } from '@/lib/theme-config';

export class ThemeObserver {
  private currentTheme: ThemeType;
  private observer: MutationObserver | null = null;

  constructor(initialTheme: ThemeType = 'dark') {
    this.currentTheme = initialTheme;
  }

  /**
   * Initialize the observer and apply theme to document
   */
  initialize(theme: ThemeType) {
    this.currentTheme = theme;
    this.applyThemeToDocument(theme);
    this.observeDOM();
  }

  /**
   * Apply theme class to document body and root
   */
  applyThemeToDocument(theme: ThemeType) {
    if (typeof window === 'undefined') return;

    // Remove all theme classes from body
    const allThemes: ThemeType[] = [
      'dark', 'miami', 'synthwave84', 'dracula', 'cyberpunk', 'matrix'
    ];

    allThemes.forEach(t => {
      document.body.classList.remove(`theme-${t}`);
      document.documentElement.classList.remove(`theme-${t}`);
    });

    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.setAttribute('data-theme', theme);
  }

  /**
   * Watch for new elements added to the DOM
   */
  observeDOM() {
    if (typeof window === 'undefined') return;
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.applyThemeToElement(node as Element);
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Apply theme class to a specific element and its children
   */
  applyThemeToElement(element: Element) {
    if (!element.classList) return;

    // Add theme class if it's a significant element
    if (
      element.classList.contains('card') ||
      element.classList.contains('Card') ||
      element.classList.contains('container') ||
      element.hasAttribute('data-weather-value') ||
      element.classList.contains('forecast-card') ||
      element.classList.contains('stat-card')
    ) {
      element.classList.add(`theme-${this.currentTheme}`);
      element.setAttribute('data-theme-target', 'true');
    }

    // Apply to all children
    element.querySelectorAll('*').forEach(child => {
      if (
        child.classList.contains('card') ||
        child.classList.contains('Card') ||
        child.classList.contains('container') ||
        child.hasAttribute('data-weather-value')
      ) {
        child.classList.add(`theme-${this.currentTheme}`);
        child.setAttribute('data-theme-target', 'true');
      }
    });
  }

  /**
   * Update the current theme
   */
  updateTheme(newTheme: ThemeType) {
    this.currentTheme = newTheme;
    this.applyThemeToDocument(newTheme);

    // Reapply to all existing elements with theme-target attribute
    if (typeof window !== 'undefined') {
      document.querySelectorAll('[data-theme-target]').forEach(element => {
        // Remove old theme classes
        const allThemes: ThemeType[] = [
          'dark', 'miami', 'synthwave84', 'dracula', 'cyberpunk', 'matrix'
        ];
        allThemes.forEach(t => {
          element.classList.remove(`theme-${t}`);
        });
        // Add new theme class
        element.classList.add(`theme-${newTheme}`);
      });
    }
  }

  /**
   * Disconnect the observer
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Singleton instance
let themeObserverInstance: ThemeObserver | null = null;

/**
 * Get or create the ThemeObserver singleton
 */
export function getThemeObserver(initialTheme: ThemeType = 'dark'): ThemeObserver {
  if (typeof window === 'undefined') {
    // Return a dummy observer for SSR
    return {
      initialize: () => {},
      updateTheme: () => {},
      applyThemeToDocument: () => {},
      disconnect: () => {},
    } as any;
  }

  if (!themeObserverInstance) {
    themeObserverInstance = new ThemeObserver(initialTheme);
  }
  return themeObserverInstance;
}

