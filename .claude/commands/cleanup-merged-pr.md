---
model: sonnet
---

# Cleanup After Merged PR

Clean up local and remote branches after a PR has been merged to main.

## Instructions

When the user indicates their PR has been merged to main, perform these cleanup steps:

1. **Switch to main and pull latest**
   ```bash
   git checkout main
   git pull origin main
   ```
   - If there are uncommitted changes, stash them first: `git stash`

2. **Delete the local feature branch**
   - Identify the feature branch name from context or ask user
   - Delete: `git branch -d <branch-name>`

3. **Delete the remote feature branch**
   - Use `--no-verify` to skip pre-push hooks (we're deleting, not pushing code)
   ```bash
   git push origin --delete <branch-name> --no-verify
   ```

4. **Clean up temporary files**
   ```bash
   rm -f PLAN.md nul
   ```

5. **Drop stash if used**
   ```bash
   git stash drop
   ```

6. **Verify clean state**
   ```bash
   git status
   git branch -a | head -20
   ```

## Expected Output

Report to user:
- Confirmation that local branch was deleted
- Confirmation that remote branch was deleted
- Current state (should be on main with clean working tree)

## Usage

User triggers with:
- `/cleanup-merged-pr`
- "PR merged, clean up"
- "Clean up after merge"
