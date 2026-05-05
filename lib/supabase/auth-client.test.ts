/**
 * Tests for Supabase auth-client singleton pattern.
 *
 * Key invariants:
 * 1. getAnonClient() returns the same instance on repeated calls (singleton).
 * 2. verifyBearerToken delegates to the singleton, not creating a new client.
 * 3. getAuthScopedClient intentionally creates a fresh client per call (request-scoped JWT).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockCreateClient = vi.fn(() => ({
  auth: { getUser: mockGetUser },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
  SupabaseClient: class {},
}));

vi.mock('./constants', () => ({
  PLACEHOLDER_URL: 'http://localhost:54321',
  PLACEHOLDER_ANON_KEY: 'sb_anon_placeholder',
  throwIfPlaceholderProduction: vi.fn(),
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  vi.resetModules();
  mockCreateClient.mockClear();
  mockGetUser.mockClear();
});

describe('getAnonClient', () => {
  it('returns the same instance on repeated calls (singleton)', async () => {
    const { getAnonClient } = await import('./auth-client');
    const a = getAnonClient();
    const b = getAnonClient();
    expect(a).toBe(b);
  });

  it('only calls createClient once for the anon singleton', async () => {
    const { getAnonClient } = await import('./auth-client');
    getAnonClient();
    getAnonClient();
    // One call for the anon singleton
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
  });

  it('throws if NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { getAnonClient } = await import('./auth-client');
    expect(() => getAnonClient()).toThrow('NEXT_PUBLIC_SUPABASE_URL');
  });

  it('throws if NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { getAnonClient } = await import('./auth-client');
    expect(() => getAnonClient()).toThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  });
});

describe('verifyBearerToken', () => {
  it('uses the singleton anon client, not creating a new one', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const { verifyBearerToken, getAnonClient } = await import('./auth-client');
    // Prime the singleton first
    const client = getAnonClient();
    mockCreateClient.mockClear(); // clear count after singleton init

    await verifyBearerToken('some-token');

    // verifyBearerToken should not have triggered another createClient
    expect(mockCreateClient).not.toHaveBeenCalled();
    // It should have called getUser on the singleton
    expect(mockGetUser).toHaveBeenCalledWith('some-token');
  });

  it('returns null on auth error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    const { verifyBearerToken } = await import('./auth-client');
    const result = await verifyBearerToken('bad-token');
    expect(result).toBeNull();
  });
});

describe('getAuthScopedClient', () => {
  it('creates a new client per call (intentional, request-scoped JWT)', async () => {
    const { getAuthScopedClient } = await import('./auth-client');
    const a = getAuthScopedClient('Bearer token-1');
    const b = getAuthScopedClient('Bearer token-2');
    expect(a).not.toBe(b);
  });
});