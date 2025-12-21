# Deletion & Archival Manifest - Dec 2025

## Files Deleted
- `__tests__/smoke.test.ts` - Reason: trivial placeholder test
- `__tests__/profile-save.test.ts` - Reason: redundant with Playwright suite
- `report.json` / `report_utf16.json` - Reason: build artifacts
- `archive/` (directory) - Reason: consolidated into `_archive/legacy`

## Files Archived
**Moved to `_archive/planning/`:**
- `SENTRY_SETUP.md`
- `UX_AUDIT.md`
- `COMPETITIVE_ANALYSIS.md`
- `IMPLEMENTATION_STATUS.md`
- `FEATURE_ROADMAP.md`
- `TECHNICAL_IMPROVEMENTS_SUMMARY.md`
- `TECHNICAL_AUDIT.md`
- `MONETIZATION_STRATEGY.md`
- `hourly-forecast-mockup.html`

**Moved to `_archive/legacy/`:**
- Contents of old `archive/` folder

## Gitignore Updates
- Added `_archive/`
- Added `.DS_Store`, `Thumbs.db`
- Added `npm-debug.log`
- Refined build artifact ignores
