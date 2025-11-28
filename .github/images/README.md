# Screenshots & Visual Assets

This folder contains all GitHub-related images for bug tracking, PRs, and feature documentation.

---

## 📁 Folder Structure

```
.github/images/
├── bugs/         🐛 Bug screenshots (temporary, not committed to git)
├── features/     ✨ Feature screenshots for PRs (committed)
└── comparisons/  📊 Before/after comparisons (committed)
```

---

## 🐛 bugs/

**Purpose:** Temporary bug screenshots for issue tracking

**Usage:**
1. Save screenshot here with descriptive name: `bug-[description]-[date].png`
2. Reference in bug doc: `.github/bugs/[bug-name].md`
3. After fix: Archive or delete

**Git:** NOT committed (see `.gitignore`)

**Current Files:**
- location-la-to-livermore-issue.png
- settings-save-issue.png
- 2025-11-01-ui-issue.png

---

## ✨ features/

**Purpose:** Feature screenshots for pull requests

**Usage:**
1. Save feature screenshots here
2. Reference in PR description: `![Feature](.github/images/features/[name].png)`
3. Keep for documentation

**Git:** Committed to repository

---

## 📊 comparisons/

**Purpose:** Before/after visual comparisons

**Usage:**
1. Save comparison images:
   - `[feature]-before.png`
   - `[feature]-after.png`
2. Use in PRs to show improvements
3. Use in documentation to explain changes

**Git:** Committed to repository

---

## 📝 Naming Conventions

### Bug Screenshots
```
✅ auth-login-error-2025-01-15.png
✅ radar-tiles-not-loading.png
✅ location-display-incorrect.png

❌ Screenshot 1.png
❌ IMG_1234.png
❌ bug.png
```

### Feature Screenshots
```
✅ games-leaderboard-preview.png
✅ news-feed-mobile-layout.png
✅ dashboard-theme-selector.png
```

### Comparisons
```
✅ theme-update-before.png
✅ theme-update-after.png
✅ radar-performance-old-vs-new.png
```

---

## 🤖 Using with Claude

**Good Example:**
```markdown
I have a UI bug shown in this screenshot:
.github/images/bugs/location-issue.png

The location display shows "LA to Livermore" instead of "San Ramon, CA"

Please analyze:
1. What's causing this
2. Which files to check
3. Potential fixes

Related code: lib/location-service.ts
```

**See:** [../ VISUAL_BUG_TRACKING.md](../VISUAL_BUG_TRACKING.md) for complete guide

---

## 🔧 Quick Commands

### Move screenshot here:
```bash
# From root to bugs/
mv "screenshot.png" ".github/images/bugs/bug-description.png"
```

### Archive fixed bug:
```bash
# Move to archive
mv ".github/images/bugs/bug-fixed.png" \
   "archive/screenshots/2025/bug-fixed.png"
```

---

## 📚 Related Documentation

- [Visual Bug Tracking Guide](../VISUAL_BUG_TRACKING.md) - Complete guide
- [Bug Templates](../bugs/) - Bug report templates
- [Main README](../../README.md) - Project documentation

---

**For full guidelines:** See `../ VISUAL_BUG_TRACKING.md`
