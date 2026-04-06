/**
 * @jest-environment node
 */

/**
 * Test for Sentry fix: JAVASCRIPT-NEXTJS-K
 * updateProfile must guard against nil UUID to avoid database errors
 */

// Mock Supabase client to detect if a DB call is made
const mockUpdate = jest.fn().mockReturnThis();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      update: mockUpdate,
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'No rows found' } }),
    }),
  }),
}));

import { updateProfile } from '@/lib/supabase/database';

describe('updateProfile nil UUID guard (JAVASCRIPT-NEXTJS-K)', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it('should not hit database for nil UUID', async () => {
    const NULL_UUID = '00000000-0000-0000-0000-000000000000';

    const result = await updateProfile(NULL_UUID, { username: 'failtest' });
    // Returns a mock profile (not null) so the profile page treats it as success
    expect(result).toBeTruthy();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
