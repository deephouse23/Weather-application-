# Development Workflow & Best Practices
**16-Bit Weather Application**
**Updated:** November 2025

---

## Table of Contents

1. [Branch Naming Convention](#branch-naming-convention)
2. [Release Management](#release-management)
3. [Daily Workflow](#daily-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Commit Message Standards](#commit-message-standards)
6. [Weekly Maintenance](#weekly-maintenance)
7. [GitHub Settings](#github-settings)
8. [Automation Scripts](#automation-scripts)

---

## Branch Naming Convention

### Standard Prefixes

Use these prefixes for ALL branches:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features or enhancements | `feature/hurricane-tracker` |
| `fix/` | Bug fixes | `fix/location-timeout-error` |
| `hotfix/` | Urgent production fixes | `hotfix/api-key-exposure` |
| `chore/` | Maintenance, dependencies, configs | `chore/update-nextjs-15` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/weather-api-service` |
| `docs/` | Documentation updates | `docs/update-setup-guide` |
| `test/` | Test additions or fixes | `test/add-forecast-unit-tests` |
| `perf/` | Performance improvements | `perf/optimize-radar-loading` |
| `style/` | Code style changes (formatting, etc.) | `style/eslint-fixes` |
| `ci/` | CI/CD pipeline changes | `ci/add-playwright-tests` |

### Naming Rules

**Format:**
```
<prefix>/<short-description>
```

**Rules:**
1. Always use lowercase
2. Use hyphens (-) not underscores (_) or spaces
3. Be descriptive but concise (max 50 chars)
4. Use present tense ("add" not "added")
5. NO version numbers in branch names (use tags instead)

**Good Examples:**
```bash
✅ feature/add-pollen-alerts
✅ fix/location-detection-timeout
✅ hotfix/api-rate-limit-exceeded
✅ chore/upgrade-react-19
✅ refactor/split-weather-components
```

**Bad Examples:**
```bash
❌ More-radar-updates          # Capital letter, no prefix
❌ quick_wins                  # Underscore instead of hyphen
❌ v0.3.38                     # Version number (use tags!)
❌ fix-stuff                   # Too vague
❌ feature/add-the-new-hurricane-tracking-system-with-alerts  # Too long
```

### Branch Types by Use Case

**1. Feature Development**
```bash
git checkout -b feature/add-hurricane-tracker
```
Use when: Adding new functionality

**2. Bug Fixes**
```bash
git checkout -b fix/location-permission-denied
```
Use when: Fixing non-critical bugs

**3. Hotfixes**
```bash
git checkout -b hotfix/security-vulnerability
```
Use when: Urgent production issues that can't wait for next release

**4. Maintenance**
```bash
git checkout -b chore/update-dependencies
```
Use when: Dependency updates, config changes, cleanup

**5. Performance**
```bash
git checkout -b perf/lazy-load-radar-component
```
Use when: Optimizing performance without changing features

---

## Release Management

### Use Tags, NOT Branches

**DO THIS:**
```bash
# When ready to release v0.3.38
git checkout main
git pull origin main

# Create annotated tag
git tag -a v0.3.38 -m "Release v0.3.38 - Location improvements and bug fixes"

# Push tag to GitHub
git push origin v0.3.38

# Update package.json version
npm version 0.3.38 --no-git-tag-version
git add package.json
git commit -m "chore: bump version to 0.3.38"
git push origin main
```

**DON'T DO THIS:**
```bash
❌ git checkout -b v0.3.38  # NO! Use tags instead
```

### Semantic Versioning (SemVer)

Follow this standard: `MAJOR.MINOR.PATCH`

**Format:** `v0.3.38`

- **MAJOR (0)**: Breaking changes, major rewrites
- **MINOR (3)**: New features, backward compatible
- **PATCH (38)**: Bug fixes, backward compatible

**When to bump:**
```
v0.3.37 → v0.3.38  (Bug fixes)
v0.3.38 → v0.4.0   (New feature)
v0.4.0  → v1.0.0   (Breaking changes, major release)
```

### Release Branches (Only for Long-Term Support)

Only create release branches for major versions needing parallel support:

```bash
# Example: Supporting v1.x while developing v2.x
git checkout -b release/v1.x
```

**When to use:**
- Enterprise customers on old version
- Maintaining LTS (Long-Term Support) versions
- Parallel development of major versions

**For this project:** NOT needed. Just use tags.

---

## Daily Workflow

### Starting Work on a New Task

```bash
# 1. Switch to main and update
git checkout main
git pull origin main

# 2. Create feature branch with proper naming
git checkout -b feature/add-weather-alerts

# 3. Verify you're on the right branch
git branch --show-current
```

### During Development

```bash
# Make changes to files...

# 1. Check what changed
git status
git diff

# 2. Stage changes
git add .
# or stage specific files
git add app/alerts/page.tsx

# 3. Commit with descriptive message
git commit -m "feat: add weather alert notification system"

# 4. Push to remote (creates remote branch)
git push origin feature/add-weather-alerts

# If first push:
git push -u origin feature/add-weather-alerts
```

### Making Multiple Commits

```bash
# Commit often, push regularly
git add app/alerts/
git commit -m "feat: create alerts page layout"
git push

# Continue work...
git add components/alert-card.tsx
git commit -m "feat: add alert card component"
git push

# Continue work...
git add lib/alerts-api.ts
git commit -m "feat: add alerts API service"
git push
```

### Keeping Branch Updated with Main

**Option 1: Merge (safer, preserves history)**
```bash
git checkout feature/add-weather-alerts
git fetch origin
git merge origin/main
```

**Option 2: Rebase (cleaner history, but rewrites commits)**
```bash
git checkout feature/add-weather-alerts
git fetch origin
git rebase origin/main

# If conflicts, resolve them, then:
git add .
git rebase --continue
```

**Recommendation:** Use merge for shared branches, rebase for personal branches.

---

## Pull Request Process

### Before Creating PR

```bash
# 1. Make sure branch is up to date
git checkout main
git pull origin main
git checkout feature/add-weather-alerts
git merge main  # or git rebase main

# 2. Run tests
npm test

# 3. Run linter
npm run lint

# 4. Build project
npm run build

# 5. Push final changes
git push origin feature/add-weather-alerts
```

### Creating PR on GitHub

1. Go to: `https://github.com/deephouse23/Weather-application-/pulls`
2. Click "New pull request"
3. Select base: `main` ← compare: `feature/add-weather-alerts`
4. Fill in PR template:

```markdown
## Summary
Add weather alert notification system with push notifications.

## Changes
- Created alerts page with real-time updates
- Added AlertCard component
- Integrated NOAA weather alerts API
- Added push notification service worker

## Testing
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Verified mobile responsiveness
- [ ] Tested push notifications
- [ ] All existing tests pass
- [ ] Added new tests for alerts

## Screenshots
[Attach screenshots of new UI]

## Related Issues
Closes #123
```

5. Request reviewers
6. Add labels: `feature`, `needs-review`
7. Create pull request

### PR Title Format

Follow Conventional Commits:

```
feat: add weather alert notification system
fix: resolve location detection timeout
chore: update dependencies to latest versions
docs: update README with new features
```

### After PR is Created

**During Review:**
- Respond to all comments
- Make requested changes
- Push updates to same branch (PR auto-updates)
- Re-request review after changes

**If Reviewer Requests Changes:**
```bash
# Make changes...
git add .
git commit -m "fix: address PR review comments"
git push origin feature/add-weather-alerts
```

### After PR is Merged

**IMMEDIATELY clean up:**

```bash
# 1. Switch to main
git checkout main

# 2. Pull merged changes
git pull origin main

# 3. Delete local branch
git branch -d feature/add-weather-alerts

# 4. Delete remote branch (if not auto-deleted)
git push origin --delete feature/add-weather-alerts

# 5. Verify cleanup
git branch
```

**GitHub Auto-Delete:**
Enable "Automatically delete head branches" in repo settings to auto-delete remote branch after merge.

---

## Commit Message Standards

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add hurricane tracker` |
| `fix` | Bug fix | `fix: resolve timeout in location service` |
| `docs` | Documentation | `docs: update API documentation` |
| `style` | Code style (no logic change) | `style: format with prettier` |
| `refactor` | Code refactoring | `refactor: extract weather API logic` |
| `perf` | Performance improvement | `perf: lazy load radar component` |
| `test` | Add/update tests | `test: add unit tests for alerts` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |
| `revert` | Revert previous commit | `revert: revert feat(alerts)` |

### Scope (Optional)

Specify what part of the codebase:

```
feat(radar): add animation controls
fix(auth): resolve session timeout
chore(deps): update Next.js to 15.2.4
```

### Subject Rules

1. Use imperative mood: "add" not "added" or "adds"
2. Don't capitalize first letter
3. No period (.) at end
4. Max 50 characters

**Good:**
```
✅ feat: add weather alert notifications
✅ fix: resolve location timeout error
✅ chore: update dependencies
```

**Bad:**
```
❌ Added weather alerts  # Past tense, capital letter
❌ Fix bug.  # Capital letter, period
❌ feat: Add the new weather alert notification system with push notifications and email alerts  # Too long
```

### Body (Optional)

Explain WHAT and WHY, not HOW:

```
feat: add weather alert notifications

Add real-time severe weather alerts using NOAA API.
Users can subscribe to alerts for saved locations.
Notifications use Web Push API for desktop/mobile.

Resolves user feedback about missing alert system.
```

### Footer (Optional)

Reference issues:

```
feat: add weather alert notifications

Closes #123
Fixes #45
See also #67
```

### Breaking Changes

Mark breaking changes:

```
feat!: migrate to new authentication system

BREAKING CHANGE: Old auth tokens are no longer valid.
Users must re-authenticate after update.

Closes #200
```

### Examples

**Simple commit:**
```bash
git commit -m "fix: resolve radar loading timeout"
```

**With body:**
```bash
git commit -m "feat: add hurricane tracker

Add real-time hurricane tracking using NHC data.
Shows current position, forecast cone, and alerts.
Automatically updates every 10 minutes.

Closes #156"
```

**Breaking change:**
```bash
git commit -m "feat!: migrate to Supabase auth

BREAKING CHANGE: Removed NextAuth.js in favor of Supabase.
Existing user sessions will be invalidated.

Closes #180"
```

---

## Weekly Maintenance

### Friday Afternoon Cleanup Routine

Run this checklist every Friday:

```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Delete merged branches
git branch --merged main | grep -v "^\*" | grep -v "main" | xargs git branch -d

# 3. Prune remote-tracking branches
git fetch --prune

# 4. Check for stale branches (> 30 days old)
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'

# 5. Review active branches
git branch -vv

# 6. Check repo size
git count-objects -vH
```

### Monthly Audit

First Monday of each month:

```bash
# 1. Review all branches
git branch -a

# 2. Delete stale branches (manually review each)
git branch -d old-branch-name

# 3. Clean up tags (if needed)
git tag -l | sort -V

# 4. Update dependencies
npm outdated
npm update

# 5. Run security audit
npm audit
npm audit fix

# 6. Review and close stale issues/PRs on GitHub
```

---

## GitHub Settings

### Repository Settings

**Recommended settings for `https://github.com/deephouse23/Weather-application-/settings`:**

#### General

- ✅ **Automatically delete head branches**
  - Auto-deletes branch after PR merge
  - Settings → Pull Requests → Check box

#### Branches

**Branch Protection for `main`:**

1. Go to Settings → Branches → Branch protection rules
2. Add rule for `main`:
   - ✅ Require pull request reviews before merging (1 approver)
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date
   - ✅ Include administrators
   - ✅ Restrict pushes to `main` (only via PR)

#### Merge Options

- ✅ Allow squash merging (clean history)
- ❌ Allow merge commits (avoid messy history)
- ✅ Allow rebase merging (for simple PRs)
- ✅ Automatically delete head branches

---

## Automation Scripts

### npm Scripts (add to package.json)

```json
{
  "scripts": {
    "cleanup": "git fetch --prune && git branch --merged main | grep -v '\\*\\|main' | xargs git branch -d",
    "branches": "git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'",
    "release": "npm run test && npm run lint && npm run build && echo 'Ready to release!'",
    "new-branch": "git checkout main && git pull && git checkout -b"
  }
}
```

**Usage:**
```bash
npm run cleanup        # Delete merged branches
npm run branches       # List branches by date
npm run release        # Pre-release checks
npm run new-branch feature/my-feature  # Create new branch from main
```

### Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
    # Short status
    st = status -sb

    # Pretty log
    lg = log --graph --oneline --all --decorate

    # Delete merged branches
    cleanup = "!git branch --merged main | grep -v '\\*\\|main' | xargs -n 1 git branch -d"

    # List branches by date
    recent = for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'

    # Undo last commit (keep changes)
    undo = reset --soft HEAD~1

    # Amend commit without editing message
    amend = commit --amend --no-edit

    # Update branch from main
    sync = !git fetch origin && git rebase origin/main
```

**Usage:**
```bash
git st              # Short status
git lg              # Pretty log
git cleanup         # Delete merged branches
git recent          # Branches by date
git undo            # Undo last commit
git amend           # Amend without editing message
git sync            # Sync with main
```

### Pre-commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Run linter before each commit

echo "Running linter..."
npm run lint

if [ $? -ne 0 ]; then
    echo "Linter failed. Commit aborted."
    exit 1
fi

echo "Linter passed!"
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Post-merge Hook

Create `.git/hooks/post-merge`:

```bash
#!/bin/bash
# Auto-cleanup after merging

current_branch=$(git symbolic-ref --short HEAD)

if [ "$current_branch" == "main" ]; then
    echo "🧹 Cleaning up merged branches..."
    git branch --merged main | grep -v "^\*" | grep -v "main" | xargs -r git branch -d
    git fetch --prune
    echo "✅ Cleanup complete!"
fi
```

Make executable:
```bash
chmod +x .git/hooks/post-merge
```

---

## Quick Reference Card

### Starting New Work
```bash
git checkout main && git pull
git checkout -b feature/my-feature
```

### Daily Commits
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### Creating PR
```bash
git push origin feature/my-feature
# Then create PR on GitHub
```

### After PR Merged
```bash
git checkout main && git pull
git branch -d feature/my-feature
```

### Weekly Cleanup
```bash
npm run cleanup
git fetch --prune
```

---

## Best Practices Summary

### DO ✅

- Use descriptive branch names with prefixes
- Commit often with clear messages
- Keep branches short-lived (< 1 week)
- Delete branches after merge
- Run tests before pushing
- Pull `main` before creating new branch
- Use tags for versions, not branches
- Enable auto-delete for merged branches
- Review code before creating PR

### DON'T ❌

- Create version branches (use tags!)
- Commit directly to `main`
- Leave branches after merge
- Use vague commit messages ("fix stuff")
- Push without testing
- Let branches get stale (> 30 days)
- Commit secrets or API keys
- Force push to shared branches
- Skip code review

---

## Questions?

**Need help?**
- Review this guide: `WORKFLOW.md`
- Check cleanup plan: `cleanup-plan.md`
- Review project docs: `CLAUDE.md`
- Git documentation: https://git-scm.com/doc

---

**Last Updated:** November 2025
**Maintained By:** Development Team
**Next Review:** December 2025
