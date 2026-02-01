/**
 * Hybrid Playwright Test Fixtures
 *
 * LOCAL (pre-commit): Uses standard Playwright with local browsers
 * CI (Kernel): Connects to Kernel cloud browser via CDP
 *
 * Mode is determined by KERNEL_API_KEY environment variable.
 */

/* eslint-disable react-hooks/rules-of-hooks */
// Note: Playwright's use() function is not a React hook, but ESLint's
// react-hooks plugin incorrectly flags it. Safe to disable for test fixtures.

import { test as base, expect as baseExpect, chromium, type BrowserContext, type Page, type Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import type { KernelBrowserState } from './kernel-global-setup';

const KERNEL_STATE_FILE = path.join(__dirname, '.kernel-browser-state.json');
const useKernelBrowsers = !!process.env.KERNEL_API_KEY;

// Shared browser connection for Kernel mode
let sharedBrowser: Browser | null = null;
const MAX_CONNECTION_ATTEMPTS = 3;
const CONNECTION_RETRY_DELAY = 2000;

function getKernelState(): KernelBrowserState | null {
  if (fs.existsSync(KERNEL_STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(KERNEL_STATE_FILE, 'utf-8'));
    } catch (e) {
      console.error('[Kernel] Failed to parse state file:', e);
      return null;
    }
  }
  return null;
}

// Helper to connect with retry logic
async function connectToKernelBrowser(cdpUrl: string): Promise<Browser> {
  for (let attempt = 1; attempt <= MAX_CONNECTION_ATTEMPTS; attempt++) {
    try {
      console.log(`[Kernel] Connection attempt ${attempt}/${MAX_CONNECTION_ATTEMPTS}...`);

      const browser = await chromium.connectOverCDP(cdpUrl, {
        timeout: 45000, // 45 second timeout per attempt
      });

      // Verify connection is actually working
      const contexts = browser.contexts();
      console.log(`[Kernel] Connected! Active contexts: ${contexts.length}`);

      return browser;
    } catch (error) {
      console.error(`[Kernel] Connection attempt ${attempt} failed:`, error);

      if (attempt < MAX_CONNECTION_ATTEMPTS) {
        console.log(`[Kernel] Retrying in ${CONNECTION_RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, CONNECTION_RETRY_DELAY));
      } else {
        throw new Error(
          `Failed to connect to Kernel browser after ${MAX_CONNECTION_ATTEMPTS} attempts. ` +
          `CDP URL: ${cdpUrl.substring(0, 50)}... Error: ${error}`
        );
      }
    }
  }
  // TypeScript will see this as unreachable since the loop always returns or throws
  // But we need to satisfy the return type - this line is never actually executed
  throw new Error('Connection loop completed without returning');
}

// Export test based on mode
export const test = useKernelBrowsers
  ? base.extend<{ context: BrowserContext; page: Page }>({
      // Kernel mode: Connect via CDP
      context: async ({ baseURL }, use) => {
        const kernelState = getKernelState();

        if (!kernelState) {
          throw new Error(
            'Kernel browser state not found. Ensure globalSetup ran successfully.\n' +
            `  Expected file: ${KERNEL_STATE_FILE}\n` +
            '  Check that KERNEL_API_KEY is set and the Kernel browser was created.'
          );
        }

        if (!kernelState.cdpUrl) {
          throw new Error(
            'Kernel browser state is missing cdpUrl. The browser may not have been created properly.'
          );
        }

        // Connect to Kernel browser via CDP (reuse connection)
        if (!sharedBrowser || !sharedBrowser.isConnected()) {
          console.log('[Kernel] Connecting to cloud browser via CDP...');
          console.log(`[Kernel] Base URL: ${baseURL}`);
          sharedBrowser = await connectToKernelBrowser(kernelState.cdpUrl);
        }

        // Create new context for this test
        // Include Vercel bypass header if secret is set (for deployment protection)
        const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
        const context = await sharedBrowser.newContext({
          baseURL,
          extraHTTPHeaders: {
            'x-playwright-test-mode': 'true',
            ...(bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : {}),
          },
        });

        context.setDefaultTimeout(30000);
        context.setDefaultNavigationTimeout(30000);

        await use(context);

        // Clean up context
        try {
          await context.close();
        } catch (e) {
          console.warn('[Kernel] Context close error (non-fatal):', e);
        }
      },

      page: async ({ context }, use) => {
        const page = await context.newPage();
        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);
        await use(page);

        // Clean up page
        try {
          await page.close();
        } catch (e) {
          console.warn('[Kernel] Page close error (non-fatal):', e);
        }
      },
    })
  : base; // Local mode: Use standard Playwright fixtures

export const expect = baseExpect;

// Cleanup for global teardown
export async function closeSharedBrowser() {
  if (sharedBrowser) {
    try {
      await sharedBrowser.close();
    } catch {
      // Ignore cleanup errors
    }
    sharedBrowser = null;
  }
}
