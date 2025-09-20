#!/bin/bash
# Fix Playwright tests by rebuilding with proper environment

echo "============================================"
echo "Fixing Playwright Tests"
echo "============================================"
echo ""

# Step 1: Ensure .env.test exists
echo "Step 1: Creating test environment file..."
cat > .env.test << EOF
# Test environment for Playwright
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
NODE_ENV=test
EOF

# Step 2: Clean old build
echo ""
echo "Step 2: Cleaning old build..."
rm -rf .next

# Step 3: Build with test environment
echo ""
echo "Step 3: Building with test environment..."
NODE_ENV=test npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Build failed!"
    exit 1
fi

# Step 4: Run Playwright tests
echo ""
echo "Step 4: Running Playwright tests..."
NODE_ENV=test npx playwright test

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "SUCCESS! All tests passed!"
    echo "========================================"
else
    echo ""
    echo "Some tests failed. Check the report:"
    echo "npx playwright show-report"
fi
