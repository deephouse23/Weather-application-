# Cleanup After Merged PR

Clean up local and remote branches after a PR has been merged to main.

## Instructions

When the user indicates their PR has been merged to main, perform these cleanup steps:

1. **Switch to main and pull latest**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Delete the local feature branch**
   - First, identify the current feature branch name
   - If there are uncommitted changes, stash them: `git stash`
   - Delete the local branch: `git branch -d <branch-name>`

3. **Delete the remote feature branch**
   ```bash
   git push origin --delete <branch-name>
   ```

4. **Clean up any temporary files**
   - Remove `PLAN.md` if it exists
   - Remove any `nul` or temp artifacts

5. **Drop stash if it was used**
   ```bash
   git stash drop
   ```

6. **Verify clean state**
   ```bash
   git status
   git branch -a
   ```

## Expected Output

Report to user:
- Confirmation that local branch was deleted
- Confirmation that remote branch was deleted
- Current branch status (should be on main, clean working tree)
- List of remaining branches for reference

## Usage

User says something like:
- "PR merged, clean up"
- "The PR is merged to main, clean up local and remote"
- "/cleanup-merged-pr"
