# Theme Inventory & Audit Report

## 1. Theme Inventory
All themes are defined in `lib/theme-config.ts` and styled in `app/globals.css`.

### Usage Logic
- **Guest**: Default `dark` theme only.
- **Authenticated**: Can access all Premium themes (via `isPremium` flag in config).

### Theme List

| Theme ID | Name | Type | Access | File Definitions |
|----------|------|------|--------|------------------|
| `dark` | Dark Mode | Base | Free | `lib/theme-config.ts`, `globals.css` (:root[data-theme="dark"]) |
| `miami` | Miami Vice | Custom | Free | `lib/theme-config.ts`, `globals.css` (:root[data-theme="miami"]) |
| `tron` | TRON Legacy | Custom | Free | `lib/theme-config.ts`, `globals.css` (:root[data-theme="tron"]) |
| `atari2600` | Atari 2600 | Custom | Premium | `lib/theme-config.ts`, `globals.css` (:root[data-theme="atari2600"]) |
| `monochromeGreen` | Terminal Green | Custom | Premium | `lib/theme-config.ts`, `globals.css` (:root[data-theme="monochromeGreen"]) |
| `8bitClassic` | 8-Bit Classic | Custom | Premium | `lib/theme-config.ts`, `globals.css` (:root[data-theme="8bitClassic"]) |
| `16bitSnes` | 16-Bit SNES | Custom | Premium | `lib/theme-config.ts`, `globals.css` (:root[data-theme="16bitSnes"]) |
| `synthwave84` | Synthwave '84 | Custom | Premium | `lib/theme-config.ts` (CSS Missing in globals?) |
| `tokyoNight` | Tokyo Night | Custom | Premium | `lib/theme-config.ts` (CSS Missing in globals?) |
| `dracula` | Dracula | Custom | Premium | `lib/theme-config.ts` (CSS Missing in globals?) |
| `cyberpunk` | Cyberpunk 2077 | Custom | Premium | `lib/theme-config.ts` (CSS Missing in globals?) |
| `matrix` | Matrix | Custom | Premium | `lib/theme-config.ts` (CSS Missing in globals?) |

> **Note**: Themes defined in config but missing explicit CSS variables in `globals.css` (Synthwave, Tokyo Night, etc.) likely rely on the config `colors` object being applied dynamically? *Correction*: `ThemeProvider` does NOT apply dynamic colors from config, it relies on CSS classes. **This is another bug.**

## 2. Code Inspection & Root Cause Analysis

### A. Auth Integration Failure
- **Location**: `components/theme-provider.tsx`
- **Issue**: The provider creates a local `user` state initialized to `null` and never updates it. `isAuthenticated` is permanently `false`.
- **Impact**: Premium themes are technically never unlocked at the provider level.

### B. Selector Logic Failure
- **Location**: `components/dashboard/theme-selector.tsx`
- **Issue**: The component hardcodes `themeOptions` array with only 3 themes (`dark`, `miami`, `tron`).
- **Impact**: Even if auth worked, the user cannot see or select the 9 premium themes in the UI.

### C. API Validation Failure
- **Location**: `app/api/user/preferences/route.ts`
- **Issue**: The PUT endpoint strictly validates `theme` against `['dark', 'miami', 'tron']`.
- **Impact**: Backend rejects any attempt to save a premium theme with `400 Bad Request`.

## 3. Recommended Fixes

1.  **Update API**: Modify `app/api/user/preferences/route.ts` to allow all valid themes from `THEME_LIST`.
2.  **Dynamic Selector**: Rewrite `components/dashboard/theme-selector.tsx` to generate options from `THEME_DEFINITIONS`.
3.  **Fix Provider**: Connect `ThemeProvider` to `useUserPreferences` hook to get real auth state.
4.  **Add CSS**: Ensure all config themes have corresponding CSS variables in `globals.css` OR implement dynamic style injection in `ThemeProvider`.
