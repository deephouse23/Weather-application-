#!/bin/bash
# Quick build test script

echo "🔨 Testing build with toastService fix..."
echo "==========================================="

# Clean previous build
echo "Cleaning previous build..."
rm -rf .next

# Run the build
echo "Starting build..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo "The toastService import has been fixed."
    echo ""
    echo "Next steps:"
    echo "1. Commit the changes: git add -A && git commit -m 'Fix: Add missing toastService import'"
    echo "2. Push to trigger Vercel build: git push"
else
    echo ""
    echo "❌ BUILD FAILED"
    echo "There may be other issues to fix."
fi
