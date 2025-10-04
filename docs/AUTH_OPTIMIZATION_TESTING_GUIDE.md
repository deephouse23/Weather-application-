# Authentication Optimization Testing Guide

This guide provides step-by-step instructions for testing the authentication performance optimizations.

---

## Pre-Testing Checklist

- [ ] Backup current production database
- [ ] Review all changes in `perf/auth-optimization` branch
- [ ] Ensure development environment is running
- [ ] Clear browser cache and local storage
- [ ] Have browser DevTools open (Network and Performance tabs)

---

## Test Plan

### 1. Performance Baseline Tests

#### 1.1 Measure Current Performance (Before Optimization)

**Setup:**
```bash
# Checkout main branch for baseline
git checkout main
npm install
npm run dev
```

**Steps:**
1. Open browser DevTools → Performance tab
2. Start recording
3. Navigate to `/auth/login`
4. Log in with test credentials
5. Stop recording
6. Note the timing for:
   - Initial session fetch
   - Profile data load
   - Preferences load
   - Total authentication time

**Expected Baseline:**
- Initial auth: 680-1150ms
- Page navigation with auth: 200-400ms

#### 1.2 Measure Optimized Performance

**Setup:**
```bash
# Checkout optimization branch
git checkout perf/auth-optimization
npm install
npm run dev
```

**Steps:**
1. Repeat the same test as 1.1
2. Compare timings

**Expected Results:**
- Initial auth (cold): ~450ms (47% faster)
- Initial auth (warm/cached): ~50ms (94% faster)
- Page navigation: ~50-100ms (75% faster)

---

### 2. Functional Tests

#### 2.1 Authentication Flow

**Test Cases:**

1. **Sign Up**
   - [ ] New user can sign up successfully
   - [ ] Profile is created
   - [ ] Preferences are initialized with defaults
   - [ ] User is redirected to home page
   - [ ] Cache is populated

2. **Sign In**
   - [ ] Existing user can sign in
   - [ ] Session is established
   - [ ] Profile data loads
   - [ ] Preferences load
   - [ ] Cache hit on second load

3. **Sign Out**
   - [ ] User can sign out
   - [ ] Cache is cleared
   - [ ] Session is terminated
   - [ ] User is redirected to home
   - [ ] Protected routes redirect to login

#### 2.2 Cache Functionality

**Test Cases:**

1. **Profile Cache**
   ```typescript
   // In browser console:
   // First load - should fetch from API
   await fetchProfile(userId);  // Check Network tab for request

   // Second load - should use cache
   await fetchProfile(userId);  // Check Network tab - no request
   ```

   - [ ] First load fetches from API
   - [ ] Second load uses cache (no network request)
   - [ ] Cache expires after 5 minutes
   - [ ] Manual refresh bypasses cache

2. **Preferences Cache**
   - [ ] Preferences cached after first load
   - [ ] Updates invalidate cache
   - [ ] Optimistic updates work
   - [ ] Cache persists across page navigations

3. **Session Cache (Middleware)**
   - [ ] Session validated once per minute max
   - [ ] Protected routes check cache first
   - [ ] Cache invalidated on sign out
   - [ ] Fresh session on sign in

#### 2.3 Request Deduplication

**Test Case:**

```typescript
// In browser console, run these simultaneously:
Promise.all([
  fetchProfile(userId),
  fetchProfile(userId),
  fetchProfile(userId)
]);
```

**Expected:**
- [ ] Only 1 API request is made (check Network tab)
- [ ] All 3 promises resolve with same data
- [ ] No race conditions
- [ ] Console shows deduplication log

#### 2.4 Parallel Fetching

**Test Case:**

Enable performance monitoring:
```typescript
// In auth-context-optimized.tsx, check logs
// Should see parallel fetching logs
```

**Expected:**
- [ ] Profile and preferences fetch in parallel
- [ ] Total time ≈ max(profile_time, preferences_time)
- [ ] Not sum of both times
- [ ] Performance monitor shows parallel execution

---

### 3. Edge Cases & Error Handling

#### 3.1 Network Errors

**Test Cases:**

1. **Offline Mode**
   - [ ] Enable Chrome offline mode
   - [ ] Try to sign in
   - [ ] Error is handled gracefully
   - [ ] Cached data still available
   - [ ] UI shows appropriate error

2. **Slow Network**
   - [ ] Enable Chrome network throttling (Slow 3G)
   - [ ] Sign in
   - [ ] Loading states show correctly
   - [ ] Timeout handling works (3s timeout)

3. **API Errors**
   - [ ] Mock API error (500 status)
   - [ ] Error message displayed
   - [ ] Cache not corrupted
   - [ ] Retry mechanism works

#### 3.2 Concurrent Users

**Test Case:**

1. Open 3 browser windows (or incognito tabs)
2. Sign in as different users
3. Switch between tabs rapidly

**Expected:**
- [ ] Each user's data isolated in cache
- [ ] No data leakage between users
- [ ] Cache keys properly scoped
- [ ] No memory leaks

#### 3.3 Session Expiration

**Test Case:**

1. Sign in
2. Wait for session to expire (or manually delete session cookie)
3. Try to navigate to `/dashboard`

**Expected:**
- [ ] Redirected to login
- [ ] Cache cleared
- [ ] No stale data shown
- [ ] Re-auth works correctly

---

### 4. Performance Stress Tests

#### 4.1 Rapid Navigation

**Test Case:**

```javascript
// In browser console:
for (let i = 0; i < 20; i++) {
  setTimeout(() => {
    window.location.href = i % 2 === 0 ? '/dashboard' : '/profile';
  }, i * 100);
}
```

**Expected:**
- [ ] No memory leaks
- [ ] Cache doesn't grow unbounded
- [ ] Performance stays consistent
- [ ] No browser crashes

#### 4.2 Cache Size Management

**Test Case:**

1. Sign in and out 100+ times
2. Check memory usage (Chrome Task Manager)

**Expected:**
- [ ] Memory usage stays stable
- [ ] Cache evicts old entries (LRU)
- [ ] No memory growth over time

---

### 5. Database Performance Tests

#### 5.1 Index Verification

**Run in Supabase SQL Editor:**

```sql
-- Check if indexes are created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('profiles', 'user_preferences', 'saved_locations')
AND schemaname = 'public';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

**Expected:**
- [ ] All new indexes exist
- [ ] Indexes are being used (idx_scan > 0)
- [ ] Query plans use Index Scan, not Seq Scan

#### 5.2 Query Performance

**Run EXPLAIN ANALYZE:**

```sql
-- Profile lookup
EXPLAIN ANALYZE
SELECT * FROM profiles WHERE id = 'test-user-id';

-- Preferences lookup
EXPLAIN ANALYZE
SELECT * FROM user_preferences WHERE user_id = 'test-user-id';

-- Saved locations with sort
EXPLAIN ANALYZE
SELECT * FROM saved_locations
WHERE user_id = 'test-user-id'
ORDER BY is_favorite DESC, created_at DESC;
```

**Expected:**
- [ ] Index Scan used (not Seq Scan)
- [ ] Execution time < 10ms for simple queries
- [ ] No full table scans

---

### 6. Browser Compatibility Tests

**Test in:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Verify:**
- [ ] Authentication works
- [ ] Cache functions correctly
- [ ] Performance improvements consistent
- [ ] No console errors

---

### 7. Rollback Testing

#### 7.1 Verify Rollback Plan

**Steps:**
```bash
# Test rollback
git checkout main
npm install
npm run dev
```

**Expected:**
- [ ] App works with old code
- [ ] No breaking changes in data structures
- [ ] Database compatible with both versions

---

## Performance Metrics Collection

### Metrics to Track

1. **Authentication Times**
   - Initial auth (cold): _____ms (target: <450ms)
   - Subsequent auth (warm): _____ms (target: <50ms)
   - Sign out: _____ms (target: <100ms)

2. **Cache Performance**
   - Cache hit rate: ____% (target: >80%)
   - Cache lookup time: _____ms (target: <5ms)
   - Cache invalidation time: _____ms (target: <10ms)

3. **API Calls**
   - Calls per auth flow: _____ (target: <3)
   - Deduplicated requests: _____ (target: >70%)

4. **Middleware**
   - Session check time: _____ms (target: <20ms)
   - Cache hit rate: ____% (target: >90%)

### Tools for Measurement

1. **Chrome DevTools**
   - Performance tab for timing
   - Network tab for API calls
   - Memory tab for leak detection

2. **Performance Monitor**
   ```typescript
   // Enable in development
   import { authPerfMonitor } from '@/lib/performance/auth-perf'
   authPerfMonitor.setEnabled(true)
   authPerfMonitor.logSummary()
   ```

3. **Network Analysis**
   - Chrome DevTools → Network → Disable cache
   - Look for duplicate requests
   - Check request/response times

---

## Success Criteria

All tests must pass:

- [ ] Performance improvements achieved (47% faster cold, 94% faster warm)
- [ ] All functional tests pass
- [ ] No regressions in existing functionality
- [ ] Cache works correctly
- [ ] Request deduplication working
- [ ] Database indexes created and used
- [ ] No memory leaks
- [ ] Browser compatibility confirmed
- [ ] Error handling robust
- [ ] Rollback plan verified

---

## Troubleshooting

### Common Issues

1. **Cache not working**
   - Check browser local storage quota
   - Verify cache TTL settings
   - Check for cache invalidation bugs

2. **Performance not improved**
   - Verify optimized code is running
   - Check if cache is being hit
   - Look for network bottlenecks

3. **Auth state not updating**
   - Check auth state listener
   - Verify cache invalidation on updates
   - Look for race conditions

### Debug Commands

```bash
# Check current branch
git branch

# View performance logs
# (In browser console after enabling authPerfMonitor)
authPerfMonitor.logSummary()

# Check cache state
# (In browser console)
localStorage.getItem('auth-cache')
```

---

## Reporting

### Bug Report Template

```markdown
**Issue:** [Brief description]

**Environment:**
- Branch: perf/auth-optimization
- Browser: [Chrome/Firefox/Safari]
- Version: [Version number]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Performance Metrics:**
- Time: ___ms
- Cache hit: Yes/No
- API calls: ___

**Console Errors:**
```
[Paste console output]
```

**Screenshots:**
[Attach screenshots]
```

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Merge to main branch
   - Deploy to staging
   - Monitor production metrics
   - Document lessons learned

2. **If Tests Fail:**
   - Document failures
   - Fix issues
   - Re-run tests
   - Update optimization as needed

3. **Continuous Monitoring:**
   - Set up performance dashboards
   - Track cache hit rates
   - Monitor API call volumes
   - Watch for memory leaks
