/**
 * Unit tests for theme configuration
 */

import {
  THEME_DEFINITIONS,
  THEME_LIST,
  FREE_THEMES,
  PREMIUM_THEMES,
  isThemePremium,
  getThemeDefinition,
  type ThemeType,
} from '@/lib/theme-config';

describe('Theme Configuration', () => {
  describe('THEME_DEFINITIONS', () => {
    it('should have exactly 6 themes', () => {
      expect(Object.keys(THEME_DEFINITIONS)).toHaveLength(6);
    });

    it('should contain all expected themes', () => {
      const expectedThemes = ['dark', 'nord', 'synthwave84', 'dracula', 'cyberpunk', 'matrix'];
      expectedThemes.forEach(theme => {
        expect(THEME_DEFINITIONS).toHaveProperty(theme);
      });
    });

    it('should have valid structure for each theme', () => {
      Object.values(THEME_DEFINITIONS).forEach(theme => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('displayName');
        expect(theme).toHaveProperty('isPremium');
        expect(theme).toHaveProperty('colors');
        expect(theme.colors).toHaveProperty('background');
        expect(theme.colors).toHaveProperty('primary');
        expect(theme.colors).toHaveProperty('text');
      });
    });
  });

  describe('THEME_LIST', () => {
    it('should be an array of theme names', () => {
      expect(Array.isArray(THEME_LIST)).toBe(true);
      expect(THEME_LIST).toHaveLength(6);
    });

    it('should contain valid theme types', () => {
      THEME_LIST.forEach(theme => {
        expect(THEME_DEFINITIONS).toHaveProperty(theme);
      });
    });
  });

  describe('FREE_THEMES', () => {
    it('should contain only non-premium themes', () => {
      FREE_THEMES.forEach(theme => {
        expect(THEME_DEFINITIONS[theme].isPremium).toBe(false);
      });
    });

    it('should include dark and nord', () => {
      expect(FREE_THEMES).toContain('dark');
      expect(FREE_THEMES).toContain('nord');
    });
  });

  describe('PREMIUM_THEMES', () => {
    it('should contain only premium themes', () => {
      PREMIUM_THEMES.forEach(theme => {
        expect(THEME_DEFINITIONS[theme].isPremium).toBe(true);
      });
    });

    it('should include synthwave84, dracula, cyberpunk, and matrix', () => {
      expect(PREMIUM_THEMES).toContain('synthwave84');
      expect(PREMIUM_THEMES).toContain('dracula');
      expect(PREMIUM_THEMES).toContain('cyberpunk');
      expect(PREMIUM_THEMES).toContain('matrix');
    });
  });

  describe('isThemePremium', () => {
    it('should return false for dark theme', () => {
      expect(isThemePremium('dark')).toBe(false);
    });

    it('should return false for nord theme', () => {
      expect(isThemePremium('nord')).toBe(false);
    });

    it('should return true for premium themes', () => {
      expect(isThemePremium('synthwave84')).toBe(true);
      expect(isThemePremium('dracula')).toBe(true);
      expect(isThemePremium('cyberpunk')).toBe(true);
      expect(isThemePremium('matrix')).toBe(true);
    });
  });

  describe('getThemeDefinition', () => {
    it('should return correct theme definition', () => {
      const darkTheme = getThemeDefinition('dark');
      expect(darkTheme.name).toBe('dark');
      expect(darkTheme.displayName).toBe('Dark Mode');
    });

    it('should return nord theme for invalid theme names', () => {
      const result = getThemeDefinition('invalid' as ThemeType);
      expect(result.name).toBe('nord');
    });
  });
});

describe('Theme Colors', () => {
  it('should have valid hex color values', () => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbaRegex = /^rgba?\(/;

    Object.values(THEME_DEFINITIONS).forEach(theme => {
      const { background, primary, text } = theme.colors;

      // Background can be hex or rgba
      expect(
        hexColorRegex.test(background) || rgbaRegex.test(background)
      ).toBe(true);

      // Primary should be hex
      expect(hexColorRegex.test(primary)).toBe(true);

      // Text can be hex or color name
      expect(
        hexColorRegex.test(text) || text === '#ffffff' || text === '#000000'
      ).toBe(true);
    });
  });
});

describe('Theme Effects', () => {
  it('should have effects defined for enhanced themes', () => {
    const themesWithEffects = ['synthwave84', 'dracula', 'cyberpunk', 'matrix'] as const;

    themesWithEffects.forEach(themeName => {
      const theme = THEME_DEFINITIONS[themeName];
      expect(theme.effects).toBeDefined();
    });
  });

  it('should have valid effect properties', () => {
    const themesWithEffects = ['synthwave84', 'dracula', 'cyberpunk', 'matrix'] as const;

    themesWithEffects.forEach(themeName => {
      const theme = THEME_DEFINITIONS[themeName];
      if (theme.effects) {
        expect(theme.effects).toHaveProperty('backgroundGradient');
        expect(theme.effects).toHaveProperty('cardGlow');
      }
    });
  });
});
