# Theme System Documentation

The 16-Bit Weather Platform uses a comprehensive theming system built on CSS variables and shadcn/ui components.

## Available Themes

| Theme | Type | Description |
|-------|------|-------------|
| dark | Free | Default cyberpunk blue theme |
| miami | Free | Miami Vice synthwave aesthetic |
| tron | Free | TRON Legacy neon blue |
| atari2600 | Premium | Classic Atari warm browns |
| monochromeGreen | Premium | Terminal/hacker green |
| 8bitClassic | Premium | NES-era light theme |
| 16bitSnes | Premium | SNES lavender/gold |
| synthwave84 | Premium | Hot pink synthwave |
| tokyoNight | Premium | Modern Tokyo Night purple |
| dracula | Premium | Dracula dark theme |
| matrix | Premium | Matrix green/black |

## Core Files

- `lib/theme-config.ts` - Theme definitions and color palettes
- `lib/theme-utils.ts` - Theme utility functions
- `app/globals.css` - CSS variable definitions per theme

## Usage

### Using Theme in Components

```tsx
import { useTheme } from 'next-themes'
import { getGlowClass } from '@/lib/theme-utils'

export function MyComponent() {
  const { theme } = useTheme()
  
  return (
    <div className={getGlowClass(theme)}>
      Content with theme glow
    </div>
  )
}
```

### Getting Theme Colors

```tsx
import { THEME_DEFINITIONS } from '@/lib/theme-config'

const colors = THEME_DEFINITIONS['dark'].colors
// colors.primary, colors.background, etc.
```

### Retro Effects

```tsx
import { getRetroEffects } from '@/lib/theme-utils'

const effects = getRetroEffects('miami')
// effects.glow, effects.pixelBorder, effects.scanlines
```

## CSS Variables

Each theme defines these CSS variables in `globals.css`:

```css
:root[data-theme="dark"] {
  --background: 220 41% 7%;
  --foreground: 210 17% 82%;
  --primary: 191 100% 50%;
  /* ... */
}
```

## Adding a New Theme

1. Add theme ID to `ThemeType` in `lib/theme-config.ts`
2. Add color definition to `THEME_DEFINITIONS`
3. Add CSS variables in `app/globals.css`
4. Add to theme selector UI
