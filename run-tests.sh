#!/bin/bash

# Script to run Playwright tests with proper environment setup

echo "🧪 Running Playwright tests with test environment..."

# Export test environment
export NODE_ENV=test

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "⚠️  .env.test file not found. Creating from template..."
    cat > .env.test << EOF
# Test environment variables for Playwright tests
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
NODE_ENV=test
EOF
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Playwright browsers if needed
echo "🌐 Ensuring Playwright browsers are installed..."
npx playwright install --with-deps chromium

# Build the application
echo "🔨 Building the application..."
npm run build

# Run the tests
echo "🚀 Starting Playwright tests..."
npx playwright test

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Check the report: npx playwright show-report"
fi
