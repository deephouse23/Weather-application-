/**
 * @jest-environment node
 */

/**
 * Test for Sentry fix: JAVASCRIPT-NEXTJS-K
 * updateProfile must guard against nil UUID to avoid database errors
 */

jest.mock('@/lib/supabase/database', () => {
  const actual = jest.requireActual('@/lib/supabase/database');
  return {
    ...actual,
  };
});

// Mock Supabase client to detect if a DB call is made
const mockUpdate = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'No rows found' } });

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    }),
  }),
}));

describe('updateProfile nil UUID guard (JAVASCRIPT-NEXTJS-K)', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it('should return null for nil UUID without hitting database', async () => {
    const { updateProfile } = require('@/lib/supabase/database');
    const NULL_UUID = '00000000-0000-0000-0000-000000000000';

    const result = await updateProfile(NULL_UUID, { username: 'failtest' });
    expect(result).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
