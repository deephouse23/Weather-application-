@echo off
REM Quick build test script for Windows

echo Testing build with toastService fix...
echo ===========================================

REM Clean previous build
echo Cleaning previous build...
rmdir /s /q .next 2>nul

REM Run the build
echo Starting build...
call npm run build

REM Check if build succeeded
if %ERRORLEVEL% EQU 0 (
    echo.
    echo BUILD SUCCESSFUL!
    echo The toastService import has been fixed.
    echo.
    echo Next steps:
    echo 1. Commit the changes: git add -A ^&^& git commit -m "Fix: Add missing toastService import"
    echo 2. Push to trigger Vercel build: git push
) else (
    echo.
    echo BUILD FAILED
    echo There may be other issues to fix.
)

pause
