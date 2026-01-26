/**
 * Playwright Global Setup - Kernel Browser Lifecycle
 *
 * Creates a Kernel cloud browser before tests run (CI only).
 * Saves browser info to a temp file for fixtures to use.
 */
import Kernel from '@onkernel/sdk';
import * as fs from 'fs';
import * as path from 'path';

const KERNEL_STATE_FILE = path.join(__dirname, '.kernel-browser-state.json');

export interface KernelBrowserState {
  sessionId: string;
  cdpUrl: string;
}

async function globalSetup() {
  const apiKey = process.env.KERNEL_API_KEY;
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;

  // Log environment for debugging
  console.log('\x1b[36m📋 Playwright Global Setup\x1b[0m');
  console.log(`   KERNEL_API_KEY: ${apiKey ? '✓ set' : '✗ not set (using local browsers)'}`);
  console.log(`   PLAYWRIGHT_TEST_BASE_URL: ${baseUrl || 'not set (will use localhost)'}`);

  if (!apiKey) {
    // Local mode - no Kernel browser needed
    if (fs.existsSync(KERNEL_STATE_FILE)) {
      fs.unlinkSync(KERNEL_STATE_FILE);
    }
    console.log('\x1b[33m   Mode: Local browsers (install with: npx playwright install)\x1b[0m');
    return;
  }

  console.log('\x1b[36m🚀 Creating Kernel cloud browser...\x1b[0m');

  const kernel = new Kernel({ apiKey });

  try {
    const browser = await kernel.browsers.create();

    // Validate the response
    if (!browser || !browser.session_id || !browser.cdp_ws_url) {
      throw new Error(
        `Invalid response from Kernel API: ${JSON.stringify(browser)}`
      );
    }

    console.log(`\x1b[32m✓ Kernel browser created: ${browser.session_id}\x1b[0m`);

    const state: KernelBrowserState = {
      sessionId: browser.session_id,
      cdpUrl: browser.cdp_ws_url,
    };

    fs.writeFileSync(KERNEL_STATE_FILE, JSON.stringify(state, null, 2));

    // Log shortened CDP URL for debugging (don't expose full URL in logs)
    const cdpUrlShort = browser.cdp_ws_url.substring(0, 60) + '...';
    console.log(`\x1b[90m   CDP URL: ${cdpUrlShort}\x1b[0m`);
    console.log(`\x1b[90m   State file: ${KERNEL_STATE_FILE}\x1b[0m`);

    // Give the browser a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\x1b[32m✓ Kernel browser ready for tests\x1b[0m');
  } catch (error: unknown) {
    console.error('\x1b[31m❌ Failed to create Kernel browser:\x1b[0m');

    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);

      // Provide actionable guidance based on error type
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('   💡 Check that KERNEL_API_KEY is valid and not expired');
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        console.error('   💡 Network timeout - check your connection to Kernel servers');
      } else if (error.message.includes('rate limit')) {
        console.error('   💡 Rate limited - wait a moment and try again');
      }
    } else {
      console.error(`   Error: ${error}`);
    }

    throw error;
  }
}

export default globalSetup;
