/**
 * E2E spec for /aviation.
 *
 * Stubs the upstream NOAA endpoints so the test runs deterministically and
 * doesn't depend on aviationweather.gov uptime. Verifies:
 *   - Page loads with header + alerts feed
 *   - Demo data badge appears for the mock flight provider
 *   - Turbulence map mounts (OL canvas present)
 *   - Theme switching cascades to aviation surface
 */

import { test, expect } from './fixtures';
import { setTheme } from '../fixtures/utils';

const SAMPLE_ALERTS = {
  alerts: [
    {
      id: 'sigmet-1',
      type: 'SIGMET',
      severity: 'severe',
      hazard: 'TURB',
      region: 'CONUS-CENTRAL',
      validFrom: '2026-05-07T12:00:00Z',
      validTo: '2026-05-07T18:00:00Z',
      text: 'Severe turbulence FL280-FL400 over central plains.',
    },
    {
      id: 'airmet-1',
      type: 'AIRMET',
      severity: 'moderate',
      hazard: 'TURB',
      region: 'CONUS-WEST',
      validFrom: '2026-05-07T10:00:00Z',
      validTo: '2026-05-07T16:00:00Z',
      text: 'Moderate turbulence below FL180.',
    },
  ],
};

const SAMPLE_PIREPS = {
  success: true,
  data: {
    pireps: [
      {
        id: 'pirep-1',
        receiptTime: '2026-05-07T14:30:00Z',
        observationTime: '2026-05-07T14:25:00Z',
        aircraftRef: 'B738',
        latitude: 40.0,
        longitude: -100.0,
        altitudeFt: 35000,
        turbulenceType: 'CAT',
        turbulenceIntensity: 'MOD',
        turbulenceBaseFt: 33000,
        turbulenceTopFt: 37000,
        icingType: null,
        icingIntensity: null,
        icingBaseFt: null,
        icingTopFt: null,
        tempC: -50,
        windDir: 270,
        windSpeedKt: 80,
        reportType: 'PIREP',
        rawText: 'B738 /OV BOI /TM 1425 /FL350 /TP B738 /TB MOD CAT',
      },
    ],
    fetchedAt: '2026-05-07T14:30:00Z',
  },
};

const SAMPLE_TURBULENCE = {
  success: true,
  data: {
    polygons: [
      {
        id: 'gairmet-0-0',
        coordinates: [[
          [-110, 35],
          [-95, 35],
          [-95, 45],
          [-110, 45],
          [-110, 35],
        ]],
        severity: 'moderate',
        rawSeverity: 'MOD',
        hazard: 'TURB',
        forecastHour: 0,
        validFrom: '2026-05-07T12:00:00Z',
        validTo: '2026-05-07T15:00:00Z',
        topFt: 35000,
        baseFt: 18000,
      },
    ],
    fetchedAt: '2026-05-07T14:30:00Z',
    source: 'NOAA AWC G-AIRMET',
    coverage: 'CONUS+AK+HI',
  },
};

test.describe('/aviation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/aviation/alerts**', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(SAMPLE_ALERTS) }),
    );
    await page.route('**/api/aviation/pireps**', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(SAMPLE_PIREPS) }),
    );
    await page.route('**/api/aviation/turbulence**', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(SAMPLE_TURBULENCE) }),
    );
  });

  test('renders header and alerts statistics', async ({ page }) => {
    await page.goto('/aviation', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /AVIATION WEATHER/i })).toBeVisible();
    // Status grid shows the SIGMET count
    await expect(page.getByText(/SIGMETs/i).first()).toBeVisible();
    await expect(page.getByText(/AIRMETs/i).first()).toBeVisible();
  });

  test('flight lookup surfaces Demo data badge for mock provider', async ({ page }) => {
    await page.goto('/aviation', { waitUntil: 'domcontentloaded' });

    // Open the route lookup section
    await page.getByRole('button', { name: /Flight Route Lookup/i }).click();

    const flightInput = page.getByTestId('flight-number-input');
    await expect(flightInput).toBeVisible({ timeout: 10000 });

    await flightInput.fill('AA123');
    await page.getByTestId('flight-search-button').click();

    // The badge is part of the flight info display once a result loads.
    // We rely on the *real* flight-lookup route handler running locally —
    // without env keys, it returns the mock provider with mock:true.
    await expect(page.getByText(/Demo data/i)).toBeVisible({ timeout: 10000 });
  });

  test('turbulence map mounts with OpenLayers viewport', async ({ page }) => {
    await page.goto('/aviation', { waitUntil: 'domcontentloaded' });
    // Map section is expanded by default
    const mapRegion = page.getByRole('region', {
      name: /Turbulence pilot reports map/i,
    });
    await expect(mapRegion).toBeVisible({ timeout: 15000 });
    // OpenLayers always renders an .ol-viewport canvas wrapper
    await expect(mapRegion.locator('.ol-viewport')).toBeVisible({ timeout: 15000 });
  });

  test('theme tokens cascade to aviation surface', async ({ page }) => {
    await page.goto('/aviation', { waitUntil: 'domcontentloaded' });
    await setTheme(page, 'nord');

    // Theme attribute reaches the document
    const dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('nord');

    // The severity token is defined and resolves to a non-empty value
    const severityValue = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--severity-extreme')
        .trim();
    });
    expect(severityValue.length).toBeGreaterThan(0);
  });
});
