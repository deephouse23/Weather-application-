# Visual Bug Tracking Guide

**Last Updated:** January 2025

This guide explains how to organize screenshots, use them for bug tracking, and effectively communicate UI issues to Claude or team members.

---

## 📁 Folder Structure

### `.github/images/`
**Purpose:** Bug reports, PR screenshots, GitHub-specific visuals

```
.github/images/
├── bugs/                    # Bug screenshots
│   ├── location-la-to-livermore-issue.png
│   ├── settings-save-issue.png
│   └── auth-login-error-2025-01-15.png
│
├── features/                # Feature screenshots for PRs
│   ├── games-leaderboard-preview.png
│   ├── news-feed-layout.png
│   └── hourly-forecast-ui.png
│
└── comparisons/            # Before/after comparisons
    ├── theme-update-before.png
    ├── theme-update-after.png
    └── radar-performance-comparison.png
```

### `docs/screenshots/`
**Purpose:** Documentation screenshots, user guides

```
docs/screenshots/
├── setup/                   # Setup/installation screenshots
│   ├── supabase-dashboard.png
│   ├── env-configuration.png
│   └── api-key-setup.png
│
├── features/               # Feature documentation
│   ├── weather-search.png
│   ├── radar-controls.png
│   └── dashboard-overview.png
│
└── ui-components/          # Component library screenshots
    ├── theme-selector.png
    ├── weather-card.png
    └── forecast-card.png
```

### `archive/screenshots/`
**Purpose:** Old/resolved bug screenshots for reference

```
archive/screenshots/
├── 2024/
│   ├── auth-issue-resolved.png
│   └── radar-bug-fixed.png
└── 2025/
    └── location-bug-fixed.png
```

---

## 📝 Naming Conventions

### Bug Screenshots
**Format:** `[category]-[description]-[date].png`

**Examples:**
```
✅ auth-login-error-2025-01-15.png
✅ radar-tiles-not-loading-2025-01-20.png
✅ settings-save-failure.png
✅ location-la-to-livermore-issue.png
```

**Bad Examples:**
```
❌ Screenshot 2025-11-01 165634.png  (too generic)
❌ IMG_1234.png                      (no context)
❌ bug.png                           (not descriptive)
```

### Feature Screenshots
**Format:** `[feature]-[component]-[purpose].png`

**Examples:**
```
✅ games-leaderboard-preview.png
✅ news-feed-layout-mobile.png
✅ dashboard-theme-selector.png
```

### Comparison Screenshots
**Format:** `[feature]-[state]-[date].png`

**Examples:**
```
✅ theme-update-before-2025-01.png
✅ theme-update-after-2025-01.png
✅ radar-old-vs-new.png
```

---

## 🐛 Bug Report Workflow

### Step 1: Take Screenshot
1. **Reproduce the bug** consistently
2. **Capture the bug** (use Windows: Win+Shift+S, Mac: Cmd+Shift+4)
3. **Save immediately** with descriptive name

### Step 2: Save to Appropriate Folder
```bash
# Active bug
.github/images/bugs/[descriptive-name].png

# If already fixed but keeping for reference
archive/screenshots/2025/[bug-name]-fixed.png
```

### Step 3: Create Bug Documentation

Create: `.github/bugs/[bug-name].md`

**Template:**
```markdown
# Bug: [Short Description]

**Date Reported:** 2025-01-XX
**Status:** 🔴 Active / 🟡 In Progress / 🟢 Fixed
**Severity:** Critical / High / Medium / Low

## Description
Brief description of the bug.

## Screenshots
![Bug Screenshot](./../images/bugs/[filename].png)

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080
- Theme: Dark

## Additional Context
Any other relevant information.

## Fix (if resolved)
- **Fixed Date:** 2025-01-XX
- **Solution:** Brief description
- **Commit:** #abc123
```

### Step 4: Ask Claude for Review

**Good Prompt:**
```
I have a UI bug. Please review this screenshot and help me diagnose:

[Upload screenshot or provide path]

Bug: Location display showing "LA to Livermore" instead of correct city name

Steps to reproduce:
1. Search for location "San Ramon, CA"
2. Check the location display header

Expected: Should show "San Ramon, CA"
Actual: Shows "LA to Livermore"

Please analyze the screenshot and suggest:
1. What might be causing this
2. Which files to check
3. Potential solutions

Related files:
- lib/location-service.ts
- components/weather-display.tsx
```

**Bad Prompt:**
```
❌ "There's a bug, look at this screenshot"
❌ "Fix this"
❌ [Just uploads screenshot without context]
```

---

## 🎯 Best Practices for Claude Review

### 1. Provide Context
```markdown
## Bug Report for Claude

**File:** [path to screenshot]
**Bug:** [One-line description]

**Context:**
- Feature affected: [e.g., Location display]
- When it occurs: [e.g., After geolocation detection]
- User impact: [e.g., Shows wrong city name]

**What I've tried:**
- Checked X file
- Reviewed Y component
- Tested Z scenario

**Suspected cause:**
- Might be related to reverse geocoding
- Could be coordinate rounding issue

**Request:**
Please analyze the screenshot and suggest debugging steps.
```

### 2. Include Multiple Angles
```markdown
## UI Issue with Multiple Views

**Desktop view:**
![Desktop](.github/images/bugs/issue-desktop.png)

**Mobile view:**
![Mobile](.github/images/bugs/issue-mobile.png)

**Console errors:**
![Console](.github/images/bugs/issue-console.png)
```

### 3. Before/After Comparisons
```markdown
## Regression Issue

**Before (working):**
![Before](archive/screenshots/feature-working.png)

**After (broken):**
![After](.github/images/bugs/feature-broken.png)

**What changed:**
- Updated dependency X to version Y
- Modified component Z

**Request:**
Help identify what broke between these two states.
```

### 4. Annotated Screenshots
Use image editing tool to add arrows, circles, text:
- ✅ Highlight the problem area
- ✅ Add text annotations
- ✅ Draw arrows to specific elements

**Tools:**
- Windows: Snipping Tool (built-in annotation)
- Mac: Screenshot > Markup
- Online: Excalidraw, Figma

---

## 📋 Bug Report Templates

### Template 1: Simple Bug
**File:** `.github/bugs/bug-template-simple.md`

```markdown
# Bug: [Title]

![Screenshot](./../images/bugs/[filename].png)

**Issue:** [One sentence]
**Impact:** [Who/what is affected]
**Reproduce:** [Quick steps]
```

### Template 2: Detailed Bug
**File:** `.github/bugs/bug-template-detailed.md`

```markdown
# Bug: [Title]

**Priority:** 🔴 Critical | 🟡 High | 🔵 Medium | ⚪ Low
**Status:** Open | In Progress | Fixed
**Date:** 2025-01-XX

## Visual Evidence
![Main Screenshot](./../images/bugs/[filename].png)
![Console Errors](./../images/bugs/[filename]-console.png)

## Description
[Detailed description]

## Steps to Reproduce
1.
2.
3.

## Expected vs Actual
**Expected:** [What should happen]
**Actual:** [What happens]

## Environment
- Browser:
- OS:
- Screen:
- Theme:

## Suspected Cause
[Your analysis]

## Related Files
- `[file path]`
- `[file path]`

## Fix Checklist
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tests added
- [ ] Verified on different browsers
- [ ] Screenshot archived
```

---

## 🔄 Bug Lifecycle

### 1. New Bug Discovered
```bash
# Save screenshot
.github/images/bugs/[bug-name].png

# Create bug doc
.github/bugs/[bug-name].md

# Status: 🔴 Active
```

### 2. Bug In Progress
```markdown
# Update bug doc
**Status:** 🟡 In Progress
**Assigned to:** [Name]
**Branch:** fix/[bug-name]
```

### 3. Bug Fixed
```bash
# Archive screenshot
mv .github/images/bugs/[bug-name].png \
   archive/screenshots/2025/[bug-name]-fixed.png

# Update bug doc
**Status:** 🟢 Fixed
**Fixed Date:** 2025-01-XX
**Commit:** #abc123

# Or delete bug doc if not needed for reference
```

---

## 🎨 Screenshot Best Practices

### Quality
- ✅ **High resolution** - Capture at actual size
- ✅ **Clear focus** - Bug should be visible
- ✅ **Good lighting** - If photo of screen, ensure visibility
- ✅ **Full context** - Include surrounding UI elements

### What to Capture
- ✅ **The bug itself** - Main issue clearly visible
- ✅ **Console errors** - If any JavaScript errors
- ✅ **Network tab** - If API-related
- ✅ **Responsive view** - Different screen sizes if relevant

### What NOT to Capture
- ❌ **Sensitive data** - API keys, passwords, personal info
- ❌ **Unnecessary UI** - Crop to relevant area
- ❌ **Low quality** - Blurry or pixelated images

### Tools & Tips
**Windows:**
- Win+Shift+S - Snipping tool (recommended)
- Win+PrtScn - Full screenshot
- Snipping Tool app - Annotation features

**Mac:**
- Cmd+Shift+4 - Area selection
- Cmd+Shift+5 - Screenshot menu
- Preview - Annotation tools

**Browser DevTools:**
- Full page screenshot: Cmd/Ctrl+Shift+P → "screenshot"
- Specific element: Right-click element → "Capture node screenshot"
- Responsive mode: Toggle device toolbar

---

## 🤖 Using Screenshots with Claude

### Method 1: Direct Upload (Best)
```
I'm experiencing a UI bug. [Upload screenshot via Claude interface]

Please analyze this screenshot showing [description].

The issue is: [brief description]

Relevant code is in: [file paths]

What's causing this and how can I fix it?
```

### Method 2: Path Reference
```
Please review the screenshot at:
.github/images/bugs/location-issue.png

[Then describe the issue and provide context]
```

### Method 3: Multiple Screenshots
```
I have a responsive layout bug:

Desktop (working): .github/images/bugs/desktop-ok.png
Mobile (broken): .github/images/bugs/mobile-broken.png

Please compare these and suggest fixes for the mobile layout.
```

### What Makes a Good Claude Request:
1. **Clear screenshot** - High quality, focused on issue
2. **Context** - What feature, when it happens
3. **Specific question** - What you want Claude to analyze
4. **Code reference** - Which files are involved
5. **What you've tried** - Your debugging attempts

---

## 📦 Git Considerations

### What to Commit
✅ **Commit:**
- Documentation screenshots (`docs/screenshots/`)
- Feature preview images for PRs
- Important bug references (if needed long-term)

❌ **Don't Commit:**
- Temporary bug screenshots (use `.gitignore`)
- Large images (>1MB) - use external hosting
- Screenshots with sensitive data

### .gitignore Recommendations
```gitignore
# Temporary screenshots (don't commit)
.github/images/bugs/*.png
.github/images/temp/

# Keep documentation screenshots (do commit)
!docs/screenshots/**/*.png

# Archive (optional - can commit or ignore)
archive/screenshots/
```

---

## 📊 Organization Summary

```
Root Directory (Keep Clean!)
├── .github/
│   ├── images/                      📸 All GitHub-related images
│   │   ├── bugs/                    🐛 Bug screenshots (temp, don't commit)
│   │   ├── features/                ✨ Feature screenshots for PRs
│   │   └── comparisons/             📊 Before/after comparisons
│   │
│   ├── bugs/                        📝 Bug documentation
│   │   ├── bug-template-simple.md
│   │   ├── bug-template-detailed.md
│   │   └── [active-bug-reports].md
│   │
│   └── VISUAL_BUG_TRACKING.md      📚 This guide
│
├── docs/
│   └── screenshots/                 📸 Documentation images (commit these)
│       ├── setup/
│       ├── features/
│       └── ui-components/
│
└── archive/
    └── screenshots/                 📦 Old/resolved bugs (optional commit)
        ├── 2024/
        └── 2025/
```

---

## ✅ Quick Reference

### When you find a bug:
1. 📸 Take screenshot → Save to `.github/images/bugs/[descriptive-name].png`
2. 📝 Create bug doc → `.github/bugs/[bug-name].md`
3. 🤖 Ask Claude → Upload screenshot with context
4. 🔧 Fix bug → Update status
5. 📦 Archive → Move to `archive/screenshots/` or delete

### When creating PR:
1. 📸 Take feature screenshots
2. 💾 Save to `.github/images/features/`
3. 🔗 Reference in PR description: `![Feature](.github/images/features/[name].png)`

### When documenting:
1. 📸 Take clear, focused screenshots
2. 💾 Save to `docs/screenshots/[category]/`
3. 🔗 Reference in docs: `![Setup](./screenshots/setup/[name].png)`

---

**For current bug tracking:** See `.github/bugs/`
**For screenshot examples:** See `.github/images/`
**For documentation images:** See `docs/screenshots/`
