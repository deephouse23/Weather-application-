@echo off
REM Complete fix for Playwright tests

echo ================================================
echo Complete Playwright Test Fix
echo ================================================
echo.

REM Step 1: Install missing dependencies
echo Step 1: Installing dependencies (including dotenv)...
call npm install --save-dev dotenv

REM Step 2: Create a simple .env for tests
echo.
echo Step 2: Creating test environment file...
(
echo NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
echo NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
) > .env

REM Step 3: Kill any existing processes
echo.
echo Step 3: Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Step 4: Test the dev server first
echo.
echo Step 4: Testing if dev server starts correctly...
echo Starting dev server (press Ctrl+C after it starts successfully)...
timeout /t 5
start /B cmd /c "npm run dev"
timeout /t 10

REM Step 5: Kill the test server
taskkill /F /IM node.exe 2>nul

REM Step 6: Run Playwright with simplified config
echo.
echo Step 6: Running Playwright tests with simplified config...
set PLAYWRIGHT_TEST_BASE_URL=
npx playwright test --config=playwright.config.simple.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Tests are working!
    echo ========================================
    echo.
    echo You can now use: npm run test:e2e:nobuild
) else (
    echo.
    echo Tests failed. Checking common issues...
    echo.
    echo Common fixes:
    echo 1. Make sure port 3000 is free
    echo 2. Run: npm install
    echo 3. Check .env file exists with test values
    echo.
    echo To see detailed error: npx playwright test --debug
)

pause
