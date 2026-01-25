# PRD: Border Styling Improvements for 16-Bit Weather

## Overview

**Problem Statement**: The current border styling in 16-Bit Weather uses bright, high-saturation colored borders (e.g., bright magenta/pink) at full opacity, creating visual noise and overwhelming the retro terminal aesthetic. All 12+ themes suffer from this issue where borders compete for attention rather than subtly defining content areas.

**Goal**: Create a cohesive, theme-aware border system that uses subtle, glow-based borders appropriate for a retro terminal aesthetic while maintaining visual hierarchy and accessibility.

---

## Current State Analysis

### What's Wrong

1. **High Saturation Borders**: Borders use fully saturated theme colors (e.g., bright pink `#ff00ff`) at 100% opacity
2. **Visual Overload**: Every card, section, and component has equally prominent borders, creating a "cage" effect
3. **No Visual Hierarchy**: Primary, secondary, and tertiary elements all have the same border treatment
4. **Inconsistent Application**: Some components may have hardcoded border colors not respecting the theme system
5. **Missing Glow Effects**: Authentic terminal UIs use subtle glow effects, not solid harsh borders

### Screenshot Reference

The Space Weather page shows multiple nested cards with bright magenta borders on:
- Solar Command Terminal container
- Individual metric cards (KP Index, Sunspots, Wind, Alerts)
- Space Weather Scales container
- Individual scale cards (R, S, G)
- Collapsible sections
- Sun Viewer container

---

## Research Findings

### Terminal UI Best Practices

From industry research on retro terminal aesthetics:

| Style | Border Approach |
|-------|-----------------|
| Classic Terminal | Single thin line `┌─────┐` or ASCII `+-----+` |
| CRT/Phosphor | Glow effect via `box-shadow` with theme color |
| Synthwave/Cyberpunk | Subtle glow with reduced opacity |
| Modern Retro | Low-opacity borders with hover/focus glow |

**Key Insight**: Authentic retro terminals use **glow** to suggest borders, not solid colored lines.

### shadcn/ui Border System

shadcn uses CSS variables for theming:

```css
/* shadcn default approach */
--border: oklch(0.92 0.004 286.32);  /* Very subtle, low saturation */
--input: oklch(0.92 0.004 286.32);
```

**Key Insight**: shadcn borders are intentionally low-contrast and subtle. The `--border` variable is meant to be barely visible, providing structure without visual noise.

### Opacity-Based Borders

From Evil Martians and dark mode UI research:

> "When it comes to borders, transparent colors are almost always the best choice. This is because they maintain accessibility across various surfaces and work seamlessly in both light and dark modes."

**Key Insight**: Using `rgba()` or `hsla()` with 10-30% opacity creates borders that automatically adapt to any background and theme.

---

## Proposed Solution

### Approach: Tiered Border System with Glow

Create three tiers of border treatments:

1. **Primary Containers** (main sections): Subtle glow + very faint border
2. **Secondary Cards** (nested content): Faint border only, no glow
3. **Interactive Elements** (buttons, inputs): Border on focus/hover with glow

### CSS Variable Updates

```css
:root {
  /* Base border - very subtle, theme-aware */
  --border-subtle: hsl(var(--theme-hue) var(--theme-sat) 50% / 0.15);
  --border-medium: hsl(var(--theme-hue) var(--theme-sat) 50% / 0.25);
  --border-strong: hsl(var(--theme-hue) var(--theme-sat) 50% / 0.40);
  
  /* Glow effects for terminal aesthetic */
  --glow-subtle: 0 0 10px hsl(var(--theme-hue) var(--theme-sat) 50% / 0.1);
  --glow-medium: 0 0 15px hsl(var(--theme-hue) var(--theme-sat) 50% / 0.2);
  --glow-strong: 0 0 20px hsl(var(--theme-hue) var(--theme-sat) 50% / 0.3);
  
  /* Interactive states */
  --border-hover: hsl(var(--theme-hue) var(--theme-sat) 60% / 0.35);
  --border-focus: hsl(var(--theme-hue) var(--theme-sat) 60% / 0.50);
}
```

### Theme-Specific Adjustments

Each theme should define its own `--theme-hue` and `--theme-sat`:

| Theme | Hue | Saturation | Notes |
|-------|-----|------------|-------|
| Dark Terminal | 120 | 100% | Classic green glow |
| Miami Vice | 320 | 80% | Pink/cyan, reduce sat |
| Tron Grid | 190 | 100% | Cyan glow |
| Synthwave | 280 | 70% | Purple, softer |
| Tokyo Night | 230 | 50% | Muted blue |
| Dracula | 265 | 60% | Purple |
| Cyberpunk | 55 | 90% | Yellow/gold |
| Matrix | 120 | 100% | Green |
| Atari | 30 | 80% | Orange/amber |
| Monochrome Green | 120 | 100% | Pure green |
| 8-Bit Classic | 220 | 70% | Blue |
| 16-Bit SNES | 280 | 60% | Purple |

### Component-Level Changes

#### Primary Containers (e.g., Solar Command Terminal)

```css
.terminal-container {
  border: 1px solid var(--border-subtle);
  box-shadow: var(--glow-subtle);
}
```

#### Nested Cards (e.g., metric cards inside terminal)

```css
.metric-card {
  border: 1px solid var(--border-subtle);
  /* NO glow - keeps visual hierarchy */
}

.metric-card:hover {
  border-color: var(--border-medium);
  box-shadow: var(--glow-subtle);
}
```

#### Collapsible Sections

```css
.collapsible-header {
  border-bottom: 1px solid var(--border-subtle);
}

.collapsible-content {
  border: none; /* Content doesn't need additional borders */
}
```

#### Interactive Elements

```css
.interactive-element:focus-visible {
  border-color: var(--border-focus);
  box-shadow: var(--glow-medium);
  outline: none;
}
```

---

## Implementation Plan

### Phase 1: Foundation (Priority: High)

1. **Audit Current Border Usage**
   - Search codebase for all `border` declarations
   - Identify hardcoded colors vs theme variables
   - Document components with border styling

2. **Create Border CSS Variables**
   - Add tiered border variables to `globals.css`
   - Add glow variables
   - Add per-theme hue/saturation values

3. **Update Theme Files**
   - Add `--theme-hue` and `--theme-sat` to each theme
   - Ensure all 12 themes have proper values

### Phase 2: Component Updates (Priority: High)

4. **Update Primary Containers**
   - TerminalCard / CommandTerminal components
   - Section headers
   - Main content wrappers

5. **Update Secondary Cards**
   - Metric cards
   - Data display cards
   - Nested content areas

6. **Update Interactive Elements**
   - Buttons
   - Inputs
   - Toggles
   - Collapsible triggers

### Phase 3: Polish (Priority: Medium)

7. **Add Hover/Focus States**
   - Implement subtle glow on hover
   - Ensure focus states are accessible
   - Test keyboard navigation visibility

8. **Test All Themes**
   - Visual QA on all 12 themes
   - Verify borders are visible but subtle
   - Check contrast ratios for accessibility

9. **Performance Check**
   - Ensure box-shadow doesn't impact rendering
   - Test on lower-end devices if applicable

---

## Alternative Approaches Considered

### Option A: Remove Borders Entirely
Use background color differentiation and spacing instead. 
- **Pros**: Cleaner look, no border management
- **Cons**: Loses retro terminal aesthetic, harder to distinguish sections

### Option B: ASCII Box Drawing Characters
Use Unicode box-drawing characters (┌ ┐ └ ┘ │ ─) rendered as pseudo-elements.
- **Pros**: Very authentic retro look
- **Cons**: Complex to implement, responsive challenges, font-dependent

### Option C: Gradient Borders
Use gradient borders that fade to transparent at edges.
- **Pros**: Softer appearance
- **Cons**: More complex CSS, potential performance impact

**Recommendation**: The proposed opacity-based + glow approach (main solution) provides the best balance of authenticity, maintainability, and cross-theme consistency.

---

## Does 16-Bit Weather Use shadcn Border Styles?

**Likely Yes, But Modified**

Based on project context (Next.js 15, shadcn/ui components):

1. shadcn provides a `--border` CSS variable
2. The Card component uses `border-border` (Tailwind class mapping to `--border`)
3. However, your themes likely override `--border` with theme-specific colors

**The Issue**: Your theme colors may be setting `--border` to fully saturated values instead of subtle ones.

**Check These Files**:
- `tailwind.config.ts` - Look for `borderColor` or `colors.border`
- `globals.css` or theme files - Look for `--border` variable definitions
- Individual theme CSS files - Check if borders are hardcoded

---

## Acceptance Criteria

- [ ] All borders use theme-aware CSS variables (no hardcoded colors)
- [ ] Primary containers have subtle glow effect
- [ ] Nested cards have lower-prominence borders than containers
- [ ] Interactive elements show clear focus/hover states
- [ ] Borders are visible but not distracting on all 12 themes
- [ ] Lighthouse accessibility score maintained ≥85
- [ ] No visual regression on existing functionality

---

## Reference Examples

### Good Border Examples from Research

1. **HTTPie** - Uses transparent borders that adapt to themes automatically
2. **Spotify Dark Mode** - Uses surface color layering, minimal borders
3. **Material Design Dark** - Recommends elevation (shadow) over borders
4. **Fallout Terminal UI** - Glow effects define boundaries, not solid lines

### CSS Pattern to Follow

```css
/* Instead of this: */
border: 1px solid #ff00ff;

/* Do this: */
border: 1px solid hsl(var(--theme-hue) 80% 50% / 0.2);
box-shadow: 0 0 10px hsl(var(--theme-hue) 80% 50% / 0.1);
```

---

## Success Metrics

1. **Visual Harmony**: Screenshots show cohesive, non-cluttered interface
2. **Theme Consistency**: All 12 themes look polished with new borders
3. **User Feedback**: Reduced complaints about visual noise
4. **Accessibility**: WCAG contrast requirements met for focus indicators

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | 2-3 hours | None |
| Phase 2: Components | 3-4 hours | Phase 1 |
| Phase 3: Polish | 2-3 hours | Phase 2 |
| **Total** | **7-10 hours** | |

---

## Questions to Resolve Before Implementation

1. Should borders be completely removed from deeply nested elements (3+ levels deep)?
2. Do any components intentionally use strong borders for emphasis (alerts, warnings)?
3. Is there a preference for which theme to use as the "reference" during development?
4. Should glow effects be configurable (user preference for reduced motion)?

---

## Appendix: Related Files to Update

Based on typical Next.js + shadcn project structure:

```
src/
├── app/
│   └── globals.css          # Main CSS variables
├── components/
│   └── ui/
│       └── card.tsx         # Card component
├── styles/
│   └── themes/
│       ├── dark-terminal.css
│       ├── miami-vice.css
│       ├── tron-grid.css
│       └── ... (other themes)
└── tailwind.config.ts       # Tailwind color config
```

