# Git Repository Cleanup Plan
**Date:** November 1, 2025
**Current Version:** 0.3.37
**Current Branch:** fix/location-display-bug

---

## Executive Summary

Your repository has accumulated **significant branch debt**:
- 81 local branches (64 already merged into main)
- 100+ remote branches
- 9 old stashed changes (3-4 months old)
- Inconsistent naming conventions
- Version branches that should be tags

**Estimated cleanup time:** 15-20 minutes
**Risk level:** LOW (all suggested deletions are merged or obsolete)

---

## Phase 1: Immediate Cleanup (Safe & Recommended)

### Step 1: Clear Old Stashes

All stashes are 3-4 months old and likely obsolete:

```bash
# Review what's in stashes (optional)
git stash list

# Clear all stashes (CANNOT BE UNDONE!)
git stash clear
```

**Recommendation:** Clear all stashes unless you remember specific unfinished work.

---

### Step 2: Delete Merged Local Branches

These 64 branches are already merged into main and safe to delete:

```bash
# Preview what will be deleted
git branch --merged main | grep -v "^\*" | grep -v "main" | grep -v "master"

# Delete all merged branches (RECOMMENDED)
git branch --merged main | grep -v "^\*" | grep -v "main" | grep -v "master" | xargs git branch -d
```

**What this deletes:**
- More-radar-updates
- a-few-more-games
- bug-fixes
- chore/investigation-audit
- clean-up
- feat/speed-insights-preview
- feature/fix-location-state-clearing
- feature/fix-uv-aqi-accuracy
- feature/google-apis-v0.2.6
- feature/mobile-optimization-v0.3.31
- feature/news-page-v0.3.33
- ... and 50+ more

**Safe because:** All changes are already in `main` branch.

---

### Step 3: Delete Version Branches

You have both tags AND branches for versions. Keep tags, delete branches:

```bash
# List version branches
git branch | grep "^  v0\."

# Delete specific version branches (examples)
git branch -d v0.2.71
git branch -d v0.2.72
git branch -d v0.2.73
git branch -d v0.2.74
git branch -d v0.2.75
git branch -d v0.2.76
git branch -d v0.2.77
git branch -d v0.2.78
git branch -d v0.2.79
git branch -d v0.2.8
git branch -d v0.2.81
git branch -d v0.2.82
git branch -d v0.2.83
git branch -d v0.2.84
git branch -d v0.2.85
git branch -d v0.2.9
git branch -d v0.3.1-critical-fixes
git branch -d v0.3.11-search-improvement
git branch -d v0.3.12
git branch -d v0.3.25
git branch -d v0.3.3
git branch -d v0.3.32
git branch -d v0.4
git branch -d v0.4.5-experiment
git branch -d v0.4.56-navigation-bar-update
git branch -d v0.5.0-user-authentication-setup
git branch -d v0.5.01
git branch -d v0.5.02

# Or delete all v0.* branches at once
git branch | grep "^  v0\." | xargs git branch -d
```

**Safe because:** You have git tags for all these versions.

---

### Step 4: Delete Old Master Branch

You have both `main` and `master`. Keep only `main`:

```bash
# Check if master is behind main (should be)
git log main..master

# If no output, it's safe to delete
git branch -d master
```

---

### Step 5: Prune Remote-Tracking Branches

Remove references to deleted remote branches:

```bash
# See what will be pruned
git remote prune origin --dry-run

# Actually prune
git remote prune origin

# Or use fetch with prune
git fetch --prune
```

---

## Phase 2: Remote Cleanup (After Local Cleanup)

### Delete Remote Branches That Are Merged

**WARNING:** This affects GitHub! Only do this after Phase 1.

```bash
# List remote branches merged into main
git branch -r --merged origin/main | grep -v "main" | grep -v "HEAD"

# Delete specific remote branches (examples)
git push origin --delete UI-improvements  # Already merged PR #126
git push origin --delete a-few-more-games
git push origin --delete bug-fixes
git push origin --delete clean-up
# ... add more as needed

# Or use GitHub UI to bulk delete merged branches
# Settings → Branches → Delete merged branches
```

**Recommendation:** Use GitHub's web UI for safer bulk deletion.

---

## Phase 3: Establish Branch Management Policy

### Branch Naming Convention

Going forward, use this standard:

```
feature/   - New features
fix/       - Bug fixes
hotfix/    - Urgent production fixes
chore/     - Maintenance (deps, configs)
refactor/  - Code refactoring
docs/      - Documentation
test/      - Test additions/fixes
perf/      - Performance improvements
```

**Examples:**
```
✅ feature/add-hurricane-tracker
✅ fix/location-detection-timeout
✅ hotfix/api-key-leak
✅ chore/update-nextjs-15
❌ More-radar-updates  (no prefix)
❌ v0.3.38  (use tags instead)
```

### Release/Version Management

**For versions, use tags NOT branches:**

```bash
# When releasing v0.3.38
git tag -a v0.3.38 -m "Release v0.3.38 - Location improvements"
git push origin v0.3.38

# DON'T create branches like v0.3.38
```

**For release branches (long-term support):**
```bash
# Only for major versions needing parallel support
git checkout -b release/v1.x
```

---

## Recommended Workflow Going Forward

### 1. Start New Work
```bash
git checkout main
git pull origin main
git checkout -b feature/descriptive-name
```

### 2. During Development
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/descriptive-name
```

### 3. After PR is Merged
```bash
# Immediately clean up
git checkout main
git pull origin main
git branch -d feature/descriptive-name

# If remote branch wasn't auto-deleted
git push origin --delete feature/descriptive-name
```

### 4. Weekly Maintenance (Friday Cleanup)
```bash
# Update main
git checkout main
git pull origin main

# Delete merged branches
git branch --merged main | grep -v "^\*" | grep -v "main" | xargs git branch -d

# Prune remote tracking
git fetch --prune

# Check status
git branch -vv
```

### 5. Monthly Audit
```bash
# List all branches with last commit date
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'

# Delete branches older than 30 days that aren't merged
# (Review each one manually)
```

---

## Automation Scripts

### Create `.git/hooks/post-merge` (Auto-cleanup after merge)

```bash
#!/bin/bash
# Auto-delete merged branches after merging PRs

current_branch=$(git symbolic-ref --short HEAD)

if [ "$current_branch" == "main" ]; then
    echo "Cleaning up merged branches..."
    git branch --merged main | grep -v "^\*" | grep -v "main" | xargs -r git branch -d
    git fetch --prune
    echo "Cleanup complete!"
fi
```

Make it executable:
```bash
chmod +x .git/hooks/post-merge
```

### Add npm script for weekly cleanup

In `package.json`:
```json
{
  "scripts": {
    "cleanup": "git branch --merged main | grep -v '\\*\\|main' | xargs git branch -d && git fetch --prune"
  }
}
```

Usage:
```bash
npm run cleanup
```

---

## GitHub Settings Recommendations

### Enable Auto-Delete of Merged Branches

1. Go to: `https://github.com/deephouse23/Weather-application-/settings`
2. Under "Pull Requests"
3. Check "Automatically delete head branches"

This auto-deletes remote branches after PR merge.

### Branch Protection Rules

For `main` branch:
1. Require pull request reviews
2. Require status checks to pass
3. No direct pushes to main
4. Dismiss stale reviews when new commits are pushed

---

## One-Command Nuclear Cleanup (Use with Caution!)

If you want to clean everything at once:

```bash
# DANGER: This deletes ALL merged branches and stashes
# Make sure you're on main first!
git checkout main && \
git pull origin main && \
git stash clear && \
git branch --merged main | grep -v "^\*" | grep -v "main" | grep -v "master" | xargs git branch -d && \
git branch | grep "^  v0\." | xargs git branch -d && \
git branch -d master 2>/dev/null; \
git fetch --prune && \
echo "Cleanup complete! Remaining branches:" && \
git branch
```

**Before running:** Make sure you're comfortable deleting everything!

---

## Current Active Branches to KEEP

These branches appear to have unmerged work:

- `fix/location-display-bug` (current branch - your active work)
- `fix/search-state-improvements` (1 commit ahead)
- Any branch you're actively working on

**Check these manually** before deleting.

---

## Checklist

Before you start cleanup:

- [ ] You're on a stable internet connection
- [ ] All current work is committed and pushed
- [ ] You've reviewed the list of branches to be deleted
- [ ] You understand that stash clear cannot be undone
- [ ] You have a recent backup (or trust that merged branches are safe)

After cleanup:

- [ ] Run `git branch` to see remaining branches
- [ ] Run `git status` to verify clean state
- [ ] Test that your current work still functions
- [ ] Document your new branch naming convention
- [ ] Enable GitHub auto-delete for merged branches

---

## Expected Results

**Before:**
- 81 local branches
- 100+ remote branches
- 9 stashes
- Cluttered, confusing

**After:**
- ~5-10 active branches
- Clean remote branch list
- 0 stashes
- Clear, organized

---

## Need Help?

If something goes wrong:

1. **Recover deleted branch:**
   ```bash
   git reflog
   git checkout -b recovered-branch <commit-hash>
   ```

2. **Recover deleted stash:**
   ```bash
   # Can't recover after `stash clear`!
   # This is why we review first
   ```

3. **Reset if things break:**
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

---

**Generated:** 2025-11-01
**For:** Weather Application Repository Cleanup
