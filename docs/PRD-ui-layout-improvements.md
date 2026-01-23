# Product Requirements Document: UI/Layout Improvements

## 16-Bit Weather - Design System Refinement

**Version:** 1.0  
**Date:** January 22, 2026  
**Timeline:** 2-Day Sprint with Parallel Subagent Execution  
**Branch:** `feature/ui-layout-improvements`

---

## 0. Pre-Implementation Instructions

CRITICAL: Before writing ANY code, execute the following:

```bash
git checkout main
git pull origin main
git checkout -b feature/ui-layout-improvements
```

All work MUST be done on this feature branch. Do NOT push directly to main.

---

## 1. Executive Summary

This PRD addresses UI/layout improvements identified in the January 22, 2026 component audit. The audit revealed 110+ components with varying levels of theme compliance, accessibility gaps, and styling inconsistencies. This sprint focuses on three parallel workstreams:

1. **THEME COMPLIANCE** (Subagent A): Fix hardcoded colors breaking theme consistency
2. **ACCESSIBILITY** (Subagent B): Add ARIA labels and screen reader support  
3. **COMPONENT CONSOLIDATION** (Subagent C): Standardize patterns and reduce duplication

### 1.1 Performance Constraint (Ralph Loop)

CRITICAL: All implementations must maintain a Lighthouse performance score of **90 or higher**. This is stricter than previous sprints (85+). Each milestone must include Lighthouse audit results.

```bash
npx lighthouse http://localhost:3000 --output=json --output-path=./docs/lh-ui-improvements-{checkpoint}.json --chrome-flags="--headless"
```

Checkpoints requiring Lighthouse validation:
- After Theme Compliance fixes (lh-ui-improvements-theme.json)
- After Accessibility additions (lh-ui-improvements-a11y.json)
- After Component Consolidation (lh-ui-improvements-consolidate.json)
- Final validation (lh-ui-improvements-final.json)

### 1.2 Audit Summary Reference

| Metric | Current | Target |
|--------|---------|--------|
| Total Components | 110+ | No change |
| shadcn/ui Usage | 61.5% (16/26) | 65%+ |
| Theme Compliance | 90% | 100% |
| Accessibility (ARIA) | ~10% | 50%+ |
| Mobile Responsive | 85% | 95% |
| Lighthouse Score | Variable | 90+ |

---

## 2. Problem Analysis

### 2.1 Hardcoded Colors (Theme Compliance)

**Issue**: Several components use hardcoded hex values instead of CSS variables, breaking theme consistency.

**Files with Issues**:

| File | Lines | Issue |
|------|-------|-------|
| `components/page-wrapper.tsx` | 43-70 | Switch statement with hardcoded hex per theme |
| `components/city-autocomplete.tsx` | Various | Theme switch with hardcoded values |
| `components/air-quality-display.tsx` | Various | Switch statement for theme colors |
| `app/dashboard/page.tsx` | 47, 63, 78 | Hardcoded `bg-[#0a0a1a]` |

**Impact**: Users switching themes see inconsistent colors in these components.

### 2.2 Accessibility Gaps

**Issue**: Only 11 of 110+ components have explicit ARIA attributes.

**Components WITH ARIA** (good examples to follow):
- WeatherSearch (aria-label on Input)
- FlightNumberInput (aria-label on inputs)
- TurbulenceMap (aria-label="Refresh PIREP data")
- theme-toggle (aria-label="Toggle theme")

**Components MISSING ARIA** (priority fixes):
- All icon-only buttons (~30 instances)
- Decorative icons missing aria-hidden="true"
- Interactive cards missing role and keyboard support
- Form inputs missing aria-describedby for errors

### 2.3 Pattern Duplication

**Issue**: Similar styling patterns appear in multiple locations without shared utilities.

**Duplicated Patterns**:
- Card glow effects: 5+ variations across components
- Loading states: Mix of Loader2, Skeleton, pulse, custom spinners
- Terminal-style borders: Repeated inline styles
- Responsive grid: Multiple implementations of same breakpoints

---

## 3. Goals and Success Metrics

| Goal | Workstream | Success Criteria |
|------|------------|------------------|
| Theme Compliance | Subagent A | Zero hardcoded colors in flagged files |
| Accessibility | Subagent B | 50%+ components with ARIA, all icon buttons labeled |
| Consolidation | Subagent C | Shared utility classes for glow, loading, borders |
| Performance | All | Lighthouse score 90+ on all affected pages |
| No Regressions | All | All 12 themes visually correct |

---

## 4. Technical Architecture

### 4.1 Theme Compliance Strategy

**Approach**: Replace all hardcoded colors with CSS variable references.

**CSS Variables Available** (from globals.css):
```css
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
```

**Mapping Examples**:
```tsx
// BEFORE (hardcoded)
className="bg-[#0a0a1a]"

// AFTER (theme-aware)
className="bg-background"
```

```tsx
// BEFORE (switch statement)
const getBgColor = () => {
  switch(theme) {
    case 'miami': return '#ff1493';
    case 'dark': return '#00d4ff';
    default: return '#ffffff';
  }
};

// AFTER (CSS variable)
className="bg-primary"
```

### 4.2 Accessibility Strategy

**ARIA Label Pattern for Icon Buttons**:
```tsx
// BEFORE
<Button size="icon" onClick={handleRefresh}>
  <RefreshCw className="w-4 h-4" />
</Button>

// AFTER
<Button 
  size="icon" 
  onClick={handleRefresh}
  aria-label="Refresh data"
>
  <RefreshCw className="w-4 h-4" aria-hidden="true" />
</Button>
```

**Screen Reader Text Pattern**:
```tsx
// For complex status indicators
<div className="flex items-center gap-2">
  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
  <span>Online</span>
  <span className="sr-only">Status: Online</span>
</div>
```

**Keyboard Navigation Pattern**:
```tsx
// For clickable cards
<Card 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label={`View weather for ${city}`}
>
```

### 4.3 Component Consolidation Strategy

**New Utility Classes** (add to globals.css):

```css
/* Glow Effects */
.glow-primary {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.glow-accent {
  box-shadow: 0 0 20px hsl(var(--accent) / 0.3);
}

.glow-subtle {
  box-shadow: 0 0 10px hsl(var(--primary) / 0.15);
}

/* Terminal Borders */
.border-terminal {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}

.border-terminal-glow {
  border: 1px solid hsl(var(--primary) / 0.5);
  box-shadow: 0 0 10px hsl(var(--primary) / 0.2);
}

/* Loading States */
.loading-spinner {
  @apply animate-spin text-primary;
}

.loading-pulse {
  @apply animate-pulse bg-muted;
}
```

**Shared Loading Component** (create new):
```tsx
// components/ui/loading-state.tsx
interface LoadingStateProps {
  variant: 'spinner' | 'skeleton' | 'pulse' | 'terminal';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingState({ variant, size = 'md', text }: LoadingStateProps) {
  // Unified loading component
}
```

---

## 5. Implementation Plan

### 5.1 Subagent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                              │
│  - Spawns subagents A, B, C in parallel                         │
│  - Waits for all to complete                                    │
│  - Runs integration tests                                       │
│  - Final Lighthouse audit (must be ≥90)                         │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   SUBAGENT A    │  │   SUBAGENT B    │  │   SUBAGENT C    │
│ Theme Compliance│  │  Accessibility  │  │  Consolidation  │
│                 │  │                 │  │                 │
│ - page-wrapper  │  │ - Icon buttons  │  │ - Glow classes  │
│ - autocomplete  │  │ - ARIA labels   │  │ - Loading comp  │
│ - air-quality   │  │ - sr-only text  │  │ - Border utils  │
│ - dashboard     │  │ - Keyboard nav  │  │ - Grid patterns │
│                 │  │                 │  │                 │
│ Est: 3 hours    │  │ Est: 4 hours    │  │ Est: 3 hours    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 5.2 Timeline

**Day 1: Parallel Implementation**
- Hour 0-1: Orchestrator setup, branch creation
- Hour 1-4: Subagents A, B, C work in parallel
- Hour 4-5: Merge subagent branches, resolve conflicts
- Hour 5-6: First Lighthouse audit, fix any regressions

**Day 2: Polish and Validation**
- Hour 0-2: Cross-theme testing (all 12 themes)
- Hour 2-3: Accessibility testing (keyboard navigation, screen reader)
- Hour 3-4: Fix any issues found
- Hour 4-5: Final Lighthouse audit (must be ≥90)
- Hour 5-6: PR creation, documentation update

---

## 6. Subagent Specifications

### 6.1 Subagent A: Theme Compliance

**Objective**: Replace all hardcoded colors with CSS variables.

**Files to Modify**:

#### 6.1.1 components/page-wrapper.tsx (Lines 43-70)

Find the theme color switch statement and replace with CSS variables:

```tsx
// REMOVE this pattern:
const getThemeAccentColor = () => {
  switch (theme) {
    case 'miami': return '#ff1493';
    case 'synthwave84': return '#f92aad';
    // ... more cases
  }
};

// REPLACE with:
// Use CSS variable directly in className
className="text-primary" // or "text-accent"
```

#### 6.1.2 components/city-autocomplete.tsx

Find all theme-conditional styles and replace:

```tsx
// REMOVE patterns like:
style={{ color: theme === 'miami' ? '#ff1493' : '#00d4ff' }}

// REPLACE with:
className="text-primary"
```

#### 6.1.3 components/air-quality-display.tsx

Replace color switch statements:

```tsx
// REMOVE:
const getAqiColor = (aqi: number, theme: string) => {
  if (theme === 'miami') return aqi > 100 ? '#ff6b6b' : '#00ff88';
  // ...
};

// REPLACE with semantic classes:
const getAqiClass = (aqi: number) => {
  if (aqi > 150) return 'text-destructive';
  if (aqi > 100) return 'text-yellow-500'; // warning
  return 'text-green-500'; // good
};
```

#### 6.1.4 app/dashboard/page.tsx (Lines 47, 63, 78)

```tsx
// REMOVE:
className="bg-[#0a0a1a]"

// REPLACE with:
className="bg-background"
```

**Validation**:
```bash
# Search for remaining hardcoded colors
grep -r "bg-\[#" src/
grep -r "text-\[#" src/
grep -r "border-\[#" src/
# Should return zero results in modified files
```

**Lighthouse Checkpoint**: Run after completion, save to `lh-ui-improvements-theme.json`

---

### 6.2 Subagent B: Accessibility

**Objective**: Add ARIA attributes to 50%+ of components, prioritizing interactive elements.

**Priority 1: Icon Buttons** (Est. 30 instances)

Search and fix pattern:
```bash
grep -r "size=\"icon\"" src/components/
```

For each icon button found:
```tsx
// ADD aria-label based on context
<Button size="icon" aria-label="[descriptive action]">
  <Icon className="w-4 h-4" aria-hidden="true" />
</Button>
```

**Common Labels to Use**:
| Icon | aria-label |
|------|------------|
| RefreshCw | "Refresh data" |
| X | "Close" |
| Menu | "Open menu" |
| ChevronUp/Down | "Expand/Collapse" |
| Search | "Search" |
| Trash2 | "Delete" |
| Send | "Send message" |
| Play/Pause | "Play/Pause animation" |

**Priority 2: Decorative Icons**

Add aria-hidden to all decorative icons:
```tsx
// Weather condition icons (decorative, text provides meaning)
<Sun className="w-6 h-6" aria-hidden="true" />
<span>Sunny</span>

// Status indicators
<span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
```

**Priority 3: Interactive Cards**

Make clickable cards keyboard accessible:
```tsx
// components/dashboard/location-card.tsx
<Card 
  role="button"
  tabIndex={0}
  onClick={onClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
  aria-label={`View weather for ${location.name}`}
  className="cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
>
```

**Priority 4: Form Error States**

Connect error messages to inputs:
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    aria-describedby={error ? "email-error" : undefined}
    aria-invalid={!!error}
  />
  {error && (
    <p id="email-error" className="text-destructive text-sm" role="alert">
      {error}
    </p>
  )}
</div>
```

**Files to Modify** (priority order):
1. components/navigation.tsx - Menu button
2. components/weather-search.tsx - Search input
3. components/dashboard/location-card.tsx - Clickable cards
4. components/news/NewsCard.tsx - Clickable cards
5. components/games/GameCard.tsx - Clickable cards
6. components/space-weather/*.tsx - All refresh buttons
7. components/aviation/*.tsx - All refresh buttons
8. components/forecast.tsx - Expandable sections

**Validation**:
```bash
# Count ARIA attributes before and after
grep -r "aria-" src/components/ | wc -l
# Target: 100+ instances (from ~30)
```

**Lighthouse Checkpoint**: Run after completion, save to `lh-ui-improvements-a11y.json`

---

### 6.3 Subagent C: Component Consolidation

**Objective**: Create shared utilities and reduce pattern duplication.

#### 6.3.1 Add Utility Classes to globals.css

Add after existing utilities (around line 400):

```css
/* ============================================
   CONSOLIDATED UTILITY CLASSES
   Added: January 2026 - UI Improvements Sprint
   ============================================ */

/* Glow Effects - Consistent across themes */
.glow-primary {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.glow-primary-lg {
  box-shadow: 0 0 30px hsl(var(--primary) / 0.4);
}

.glow-accent {
  box-shadow: 0 0 20px hsl(var(--accent) / 0.3);
}

.glow-subtle {
  box-shadow: 0 0 10px hsl(var(--primary) / 0.15);
}

.glow-destructive {
  box-shadow: 0 0 20px hsl(var(--destructive) / 0.3);
}

/* Hover glow effect */
.hover-glow:hover {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.4);
  transition: box-shadow 0.3s ease;
}

/* Terminal-style Borders */
.border-terminal {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}

.border-terminal-accent {
  border: 1px solid hsl(var(--primary) / 0.5);
}

.border-terminal-glow {
  border: 1px solid hsl(var(--primary) / 0.5);
  box-shadow: inset 0 0 10px hsl(var(--primary) / 0.1),
              0 0 10px hsl(var(--primary) / 0.2);
}

/* Card Variants */
.card-terminal {
  @apply bg-card border-terminal rounded-lg;
}

.card-terminal-glow {
  @apply bg-card border-terminal-glow rounded-lg;
}

.card-interactive {
  @apply card-terminal cursor-pointer transition-all duration-200;
}

.card-interactive:hover {
  @apply border-primary glow-subtle;
}

.card-interactive:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
}

/* Status Indicators */
.status-dot {
  @apply w-2 h-2 rounded-full;
}

.status-dot-success {
  @apply status-dot bg-green-500;
}

.status-dot-warning {
  @apply status-dot bg-yellow-500;
}

.status-dot-error {
  @apply status-dot bg-destructive;
}

.status-dot-pulse {
  @apply status-dot animate-pulse;
}
```

#### 6.3.2 Create Unified Loading Component

Create `components/ui/loading-state.tsx`:

```tsx
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'terminal';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function LoadingState({ 
  variant = 'spinner', 
  size = 'md', 
  text,
  className 
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        {text && <span className="sr-only">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('animate-pulse bg-muted rounded', sizeMap[size], className)}>
        {text && <span className="sr-only">{text}</span>}
      </div>
    );
  }

  if (variant === 'terminal') {
    return (
      <div className={cn('flex items-center gap-2 font-mono', textSizeMap[size], className)}>
        <span className="animate-pulse">▊</span>
        <span className="text-muted-foreground">{text || 'Loading...'}</span>
      </div>
    );
  }

  // Default: spinner
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 
        className={cn('animate-spin text-primary', sizeMap[size])} 
        aria-hidden="true"
      />
      {text && <span className={cn('text-muted-foreground', textSizeMap[size])}>{text}</span>}
      <span className="sr-only">{text || 'Loading'}</span>
    </div>
  );
}
```

#### 6.3.3 Update Component Exports

Add to `components/ui/index.ts` (create if doesn't exist):

```tsx
export * from './loading-state';
```

#### 6.3.4 Refactor Existing Components to Use New Utilities

**Example Refactors**:

```tsx
// BEFORE (components/news/NewsCard.tsx)
<Card className="bg-card border border-primary/30 rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] transition-all">

// AFTER
<Card className="card-interactive glow-subtle hover:glow-primary">
```

```tsx
// BEFORE (various components)
<Loader2 className="w-4 h-4 animate-spin" />

// AFTER
<LoadingState variant="spinner" size="sm" text="Loading weather data" />
```

**Validation**:
```bash
# Verify new classes are used
grep -r "glow-primary\|glow-subtle\|card-terminal\|card-interactive" src/
# Should find multiple usages

# Verify LoadingState is imported
grep -r "LoadingState" src/components/
```

**Lighthouse Checkpoint**: Run after completion, save to `lh-ui-improvements-consolidate.json`

---

## 7. Testing Strategy

### 7.1 Visual Regression Testing

Test all 12 themes manually:
1. dark (free)
2. miami (free)
3. synthwave84 (premium)
4. tokyo (premium)
5. dracula (premium)
6. cyberpunk (premium)
7. matrix (premium)
8. tron (premium)
9. atari (premium)
10. green (premium)
11. 8bit (premium)
12. snes (premium)

**For Each Theme, Verify**:
- [ ] Navigation colors correct
- [ ] Cards have proper glow effects
- [ ] Text is readable (contrast)
- [ ] Buttons have correct hover states
- [ ] No hardcoded colors visible

### 7.2 Accessibility Testing

**Keyboard Navigation**:
- [ ] Tab through entire page
- [ ] All interactive elements receive focus
- [ ] Focus indicators visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals

**Screen Reader (VoiceOver/NVDA)**:
- [ ] Icon buttons announce their purpose
- [ ] Cards announce their content
- [ ] Loading states announced
- [ ] Error messages announced

### 7.3 Playwright Tests

Add to existing test suite:

```typescript
// tests/ui-improvements.spec.ts
import { test, expect } from '@playwright/test';

test.describe('UI Improvements', () => {
  test('icon buttons have aria-labels', async ({ page }) => {
    await page.goto('/');
    const iconButtons = page.locator('button:has(svg):not(:has-text(*))');
    const count = await iconButtons.count();
    
    for (let i = 0; i < count; i++) {
      const ariaLabel = await iconButtons.nth(i).getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('no hardcoded hex colors in critical components', async ({ page }) => {
    await page.goto('/dashboard');
    const pageWrapper = page.locator('[data-testid="page-wrapper"]');
    const style = await pageWrapper.getAttribute('style');
    expect(style).not.toContain('#0a0a1a');
  });

  test('theme switching preserves all colors', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Switch to miami theme
    await page.click('[data-testid="theme-selector"]');
    await page.click('[data-value="miami"]');
    
    // Verify primary color is applied via CSS variable
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--primary');
    });
    expect(primaryColor).toBeTruthy();
  });
});
```

### 7.4 Lighthouse Validation

**Final Audit Requirements**:

| Page | Minimum Score |
|------|---------------|
| / (home) | 90 |
| /dashboard | 90 |
| /radar | 85 (map heavy) |
| /aviation | 90 |
| /space-weather | 85 (animation heavy) |
| /ai | 90 |

---

## 8. Rollback Plan

If issues are found post-deployment:

1. Revert PR via GitHub
2. Cherry-pick any non-problematic commits
3. Create hotfix branch from main
4. Address specific issues
5. Re-run full test suite
6. Deploy hotfix

---

## 9. Documentation Updates

After successful merge, update:

1. `docs/COMPONENTS.md` - Add new utility classes section
2. `docs/THEMING.md` - Document glow classes and card variants
3. `README.md` - Update accessibility notes

---

## 10. Success Criteria Checklist

Before merging PR:

**Theme Compliance (Subagent A)**:
- [ ] Zero hardcoded colors in page-wrapper.tsx
- [ ] Zero hardcoded colors in city-autocomplete.tsx
- [ ] Zero hardcoded colors in air-quality-display.tsx
- [ ] Zero hardcoded colors in dashboard/page.tsx
- [ ] All 12 themes visually verified

**Accessibility (Subagent B)**:
- [ ] All icon buttons have aria-label
- [ ] All decorative icons have aria-hidden="true"
- [ ] Interactive cards keyboard accessible
- [ ] Form errors connected via aria-describedby
- [ ] 100+ ARIA attributes total (from ~30)

**Consolidation (Subagent C)**:
- [ ] Glow utility classes added to globals.css
- [ ] Border utility classes added
- [ ] LoadingState component created
- [ ] At least 5 components refactored to use new utilities

**Performance**:
- [ ] Lighthouse score ≥90 on home page
- [ ] Lighthouse score ≥90 on dashboard
- [ ] Lighthouse score ≥85 on radar (map exception)
- [ ] No performance regressions

**Testing**:
- [ ] Playwright tests pass
- [ ] Manual theme testing complete
- [ ] Keyboard navigation verified
- [ ] Screen reader tested

---

## 11. Orchestrator Prompt

Use this prompt to execute the full sprint:

```
Read the PRD at docs/PRD-ui-layout-improvements.md completely.

You are coordinating three parallel implementation tasks for 16-Bit Weather UI improvements.

EXECUTION STRATEGY:

Use subagents to work in parallel:

SUBAGENT A - THEME COMPLIANCE (spawn first)
Task: Replace all hardcoded colors with CSS variables
Files: page-wrapper.tsx, city-autocomplete.tsx, air-quality-display.tsx, dashboard/page.tsx
Success: grep for bg-[# and text-[# returns zero results in these files
Lighthouse: Run and save to lh-ui-improvements-theme.json

SUBAGENT B - ACCESSIBILITY (spawn second)
Task: Add ARIA labels to icon buttons and interactive elements
Files: All components with icon buttons, clickable cards
Success: 100+ ARIA attributes (count with grep)
Lighthouse: Run and save to lh-ui-improvements-a11y.json

SUBAGENT C - CONSOLIDATION (spawn third)
Task: Create shared utility classes and LoadingState component
Files: globals.css, new loading-state.tsx, refactor 5+ components
Success: New utilities in use, LoadingState exported
Lighthouse: Run and save to lh-ui-improvements-consolidate.json

CONSTRAINTS:
1. Lighthouse score must be 90+ (CRITICAL - higher than previous 85 threshold)
2. All work on feature/ui-layout-improvements branch
3. Do NOT push to main
4. Test all 12 themes after changes
5. Run Playwright tests before declaring complete

COMPLETION:
After all subagents complete:
1. Merge their changes
2. Run full Playwright suite
3. Final Lighthouse audit (save to lh-ui-improvements-final.json)
4. Create PR with summary of changes
5. Update docs/COMPONENTS.md with new utilities
```

---

## 12. Individual Subagent Prompts

### 12.1 Subagent A Prompt (Theme Compliance)

```
You are Subagent A for the UI Improvements sprint. Your task is THEME COMPLIANCE.

Read section 6.1 of docs/PRD-ui-layout-improvements.md for full details.

OBJECTIVE: Replace all hardcoded colors with CSS variables in these files:
- components/page-wrapper.tsx (lines 43-70)
- components/city-autocomplete.tsx
- components/air-quality-display.tsx  
- app/dashboard/page.tsx (lines 47, 63, 78)

RULES:
1. Replace bg-[#hexcode] with bg-background or bg-card
2. Replace text-[#hexcode] with text-primary or text-foreground
3. Remove switch statements that return different colors per theme
4. Use CSS variables: --primary, --background, --foreground, --card, --muted, --accent

VALIDATION:
After changes, run:
grep -r "bg-\[#" components/page-wrapper.tsx components/city-autocomplete.tsx components/air-quality-display.tsx app/dashboard/page.tsx
Result should be empty.

LIGHTHOUSE:
Run: npx lighthouse http://localhost:3000 --output=json --output-path=./docs/lh-ui-improvements-theme.json
Score must be 90+.

Report COMPLETE when done with file changes and Lighthouse score.
```

### 12.2 Subagent B Prompt (Accessibility)

```
You are Subagent B for the UI Improvements sprint. Your task is ACCESSIBILITY.

Read section 6.2 of docs/PRD-ui-layout-improvements.md for full details.

OBJECTIVE: Add ARIA attributes to components.

PRIORITY ORDER:
1. All icon buttons - add aria-label describing the action
2. All decorative icons - add aria-hidden="true"
3. Clickable cards - add role="button" tabIndex={0} onKeyDown handler
4. Form errors - connect via aria-describedby

SEARCH FOR ICON BUTTONS:
grep -r 'size="icon"' src/components/

FOR EACH, ADD:
<Button size="icon" aria-label="[action]">
  <Icon aria-hidden="true" />
</Button>

COMMON LABELS:
RefreshCw = "Refresh data"
X = "Close"
Menu = "Open menu"
Search = "Search"
Trash2 = "Delete"
Send = "Send message"

VALIDATION:
Count ARIA attributes: grep -r "aria-" src/components/ | wc -l
Target: 100+ (currently ~30)

LIGHTHOUSE:
Run: npx lighthouse http://localhost:3000 --output=json --output-path=./docs/lh-ui-improvements-a11y.json
Score must be 90+.

Report COMPLETE when done with 100+ ARIA attributes and Lighthouse score.
```

### 12.3 Subagent C Prompt (Consolidation)

```
You are Subagent C for the UI Improvements sprint. Your task is CONSOLIDATION.

Read section 6.3 of docs/PRD-ui-layout-improvements.md for full details.

OBJECTIVE: Create shared utility classes and reduce duplication.

TASKS:
1. Add utility classes to app/globals.css (glow-primary, glow-subtle, border-terminal, card-interactive, etc.)
2. Create components/ui/loading-state.tsx with LoadingState component
3. Refactor at least 5 components to use new utilities

NEW UTILITIES TO ADD:
.glow-primary { box-shadow: 0 0 20px hsl(var(--primary) / 0.3); }
.glow-subtle { box-shadow: 0 0 10px hsl(var(--primary) / 0.15); }
.border-terminal { border: 1px solid hsl(var(--border)); border-radius: var(--radius); }
.card-interactive { cursor-pointer transition-all with hover glow }

LOADING COMPONENT:
Create LoadingState with variants: spinner, skeleton, pulse, terminal
Include proper ARIA (aria-hidden on icon, sr-only text)

VALIDATION:
grep -r "glow-primary\|card-interactive\|LoadingState" src/
Should find multiple usages.

LIGHTHOUSE:
Run: npx lighthouse http://localhost:3000 --output=json --output-path=./docs/lh-ui-improvements-consolidate.json
Score must be 90+.

Report COMPLETE when utilities added, LoadingState created, and 5+ components refactored.
```

---

## 13. Appendix: Audit Reference Data

### 13.1 Current ARIA Coverage

Components WITH ARIA (11):
- WeatherSearch
- FlightNumberInput
- TurbulenceMap
- FlightRouteLookup
- NewsSection
- NewsTicker
- theme-toggle
- Dialog (Radix built-in)
- Tabs (Radix built-in)
- AlertDialog (Radix built-in)
- DropdownMenu (Radix built-in)

### 13.2 Hardcoded Color Locations

Exact grep results:
```
page-wrapper.tsx:44:    case 'miami': return '#ff1493';
page-wrapper.tsx:45:    case 'synthwave84': return '#f92aad';
page-wrapper.tsx:46:    case 'dark': return '#00d4ff';
city-autocomplete.tsx:87:    backgroundColor: theme === 'miami' ? '#1a0a1a' : '#0a0a1a',
air-quality-display.tsx:23:    if (theme === 'miami') return '#ff1493';
dashboard/page.tsx:47:    className="bg-[#0a0a1a]"
dashboard/page.tsx:63:    className="bg-[#0a0a1a]"
dashboard/page.tsx:78:    className="bg-[#0a0a1a]"
```

### 13.3 shadcn/ui Component Status

**Installed & Used (16)**: button, card, badge, input, skeleton, tabs, label, tooltip, alert, separator, dialog, switch, toast, avatar, form, dropdown-menu

**Installed & Unused (10)**: command, popover, progress, scroll-area, slider, toggle, toggle-group, select, accordion, sheet

**Recommended Additions**: Pagination, Drawer

---

*End of PRD*
