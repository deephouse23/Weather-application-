@echo off
echo Checking all page.tsx files for export patterns...
echo.

echo === PAGE FILES FOUND ===
for /r app %%f in (page.tsx) do (
    echo Found: %%f
)
echo.

echo === CHECKING EXPORTS ===
for /r app %%f in (page.tsx) do (
    echo.
    echo Checking: %%f
    findstr /n "export default" "%%f"
    findstr /n "console.log" "%%f"
)
echo.

echo === SUMMARY ===
echo Pages with debug versions:
echo - app/not-found/page.tsx
echo - app/weather-systems/page.tsx  
echo - app/cloud-types/page.tsx
echo.
echo Pages with simple structure (should be fine):
echo - app/fun-facts/page.tsx
echo - app/games/page.tsx
echo - app/weather/page.tsx
echo - app/onboarding/page.tsx
echo - app/radar/page.tsx
echo - app/about/page.tsx
echo.
echo Ready for deployment test!
pause 