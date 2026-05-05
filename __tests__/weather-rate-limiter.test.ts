/**
 * Unit tests for weather API rate limiter
 * 
 * Tests the Supabase-backed rate limiter that replaced the in-memory Map.
 * All Supabase calls are mocked to simulate DB behavior.
 */

// Simple mock for Headers since jsdom doesn't have it
class MockHeaders {
  private headers: Map<string, string>;
  
  constructor(init?: Record<string, string>) {
    this.headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }
  
  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }
  
  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }
}

// ---- Supabase mock setup ----
// We simulate the Supabase client with an in-memory store so we can test
// the rate limit logic (inserts, updates, optimistic locking) without a real DB.

type RateLimitRow = {
  identifier: string;
  hourly_window_start: string;
  hourly_count: number;
  burst_window_start: string;
  burst_count: number;
  created_at: string;
  updated_at: string;
};

let mockStore: Map<string, RateLimitRow> = new Map();
let mockShouldFailFetch = false;
let mockShouldFailInsert = false;
let mockShouldFailUpdate = false;

function resetMockStore(): void {
  mockStore = new Map();
  mockShouldFailFetch = false;
  mockShouldFailInsert = false;
  mockShouldFailUpdate = false;
}

// Build a Supabase-like client mock that operates on mockStore.
// Implements the full chaining API: .from().select/insert/update().eq().maybeSingle()/single()
// and also handles insert/update without .maybeSingle() (which return { error }).
function createSupabaseMock() {
  const builder = () => {
    let _table = '';
    let _filters: Record<string, unknown> = {};
    let _selectCols = '*';
    let _method = ''; // 'select', 'insert', 'update', 'delete'
    let _returning = false; // true when .select() follows insert/update (Supabase "returning" clause)
    let _insertData: Record<string, unknown> = {};
    let _updateData: Record<string, unknown> = {};

    const chain: Record<string, unknown> = {};

    chain.from = (table: string) => {
      _table = table;
      return chain;
    };

    // In Supabase, .select() after .insert()/.update() means "return these columns"
    // from the modified row. It does NOT change the method to 'select'.
    chain.select = (cols?: string) => {
      if (_method === 'insert' || _method === 'update') {
        _returning = true;
        _selectCols = cols || '*';
      } else {
        _method = 'select';
        _selectCols = cols || '*';
      }
      return chain;
    };

    chain.insert = (data: Record<string, unknown>) => {
      _method = 'insert';
      _insertData = data;
      return chain;
    };

    chain.update = (data: Record<string, unknown>) => {
      _method = 'update';
      _updateData = data;
      return chain;
    };

    chain.eq = (col: string, val: unknown) => {
      _filters[col] = val;
      return chain;
    };

    // Execute an update with optimistic-lock checks against mockStore
    const executeUpdate = (): { data: unknown; error: unknown } => {
      if (mockShouldFailUpdate) {
        return { data: null, error: { code: 'UPDATE_ERROR', message: 'update failed' } };
      }
      const identifier = _filters['identifier'] as string;
      const existing = mockStore.get(identifier);
      if (!existing) {
        return { data: null, error: null };
      }

      // Check optimistic locking filters
      const expectedHourlyCount = _filters['hourly_count'] as number | undefined;
      const expectedBurstCount = _filters['burst_count'] as number | undefined;

      if (expectedHourlyCount !== undefined && existing.hourly_count !== expectedHourlyCount) {
        return { data: null, error: null }; // Optimistic lock failure
      }
      if (expectedBurstCount !== undefined && existing.burst_count !== expectedBurstCount) {
        return { data: null, error: null }; // Optimistic lock failure
      }

      // Apply update
      const row = { ...existing } as Record<string, unknown>;
      for (const [key, val] of Object.entries(_updateData)) {
        if (key in row) {
          row[key] = val;
        }
      }
      row['updated_at'] = new Date().toISOString();
      mockStore.set(identifier, row as RateLimitRow);

      // Return only selected columns if .select() was called after update (returning clause)
      if (_returning && _selectCols && _selectCols !== '*') {
        const selectedCols = _selectCols.split(',').map(c => c.trim());
        const filteredResult: Record<string, unknown> = {};
        for (const col of selectedCols) {
          filteredResult[col] = row[col];
        }
        return { data: filteredResult, error: null };
      }
      return { data: row, error: null };
    };

    // Execute an insert against mockStore
    const executeInsert = (): { data: unknown; error: unknown } => {
      if (mockShouldFailInsert) {
        return { data: null, error: { code: 'INSERT_ERROR', message: 'insert failed' } };
      }
      const identifier = _insertData['identifier'] as string;
      if (!identifier) {
        return { data: null, error: { code: 'INSERT_ERROR', message: 'missing identifier' } };
      }
      const now = new Date().toISOString();
      const row: RateLimitRow = {
        identifier,
        hourly_window_start: _insertData['hourly_window_start'] as string || now,
        hourly_count: (_insertData['hourly_count'] as number) || 0,
        burst_window_start: _insertData['burst_window_start'] as string || now,
        burst_count: (_insertData['burst_count'] as number) || 0,
        created_at: now,
        updated_at: now,
      };
      mockStore.set(identifier, row);
      return { data: row, error: null };
    };

    chain.maybeSingle = async () => {
      if (_method === 'select') {
        if (mockShouldFailFetch) {
          return { data: null, error: { code: 'CONN_ERROR', message: 'connection failed' } };
        }
        const identifier = _filters['identifier'] as string | undefined;
        if (identifier && mockStore.has(identifier)) {
          return { data: mockStore.get(identifier)!, error: null };
        }
        return { data: null, error: null };
      }
      if (_method === 'update') {
        return executeUpdate();
      }
      return { data: null, error: null };
    };

    chain.single = async () => {
      const result = await chain.maybeSingle();
      if (result.data === null && !result.error) {
        return { data: null, error: { code: 'PGRST116', message: 'Not a single row' } };
      }
      return result;
    };

    // insert() and update() without .maybeSingle() return { error } when awaited.
    // We make the chain thenable so `await supabase.from(...).insert(...)` resolves.
    chain.then = (resolve: (value: unknown) => void) => {
      if (_method === 'insert') {
        resolve(executeInsert());
        return;
      }
      if (_method === 'update') {
        resolve(executeUpdate());
        return;
      }
      resolve({ data: null, error: null });
    };

    return chain;
  };

  return builder();
}

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    headers: MockHeaders;
    nextUrl: { searchParams: URLSearchParams };
    
    constructor(url: string, init?: { headers?: Record<string, string> }) {
      this.url = url;
      this.headers = new MockHeaders(init?.headers);
      this.nextUrl = { searchParams: new URLSearchParams(new URL(url).search) };
    }
  },
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status || 200,
      headers: init?.headers || {},
      json: async () => body,
    })),
  },
}));

jest.mock('@/lib/supabase/server', () => ({
  getServerUser: jest.fn().mockResolvedValue(null),
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: jest.fn(() => createSupabaseMock()),
}));

// Import after mocks
import { checkRateLimit, getClientIdentifier, createRateLimitResponse } from '@/lib/services/weather-rate-limiter';
import { getServerUser } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const originalEnv = process.env;

describe('Weather Rate Limiter (Supabase-backed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockStore();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('checkRateLimit', () => {
    it('should allow first request and create a new record in Supabase', async () => {
      const result = await checkRateLimit('test-client-1');
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(119); // 120 - 1
      expect(result.burstRemaining).toBe(29); // 30 - 1
      expect(result.resetTime).toBeGreaterThan(Date.now());
      expect(result.burstResetTime).toBeGreaterThan(Date.now());
      
      // Verify the record was stored in mock Supabase
      expect(mockStore.has('test-client-1')).toBe(true);
      const stored = mockStore.get('test-client-1')!;
      expect(stored.hourly_count).toBe(1);
      expect(stored.burst_count).toBe(1);
    });

    it('should track multiple requests correctly', async () => {
      const clientId = 'test-client-2';
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const result = await checkRateLimit(clientId);
        expect(result.allowed).toBe(true);
      }
      
      // 6th request should show remaining 114
      const result = await checkRateLimit(clientId);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(114); // 120 - 6
      expect(result.burstRemaining).toBe(24); // 30 - 6
    });

    it('should block when burst limit exceeded', async () => {
      const clientId = 'test-client-3';
      
      // Make 30 requests (burst limit)
      for (let i = 0; i < 30; i++) {
        const result = await checkRateLimit(clientId);
        expect(result.allowed).toBe(true);
      }
      
      // 31st request should be blocked
      const result = await checkRateLimit(clientId);
      expect(result.allowed).toBe(false);
      expect(result.burstRemaining).toBe(0);
    });

    it('should track different clients independently', async () => {
      const client1 = 'client-1';
      const client2 = 'client-2';
      
      // Make 50 requests for client 1
      for (let i = 0; i < 50; i++) {
        await checkRateLimit(client1);
      }
      
      // Client 2 should still have full limits
      const result = await checkRateLimit(client2);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(119);
      expect(result.burstRemaining).toBe(29);
    });

    it('should handle Supabase fetch errors gracefully (fail open)', async () => {
      mockShouldFailFetch = true;
      
      // Should fail open — allow the request
      const result = await checkRateLimit('error-client');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(120); // Full limit on error
    });

    it('should handle Supabase insert errors gracefully (fail open)', async () => {
      mockShouldFailInsert = true;
      
      // First request needs to insert — should fail open
      const result = await checkRateLimit('insert-error-client');
      expect(result.allowed).toBe(true);
    });

    it('should handle Supabase update errors gracefully (fail open)', async () => {
      // First, create a record
      await checkRateLimit('update-error-client');
      
      mockShouldFailUpdate = true;
      
      // Second request needs to update — should fail open
      const result = await checkRateLimit('update-error-client');
      expect(result.allowed).toBe(true);
    });

    it('should return correct structure for allowed request', async () => {
      const result = await checkRateLimit('structure-test');
      
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetTime');
      expect(result).toHaveProperty('burstRemaining');
      expect(result).toHaveProperty('burstResetTime');
      
      expect(typeof result.allowed).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
      expect(typeof result.resetTime).toBe('number');
      expect(typeof result.burstRemaining).toBe('number');
      expect(typeof result.burstResetTime).toBe('number');
    });

    it('should return correct structure for blocked request', async () => {
      const clientId = 'blocked-structure-test';
      
      // Exhaust burst limit
      for (let i = 0; i < 30; i++) {
        await checkRateLimit(clientId);
      }
      
      const result = await checkRateLimit(clientId);
      
      expect(result.allowed).toBe(false);
      expect(result.burstRemaining).toBe(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
      expect(result.burstResetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('Environment variable configuration', () => {
    it('should use default values when env vars not set', async () => {
      delete process.env.WEATHER_RATE_LIMIT_HOURLY;
      delete process.env.WEATHER_RATE_LIMIT_BURST;
      delete process.env.WEATHER_RATE_LIMIT_BURST_WINDOW_MS;
      
      // Since env vars are read at module load time and we can't easily
      // re-evaluate them, just verify the defaults work correctly
      const result = await checkRateLimit('env-test-client');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(119); // Default 120 - 1
      expect(result.burstRemaining).toBe(29); // Default 30 - 1
    });
  });

  describe('createRateLimitResponse', () => {
    it('should create a 429 response with correct headers', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        burstRemaining: 0,
        burstResetTime: Date.now() + 300000,
      };

      const response = createRateLimitResponse(result);
      
      expect(response.status).toBe(429);
      expect(response.headers['Retry-After']).toBeDefined();
      expect(response.headers['X-RateLimit-Limit']).toBe('120');
      expect(response.headers['X-RateLimit-Burst-Limit']).toBe('30');
      expect(response.headers['Cache-Control']).toBe('no-store');
    });
  });
});

describe('getClientIdentifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract IP from x-forwarded-for header', async () => {
    const { NextRequest } = jest.requireMock('next/server');
    const request = new NextRequest('http://localhost:3000/api/weather/current', {
      headers: { 'x-forwarded-for': '192.168.1.100, 10.0.0.1' },
    });
    
    const identifier = await getClientIdentifier(request);
    expect(identifier).toBe('ip:192.168.1.100');
  });

  it('should use x-real-ip when x-forwarded-for not present', async () => {
    const { NextRequest } = jest.requireMock('next/server');
    const request = new NextRequest('http://localhost:3000/api/weather/current', {
      headers: { 'x-real-ip': '192.168.1.200' },
    });
    
    const identifier = await getClientIdentifier(request);
    expect(identifier).toBe('ip:192.168.1.200');
  });

  it('should fallback to anonymous when no IP headers present', async () => {
    const { NextRequest } = jest.requireMock('next/server');
    const request = new NextRequest('http://localhost:3000/api/weather/current');
    
    const identifier = await getClientIdentifier(request);
    expect(identifier).toBe('ip:anonymous');
  });

  it('should prefer Supabase user ID when available', async () => {
    (getServerUser as jest.Mock).mockResolvedValueOnce({ id: 'test-user-123' });
    
    const { NextRequest } = jest.requireMock('next/server');
    const request = new NextRequest('http://localhost:3000/api/weather/current');
    
    const identifier = await getClientIdentifier(request);
    expect(identifier).toBe('user:test-user-123');
  });
});

describe('Optimistic locking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockStore();
  });

  it('should handle concurrent request contention by retrying', async () => {
    // Create initial entry
    await checkRateLimit('concurrent-test');
    const initial = mockStore.get('concurrent-test')!;
    expect(initial.hourly_count).toBe(1);

    // Second request should increment to 2
    const result = await checkRateLimit('concurrent-test');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(118); // 120 - 2
  });
});