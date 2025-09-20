@echo off
REM Script to run Playwright tests with proper environment setup

echo Running Playwright tests with test environment...

REM Set test environment
set NODE_ENV=test

REM Check if .env.test exists
if not exist .env.test (
    echo Warning: .env.test file not found. Creating from template...
    (
        echo # Test environment variables for Playwright tests
        echo NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
        echo NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
        echo NODE_ENV=test
    ) > .env.test
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Install dotenv if needed
npm list dotenv >nul 2>&1
if errorlevel 1 (
    echo Installing dotenv...
    npm install --save-dev dotenv
)

REM Install Playwright browsers if needed
echo Ensuring Playwright browsers are installed...
npx playwright install --with-deps chromium

REM Build the application
echo Building the application...
npm run build

REM Run the tests
echo Starting Playwright tests...
npx playwright test

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo All tests passed!
) else (
    echo Some tests failed. Check the report: npx playwright show-report
)
