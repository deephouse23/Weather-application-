#!/bin/bash
# 16-Bit Weather - PR Creation with Emoji Validation
# Validates PR title and body before creation

TITLE=""
BODY=""
HAS_ERROR=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --title)
            TITLE="$2"
            shift 2
            ;;
        --body)
            BODY="$2"
            shift 2
            ;;
        *)
            # Pass through other arguments
            shift
            ;;
    esac
done

# Check title for emojis
if [ -n "$TITLE" ]; then
    if echo "$TITLE" | grep -P '[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{FE00}-\x{FE0F}\x{1F000}-\x{1F02F}\x{1F0A0}-\x{1F0FF}\x{1F100}-\x{1F64F}\x{1F680}-\x{1F6FF}]' > /dev/null 2>&1; then
        echo ""
        echo "=========================================="
        echo "ERROR: PR title contains emojis"
        echo "=========================================="
        echo ""
        echo "Title: $TITLE"
        echo ""
        HAS_ERROR=true
    fi
fi

# Check body for emojis
if [ -n "$BODY" ]; then
    if echo "$BODY" | grep -P '[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{FE00}-\x{FE0F}\x{1F000}-\x{1F02F}\x{1F0A0}-\x{1F0FF}\x{1F100}-\x{1F64F}\x{1F680}-\x{1F6FF}]' > /dev/null 2>&1; then
        echo ""
        echo "=========================================="
        echo "ERROR: PR body contains emojis"
        echo "=========================================="
        echo ""
        HAS_ERROR=true
    fi
fi

if [ "$HAS_ERROR" = true ]; then
    echo "This project does NOT allow emojis in:"
    echo "  - PR titles"
    echo "  - PR descriptions"
    echo "  - Commit messages"
    echo "  - Code comments"
    echo ""
    echo "Please remove all emojis and try again."
    echo ""
    echo "Examples:"
    echo "  Instead of: [emoji] Add feature"
    echo "  Use: feat: add new functionality"
    echo ""
    echo "  Instead of: [emoji] COMPLETED"
    echo "  Use: [x] COMPLETED or DONE"
    echo ""
    echo "See CLAUDE.md for complete emoji policy."
    echo "=========================================="
    echo ""
    exit 1
fi

# If validation passes, create PR with original arguments
exec gh pr create "$@"
