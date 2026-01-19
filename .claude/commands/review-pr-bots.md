# Review PR Bot Comments

Review the current PR's automated review comments from CodeRabbit, BugBot, and any other bots.

## Instructions

1. **Get the current branch and find associated PR**
   ```bash
   git branch --show-current
   gh pr list --head <branch> --json number,url
   ```

2. **Fetch all review comments on the PR**
   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
   gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews
   ```

3. **Categorize issues by severity:**
   - **Critical/Major**: Security issues, bugs, breaking changes, performance problems
   - **Minor**: Style suggestions, naming conventions, optional improvements
   - **Nitpicks**: Formatting, preferences that don't affect functionality

4. **For each Critical/Major issue:**
   - Explain the problem clearly
   - Implement the fix
   - Stage the changes
   - Commit with message referencing the review feedback

5. **For Minor issues:**
   - List them with a brief assessment of whether they're worth fixing
   - Ask if I want to address any specific ones

6. **Ignore nitpicks** unless they're trivial one-line fixes

## Output Format

Provide a summary like:

```
## PR Bot Review Summary

- X critical issues (fixed)
- Y major issues (fixed)
- Z minor issues (listed for review)

### Critical/Major Issues Fixed
1. [Description of issue and fix]

### Minor Issues (Optional)
1. [Issue] - [Assessment]
2. [Issue] - [Assessment]

Would you like me to address any of the minor issues?
```

## After Fixes

If fixes were made:
1. Commit changes with descriptive message
2. Push to the branch (with --no-verify if needed to skip hooks)
3. Report what was pushed
