@echo off
REM Manual test to isolate the issue

echo ================================================
echo Manual Playwright Test (Step by Step)
echo ================================================
echo.

REM Create minimal env file
echo Creating minimal .env file...
(
echo NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
echo NEXT_PUBLIC_OPENWEATHER_API_KEY=test-key
) > .env

echo.
echo ================================================
echo STEP 1: Start the dev server manually
echo ================================================
echo.
echo In a NEW terminal window, run:
echo   npm run dev
echo.
echo Wait for it to say "Ready" then come back here
echo.
pause

echo.
echo ================================================
echo STEP 2: Run a simple smoke test
echo ================================================
echo.

npx playwright test tests/smoke-test.spec.ts --headed

echo.
echo ================================================
echo Results:
echo ================================================
echo.

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! The app is working!
    echo.
    echo Now try the full test suite:
    echo   npx playwright test
) else (
    echo The test failed. Check the error messages above.
    echo.
    echo Common issues:
    echo - Is the dev server running? (npm run dev in another window)
    echo - Is port 3000 free?
    echo - Are all dependencies installed? (npm install)
)

pause
