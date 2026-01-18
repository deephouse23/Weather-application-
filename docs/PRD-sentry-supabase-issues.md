# PRD: Sentry & Supabase Issue Resolution

## Overview

Systematically resolve all outstanding issues in Sentry error tracking and Supabase database/security advisors for 16bitweather.co. This PRD consolidates error resolution from both platforms into a single actionable document.

## Current State

### Sentry (https://infisical.sentry.io)
- Project: 16bitweatherco (ID: 4508695498940464)
- Sentry Logs enabled (SDK v10.30.0)
- Unknown number of unresolved issues requiring inventory

### Supabase (Project: cckcvyccjntadoohjntr)
- 8 reported issues in security advisor (7 WARN, 1 INFO)
- Security Definer Views previously fixed (leaderboard views)
- Function search paths need hardening

## Goals

1. Inventory and categorize all Sentry errors by severity
2. Resolve all Supabase security advisor warnings
3. Fix root causes, not just symptoms
4. Establish monitoring to prevent regression
5. Document fixes for future reference

---

## Phase 1: Sentry Error Discovery & Categorization

### 1.1 Pull Error Inventory
- [ ] Access Sentry dashboard: https://infisical.sentry.io/issues/?project=4508695498940464
- [ ] Export list of all unresolved issues
- [ ] Document each error with: title, frequency, affected users, first/last seen

### 1.2 Categorize by Severity

**P0 - Critical (Fix immediately)**
- Errors blocking core functionality (weather display, auth)
- Errors affecting >10% of sessions
- Data loss or security issues

**P1 - High (Fix within sprint)**
- Errors affecting user experience significantly
- Errors affecting 1-10% of sessions
- Recurring errors with clear patterns

**P2 - Medium (Fix within month)**
- Minor UX issues
- Edge case errors (<1% of sessions)
- Third-party integration issues

**P3 - Low (Backlog)**
- Cosmetic issues
- Extremely rare errors
- Known limitations

### 1.3 Known Error Patterns to Look For
Based on historical issues, check for:
- [ ] **Hydration Errors**: Server/client mismatch (common in Next.js)
- [ ] **ChunkLoadError**: Dynamic import failures, usually network-related
- [ ] **TypeError**: Null/undefined access, often from API responses
- [ ] **API Failures**: OpenWeatherMap, USGS, or other external API errors
- [ ] **Auth Errors**: Supabase auth session issues
- [ ] **RLS Errors**: Database permission denied errors

---

## Phase 2: Supabase Security & Performance Audit

### 2.1 Security Advisor Issues - RESOLVED ✅

**WARN Level (7 issues):**
- [x] 5x Function Search Path Mutable - **FIXED via migrations**
- [ ] 1x Leaked Password Protection Disabled - **MANUAL: Dashboard action required**
- [ ] 1x Postgres Version Needs Update - **MANUAL: Dashboard action required**

**INFO Level (1 issue):**
- [x] 1x RLS Enabled No Policy - **FIXED: Dropped unused `your_table`**

### 2.2 Known Issues to Verify/Fix

**Security Definer Views (Previously Fixed)**
- [x] `leaderboard_weekly` - Recreated without SECURITY DEFINER
- [x] `leaderboard_daily` - Recreated without SECURITY DEFINER  
- [x] `leaderboard_all_time` - Recreated without SECURITY DEFINER

**Function Search Path Issues - FIXED ✅**
- [x] `public.update_updated_at_column` - Fixed via migration `fix_update_updated_at_column_search_path`
- [x] `public.update_user_game_stats` - Fixed via migration `fix_update_user_game_stats_search_path`
- [x] `public.increment_play_count` - Fixed via migration `fix_increment_play_count_search_path`
- [x] `public.update_updated_at` - Fixed via migration `fix_update_updated_at_search_path`
- [x] `public.handle_new_user` - Fixed via migration `fix_handle_new_user_search_path`

**Auth Configuration - MANUAL ACTION REQUIRED**
- [ ] Enable leaked password protection (HaveIBeenPwned check)
  - Go to: https://supabase.com/dashboard/project/cckcvyccjntadoohjntr/auth/providers
  - Click on "Email" provider → Enable "Prevent use of leaked passwords" → Save
- [ ] Verify Google OAuth redirect URLs match production
- [ ] Verify Apple OAuth configuration (if enabled)

**Infrastructure - MANUAL ACTION REQUIRED**
- [ ] Upgrade Postgres from 17.4.1.075 to latest patched version
  - Go to: https://supabase.com/dashboard/project/cckcvyccjntadoohjntr/settings/infrastructure
  - Schedule maintenance window → Click "Upgrade Postgres"

**RLS Policy Gaps - FIXED ✅**
- [x] `public.your_table` - Dropped (unused placeholder table with 0 rows)

---

## Phase 3: Fix Implementation

### 3.1 Supabase Function Fixes (Priority: HIGH)

Run these in Supabase SQL Editor:

```sql
-- First, get current function definitions
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'update_updated_at_column',
    'update_user_game_stats', 
    'increment_play_count',
    'update_updated_at',
    'handle_new_user'
);
```

Then recreate each function with `SET search_path = ''`:

```sql
-- Example fix for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

### 3.2 Auth Configuration Fix

**Enable Leaked Password Protection:**
1. Go to: https://supabase.com/dashboard/project/cckcvyccjntadoohjntr/auth/providers
2. Click on "Email" provider
3. Enable "Prevent use of leaked passwords"
4. Save

### 3.3 Postgres Upgrade

**Upgrade Database:**
1. Go to: https://supabase.com/dashboard/project/cckcvyccjntadoohjntr/settings/infrastructure
2. Schedule maintenance window
3. Click "Upgrade Postgres"
4. Verify application works after upgrade

### 3.4 RLS Policy Investigation

```sql
-- Check what your_table actually is
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%your%';

-- If it's a real table, either add policies or disable RLS
-- Option A: Add policies
CREATE POLICY "policy_name" ON public.your_table
    FOR ALL USING (true); -- Adjust based on actual needs

-- Option B: Disable RLS if table should be public
ALTER TABLE public.your_table DISABLE ROW LEVEL SECURITY;
```

### 3.5 Sentry Error Fixes

For each P0/P1 error, create a fix following this template:

```markdown
### Error: [Error Title]
**Sentry ID**: [link]
**Frequency**: X events, Y users
**Root Cause**: [Analysis]
**Fix Applied**: [Description]
**Files Changed**: [List]
**Verification**: [How to test]
```

#### Common Fix Patterns

**Hydration Errors**
```typescript
// Wrap client-only code
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);
if (!isClient) return <Loading />;
```

**ChunkLoadError**
```typescript
// Add retry logic for dynamic imports
const Component = dynamic(() => 
  import('./Component').catch(() => {
    window.location.reload();
    return { default: () => null };
  }),
  { ssr: false }
);
```

**API Response Errors**
```typescript
// Add null checks and fallbacks
const data = response?.data ?? defaultValue;
```

---

## Phase 4: Verification & Monitoring

### 4.1 Post-Fix Verification

- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run lint` - no ESLint errors
- [ ] Run `npx playwright test` - E2E tests pass
- [ ] Manual test: Auth flow (login, logout, profile save)
- [ ] Manual test: Core features (weather, games, chat)
- [ ] Check Sentry for new errors post-deploy
- [ ] Check Supabase Security Advisor shows 0 issues

### 4.2 Monitoring Setup

- [ ] Set up Sentry alert for new P0/P1 errors
- [ ] Configure Sentry release tracking
- [ ] Set up weekly Supabase security scan
- [ ] Add error boundary components with Sentry reporting

### 4.3 Documentation

- [ ] Update TROUBLESHOOTING.md with common error patterns
- [ ] Add error handling best practices to CLAUDE.md
- [ ] Document any schema changes in migration files

---

## Success Criteria

- [ ] All P0 Sentry errors resolved
- [ ] 80%+ of P1 Sentry errors resolved
- [ ] All Supabase Security Advisor WARNs resolved (0 remaining)
- [ ] All Supabase Security Advisor INFOs resolved or documented
- [ ] Build passes with no errors
- [ ] E2E tests pass
- [ ] No new critical errors within 48 hours of deploy

---

## Appendix A: Sentry Error Inventory

**Organization:** 16bitweather (https://16bitweather.sentry.io)
**Project:** javascript-nextjs

| # | Error Title | Severity | Events | Users | Status |
|---|-------------|----------|--------|-------|--------|
| 1 | Database error in getProfile (PGRST116) | P1 | 810 | 0 | [x] FIXED - Added null UUID guard |
| 2 | Geocoding API error: 401 | P2 | 248 | 0 | [ ] ENV CONFIG - OpenWeatherMap API key issue in production |
| 3 | Turbopack error (development only) | P3 | 1 | 0 | [ ] IGNORED - Transient dev server error |

### Fix Details

**Error 1: Database error in getProfile**
- **Sentry ID**: JAVASCRIPT-NEXTJS-F
- **Root Cause**: Playwright test mode creates fake session with null UUID `00000000-0000-0000-0000-000000000000`, which was passed to `getProfile()`. The `.single()` query fails when no profile exists.
- **Fix Applied**: Added null UUID guard in `lib/supabase/database.ts` to return `null` early without querying.
- **Files Changed**: `lib/supabase/database.ts`

**Error 2: Geocoding API error: 401**
- **Sentry ID**: JAVASCRIPT-NEXTJS-J
- **Root Cause**: OpenWeatherMap API key configuration issue in Vercel production environment
- **Action Required**: Verify `OPENWEATHER_API_KEY` environment variable is correctly set in Vercel dashboard

**Error 3: Turbopack error**
- **Sentry ID**: JAVASCRIPT-NEXTJS-N
- **Root Cause**: Transient Next.js Turbopack development server issue (occurred once)
- **Action**: No fix needed - development environment issue

---

## Appendix B: Supabase Issues Inventory (COMPLETE)

### WARN Level Issues (7 total)

| # | Issue Type | Entity | Description | Status |
|---|------------|--------|-------------|--------|
| 1 | function_search_path_mutable | `public.update_updated_at_column` | Search path not set | [x] FIXED |
| 2 | function_search_path_mutable | `public.update_user_game_stats` | Search path not set | [x] FIXED |
| 3 | function_search_path_mutable | `public.increment_play_count` | Search path not set | [x] FIXED |
| 4 | function_search_path_mutable | `public.update_updated_at` | Search path not set | [x] FIXED |
| 5 | function_search_path_mutable | `public.handle_new_user` | Search path not set | [x] FIXED |
| 6 | auth_leaked_password_protection | Auth | Leaked password protection disabled | [ ] MANUAL |
| 7 | vulnerable_postgres_version | Config | Postgres 17.4.1.075 has security patches | [ ] MANUAL |

### INFO Level Issues (1 total)

| # | Issue Type | Entity | Description | Status |
|---|------------|--------|-------------|--------|
| 8 | rls_enabled_no_policy | `public.your_table` | RLS enabled but no policies | [x] FIXED (dropped) |

---

## Ralph Loop Command

Use this command to have Ralph implement the fixes:

```bash
/ralph-loop "Work through docs/PRD-sentry-supabase-issues.md

Phase 1: Inventory errors from Sentry dashboard
Phase 2: Execute Supabase fixes (functions, auth, RLS)
Phase 3: Fix Sentry errors in priority order (P0 first)
Phase 4: Verify all fixes and update documentation

Check off items as you complete them.
Run build after each significant fix.
For Supabase fixes that require dashboard access, document the SQL and mark for manual execution.

Output <promise>ISSUES_RESOLVED</promise> when all success criteria are checked."
--max-iterations 50
--completion-promise "ISSUES_RESOLVED"
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-17 | Initial PRD created |
| 2026-01-17 | Added Supabase issues inventory (8 issues: 7 WARN, 1 INFO) |
| 2026-01-18 | **FIXED:** 5 function search path issues via migrations |
| 2026-01-18 | **FIXED:** Dropped unused `your_table` (RLS with no policies) |
| 2026-01-18 | **FIXED:** Added null UUID guard to `getProfile()` (Sentry JAVASCRIPT-NEXTJS-F) |
| 2026-01-18 | **DOCUMENTED:** Manual actions for leaked password protection + Postgres upgrade |
