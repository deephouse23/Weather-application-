@echo off
REM Simple Playwright test runner with environment setup

echo ============================================
echo Running Playwright Tests (Dev Mode)
echo ============================================
echo.

REM Kill any existing Node processes on port 3000
echo Cleaning up any existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Set environment variables for this session
echo Setting environment variables...
set NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
set NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
set NODE_ENV=development

REM Create .env file for dev server
echo Creating .env file...
(
echo NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-testing
echo NEXT_PUBLIC_OPENWEATHER_API_KEY=test-api-key
) > .env

REM Run Playwright tests (will start dev server automatically)
echo.
echo Starting Playwright tests (this will start the dev server)...
npx playwright test

REM Clean up
del .env 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! All tests passed!
    echo ========================================
) else (
    echo.
    echo Some tests failed. 
    echo To see the report: npx playwright show-report
)

pause
