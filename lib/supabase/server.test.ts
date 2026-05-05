/**
 * Tests for lib/supabase/server.ts
 *
 * Key invariants:
 * 1. createServerSupabaseClient() calls throwIfPlaceholderProduction to guard
 *    against placeholder credentials in production.
 * 2. getServerUser() returns null on auth errors (documenting existing behavior).
 * 3. getServerUser() returns user on successful auth.
 *
 * Task: t_c5843c02 — MEDIUM: Server Supabase silently uses placeholder credentials on misconfiguration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers before importing the module
const mockGetAll = vi.fn(() => []);
const mockSet = vi.fn();
const mockCookieStore = {
  getAll: mockGetAll,
  set: mockSet,
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock @supabase/ssr
const mockServerClient = {
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockServerClient),
}));

// Mock constants — capture calls to throwIfPlaceholderProduction
const mockThrowIfPlaceholderProduction = vi.fn();
vi.mock('./constants', () => ({
  PLACEHOLDER_URL: 'http://localhost:54321',
  PLACEHOLDER_ANON_KEY: 'sb_publishable_placeholder_development_key_not_real',
  throwIfPlaceholderProduction: mockThrowIfPlaceholderProduction,
}));

// Set required env vars before import
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real';
  vi.resetModules();
  mockThrowIfPlaceholderProduction.mockClear();
  mockServerClient.auth.getUser.mockClear();
});

describe('createServerSupabaseClient', () => {
  it('calls throwIfPlaceholderProduction with derived credentials', async () => {
    const { createServerSupabaseClient } = await import('./server');
    await createServerSupabaseClient();

    expect(mockThrowIfPlaceholderProduction).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real',
      'createServerSupabaseClient'
    );
  });

  it('calls throwIfPlaceholderProduction even when using placeholder fallbacks', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { createServerSupabaseClient } = await import('./server');
    await createServerSupabaseClient();

    // Should have been called with the placeholder values
    expect(mockThrowIfPlaceholderProduction).toHaveBeenCalledWith(
      'http://localhost:54321',
      'sb_publishable_placeholder_development_key_not_real',
      'createServerSupabaseClient'
    );
  });
});

describe('getServerUser', () => {
  it('returns user on successful auth', async () => {
    const fakeUser = { id: 'user-123', email: 'test@example.com' };
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: fakeUser },
      error: null,
    });

    const { getServerUser } = await import('./server');
    const result = await getServerUser();

    expect(result).toEqual(fakeUser);
  });

  it('returns null on auth error', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    const { getServerUser } = await import('./server');
    const result = await getServerUser();

    expect(result).toBeNull();
  });

  it('returns null when user is null without error', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { getServerUser } = await import('./server');
    const result = await getServerUser();

    expect(result).toBeNull();
  });

  it('calls createServerSupabaseClient internally which guards against placeholder creds', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const { getServerUser } = await import('./server');
    await getServerUser();

    // By calling getServerUser, createServerSupabaseClient is invoked,
    // which must call throwIfPlaceholderProduction
    expect(mockThrowIfPlaceholderProduction).toHaveBeenCalled();
  });
});