import type { NextRequest } from 'next/server';

/**
 * Mirrors middleware.ts test-mode rules so API routes can align with middleware bypass.
 * Never true in production NODE_ENV unless CI/preview + explicit header/cookie (see middleware).
 */
export function isPlaywrightTestModeRequest(request: NextRequest): boolean {
  const testModeHeader = request.headers.get('x-playwright-test-mode');
  const testModeCookie = request.cookies.get('playwright-test-mode');
  const hasTestIndicator =
    testModeHeader === 'true' || testModeCookie?.value === 'true';
  const isExplicitTestEnv =
    process.env.PLAYWRIGHT_TEST_MODE === 'true';
  const isCIOrPreview =
    process.env.CI === 'true' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV === 'preview';
  const isNonProd = process.env.NODE_ENV !== 'production';
  return (isExplicitTestEnv && isNonProd) || (isCIOrPreview && hasTestIndicator && isNonProd);
}
