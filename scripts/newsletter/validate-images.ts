/**
 * Validates every URL in the image catalog with a 1-byte ranged GET and
 * exits non-zero on any response that isn't 200/206. Run via
 * `npm run validate:images` or `npx tsx scripts/newsletter/validate-images.ts`.
 *
 * Why ranged GET, not HEAD: Wikimedia rate-limits HEAD aggressively
 * (returns 429) but accepts ranged GET fine. Single canonical method
 * across all hosts, with a Wikimedia-policy-compliant User-Agent and a
 * polite inter-request delay so small public servers don't throttle us.
 */

import { IMAGES, type ImageEntry } from './images';

const CONCURRENCY = 1;
const TIMEOUT_MS = 15_000;
const DELAY_BETWEEN_REQUESTS_MS = 1000;
// Wikimedia policy requires a descriptive UA with contact info.
// https://meta.wikimedia.org/wiki/User-Agent_policy
const USER_AGENT = '16bitweather-newsletter-image-validator/1.0 (https://16bitweather.co; contact: justinelrod111@gmail.com)';

interface CheckResult {
  entry: ImageEntry;
  ok: boolean;
  status: number | string;
  via: 'HEAD' | 'GET' | 'error';
}

async function checkOne(entry: ImageEntry): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = { 'User-Agent': USER_AGENT };
  try {
    // Wikimedia rate-limits HEAD aggressively but accepts ranged GET.
    // Use ranged GET as the canonical check across all hosts.
    const res = await fetch(entry.url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: { ...headers, Range: 'bytes=0-0' },
    });
    return {
      entry,
      ok: res.ok || res.status === 206,
      status: res.status,
      via: 'GET',
    };
  } catch (err) {
    return { entry, ok: false, status: (err as Error).message, via: 'error' };
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPool<T, R>(items: T[], worker: (item: T) => Promise<R>, concurrency: number): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i]);
      if (cursor < items.length) await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main(): Promise<void> {
  console.log(`[validate-images] checking ${IMAGES.length} URLs across ${CONCURRENCY} workers`);
  const results = await runPool(IMAGES, checkOne, CONCURRENCY);
  const failures = results.filter((r) => !r.ok);
  for (const r of results) {
    const tag = r.ok ? 'OK ' : 'FAIL';
    console.log(`${tag} ${r.via.padEnd(5)} ${String(r.status).padEnd(7)} ${r.entry.id}`);
    if (!r.ok) console.log(`     ${r.entry.url}`);
  }
  console.log(`[validate-images] ${results.length - failures.length}/${results.length} passed`);
  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[validate-images] unexpected error:', err);
  process.exit(1);
});
