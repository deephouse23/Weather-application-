@echo off
REM Fix Playwright tests by rebuilding with proper environment

echo ============================================
echo Fixing Playwright Tests
echo ============================================
echo.

REM Step 1: Ensure .env.test exists
echo Step 1: Creating test environment file...
(
echo # Test environment for Playwright
echo NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
echo NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
echo NODE_ENV=test
) > .env.test

REM Step 2: Clean old build
echo.
echo Step 2: Cleaning old build...
rmdir /s /q .next 2>nul

REM Step 3: Build with test environment
echo.
echo Step 3: Building with test environment...
set NODE_ENV=test
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

REM Step 4: Run Playwright tests
echo.
echo Step 4: Running Playwright tests...
set NODE_ENV=test
call npx playwright test

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! All tests passed!
    echo ========================================
) else (
    echo.
    echo Some tests failed. Check the report:
    echo npx playwright show-report
)

pause
