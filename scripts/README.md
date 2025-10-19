# 16-Bit Weather - Scripts

This directory contains helper scripts for development workflows.

## create-pr.sh

Validates pull request titles and descriptions for emoji-free content before creating PRs on GitHub.

### Usage

Instead of using `gh pr create` directly, use this script:

```bash
# Basic usage
./scripts/create-pr.sh --title "Add new feature" --body "Description here"

# With all options
./scripts/create-pr.sh --title "fix: resolve issue" --body "Detailed description" --base main

# The script passes all arguments to gh pr create after validation
```

### What it checks

- PR title does not contain emojis
- PR body/description does not contain emojis
- If emojis found, displays helpful error message and exits
- If validation passes, creates PR normally using `gh`

### Why

This project enforces a strict no-emoji policy for:
- Professional tone
- Accessibility (screen readers)
- Encoding consistency
- Git compatibility

See CLAUDE.md for complete emoji policy.

## Future Scripts

Additional helper scripts can be added here for:
- Deployment automation
- Database migrations
- Test runners
- Code generation
