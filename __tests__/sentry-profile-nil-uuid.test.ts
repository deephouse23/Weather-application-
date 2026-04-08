/**
 * @jest-environment node
 */

/**
 * Test for E2E fix: updateProfile with nil UUID should return a mock
 * profile for test sessions rather than null (which profile page treats
 * as a database error).
 */

const mockUpdate = jest.fn().mockReturnThis();
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      update: mockUpdate,
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'No rows' } }),
    }),
  }),
}));

import { updateProfile } from '@/lib/supabase/database';

describe('updateProfile nil UUID returns mock success (E2E compatibility)', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it('should return a mock profile object for nil UUID instead of null', async () => {
    const NULL_UUID = '00000000-0000-0000-0000-000000000000';

    const result = await updateProfile(NULL_UUID, { username: 'testuser' });

    // Should return a mock profile (truthy), not null
    expect(result).toBeTruthy();
    expect(result!.id).toBe(NULL_UUID);
    expect(result!.username).toBe('testuser');
    // Must not hit the database
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
