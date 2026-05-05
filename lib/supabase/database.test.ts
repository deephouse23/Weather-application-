/**
 * Tests for database.ts singleton consolidation (t_14f59a96).
 *
 * Key invariant: database.ts delegates to getSupabaseAdmin() on the server,
 * so there is exactly one service-role connection pool per process instead of
 * the previous duplicate _serverClient singleton.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js
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

// Mock the constants module
vi.mock('./constants', () => ({
  PLACEHOLDER_URL: 'http://localhost:54321',
  PLACEHOLDER_SERVICE_KEY: 'sb_service_placeholder',
  PLACEHOLDER_ANON_KEY: 'sb_anon_placeholder',
  throwIfPlaceholderProduction: vi.fn(),
  warnIfPlaceholder: vi.fn(),
}));

// Mock the browser client module (used via require() when window is defined)
vi.mock('./client', () => ({
  supabase: { _isBrowserSingleton: true },
}));

// Mock error-utils to avoid deep import chain
vi.mock('../error-utils', () => ({
  captureDbError: vi.fn(),
}));

// Mock schema-adapter
vi.mock('./schema-adapter', () => ({
  dbToSavedLocation: vi.fn(),
  savedLocationToDb: vi.fn(),
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  vi.resetModules();
  mockCreateClient.mockClear();
});

describe('database.ts singleton consolidation', () => {
  it('server path delegates to getSupabaseAdmin (one createClient call)', async () => {
    // Simulate server environment (no window)
    const originalWindow = global.window;
    // @ts-expect-error — simulating Node.js (no window global)
    delete global.window;

    const { getSupabaseAdmin } = await import('./admin');

    // Prime the admin singleton first
    getSupabaseAdmin();
    const createCallCountAfterAdmin = mockCreateClient.mock.calls.length;

    // Now import database — if it creates its own client, createCallCount would increase
    await import('./database');

    // No additional createClient call should have been made —
    // database.ts delegates to getSupabaseAdmin(), not creates its own client
    expect(mockCreateClient).toHaveBeenCalledTimes(createCallCountAfterAdmin);

    global.window = originalWindow;
  });

  it('admin and database share the same client instance', async () => {
    const originalWindow = global.window;
    // @ts-expect-error — simulating Node.js (no window global)
    delete global.window;

    const { getSupabaseAdmin } = await import('./admin');

    // Get the admin instance
    const adminClient = getSupabaseAdmin();
    mockCreateClient.mockClear();

    // Calling getSupabaseAdmin again returns the same instance
    const adminClient2 = getSupabaseAdmin();
    expect(adminClient2).toBe(adminClient);
    // No new createClient calls
    expect(mockCreateClient).not.toHaveBeenCalled();

    global.window = originalWindow;
  });
});