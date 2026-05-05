/**
 * Tests for Supabase admin singleton pattern (connection pool exhaustion fix).
 *
 * The key invariant: calling getSupabaseAdmin() multiple times must return
 * the exact same object reference — not a fresh SupabaseClient each time.
 *
 * Also covers the security fix (t_c5843c02): admin.ts uses
 * throwIfPlaceholderProduction instead of warnIfPlaceholder, so placeholder
 * credentials cause a hard throw in production instead of a silent warning.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js before importing the module under test
const mockCreateClient = vi.fn(() => ({
  auth: { getUser: vi.fn() },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
  SupabaseClient: class {},
}));

// Mock the constants module so throwIfPlaceholderProduction is a no-op in tests
vi.mock('./constants', () => ({
  PLACEHOLDER_URL: 'http://localhost:54321',
  PLACEHOLDER_SERVICE_KEY: 'sb_service_placeholder',
  throwIfPlaceholderProduction: vi.fn(),
}));

// Set required env vars before importing
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  // Reset the module registry so the singleton is re-created per test
  vi.resetModules();
});

describe('getSupabaseAdmin', () => {
  it('returns the same instance on repeated calls (singleton)', async () => {
    // Dynamic import so vi.resetModules is effective
    const { getSupabaseAdmin } = await import('./admin');
    const a = getSupabaseAdmin();
    const b = getSupabaseAdmin();
    expect(a).toBe(b); // same reference, not just deep-equal
  });

  it('only calls createClient once even with multiple getSupabaseAdmin calls', async () => {
    // Reset mock call count so we only count calls from this test
    mockCreateClient.mockClear();
    const { getSupabaseAdmin } = await import('./admin');
    getSupabaseAdmin();
    getSupabaseAdmin();
    getSupabaseAdmin();
    // Only the first call should have triggered createClient
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
  });

  it('throws if NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { getSupabaseAdmin } = await import('./admin');
    expect(() => getSupabaseAdmin()).toThrow('NEXT_PUBLIC_SUPABASE_URL');
  });

  it('throws if SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { getSupabaseAdmin } = await import('./admin');
    expect(() => getSupabaseAdmin()).toThrow('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('calls throwIfPlaceholderProduction to guard against placeholder creds in production', async () => {
    const { throwIfPlaceholderProduction } = await import('./constants');
    (throwIfPlaceholderProduction as ReturnType<typeof vi.fn>).mockClear();
    const { getSupabaseAdmin } = await import('./admin');
    getSupabaseAdmin();
    expect(throwIfPlaceholderProduction).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'service-role-key',
      'getSupabaseAdmin'
    );
  });
});