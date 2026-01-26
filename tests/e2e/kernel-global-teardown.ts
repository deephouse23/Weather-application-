/**
 * Playwright Global Teardown - Kernel Browser Cleanup
 *
 * Destroys the Kernel cloud browser after all tests complete (CI only).
 */
import Kernel from '@onkernel/sdk';
import * as fs from 'fs';
import * as path from 'path';
import type { KernelBrowserState } from './kernel-global-setup';
import { closeSharedBrowser } from './fixtures';

const KERNEL_STATE_FILE = path.join(__dirname, '.kernel-browser-state.json');

async function globalTeardown() {
  // Close shared CDP connection first
  try {
    await closeSharedBrowser();
  } catch {
    // Ignore cleanup errors
  }

  if (!fs.existsSync(KERNEL_STATE_FILE)) {
    return;
  }

  const apiKey = process.env.KERNEL_API_KEY;
  if (!apiKey) {
    fs.unlinkSync(KERNEL_STATE_FILE);
    return;
  }

  console.log('\n\x1b[36m🧹 Cleaning up Kernel browser...\x1b[0m');

  try {
    const state: KernelBrowserState = JSON.parse(
      fs.readFileSync(KERNEL_STATE_FILE, 'utf-8')
    );

    const kernel = new Kernel({ apiKey });
    await kernel.browsers.deleteByID(state.sessionId);

    console.log(`\x1b[32m✓ Kernel browser deleted: ${state.sessionId}\x1b[0m`);
  } catch (error) {
    console.warn('\x1b[33m⚠ Failed to destroy Kernel browser:\x1b[0m', error);
  } finally {
    if (fs.existsSync(KERNEL_STATE_FILE)) {
      fs.unlinkSync(KERNEL_STATE_FILE);
    }
  }
}

export default globalTeardown;
