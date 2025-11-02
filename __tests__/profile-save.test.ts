/**
 * Unit tests for profile save functionality
 * Tests the updateProfile function and profile page save handler
 */

import { updateProfile } from '@/lib/supabase/database'
import { ProfileUpdate } from '@/lib/supabase/types'

// Mock Supabase client module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn()
  }
}))

describe('Profile Save Functionality', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateProfile', () => {
    it('should successfully update profile with all fields', async () => {
      const mockUpdates: ProfileUpdate = {
        username: 'testuser',
        full_name: 'Test User',
        default_location: 'New York, NY'
      }

      const mockProfile = {
        id: mockUserId,
        username: 'testuser',
        full_name: 'Test User',
        email: 'test@example.com',
        default_location: 'New York, NY',
        avatar_url: null,
        preferred_units: 'imperial' as const,
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Mock successful update - mock the client module directly
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      }
      
      // Mock based on environment (server-side in tests)
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)
      
      // Ensure window is undefined for server-side test
      const originalWindow = global.window
      delete (global as any).window

      const result = await updateProfile(mockUserId, mockUpdates)

      expect(result).not.toBeNull()
      expect(result?.username).toBe('testuser')
      expect(result?.full_name).toBe('Test User')
      expect(result?.default_location).toBe('New York, NY')
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.update).toHaveBeenCalledWith(mockUpdates)
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockUserId)
      
      // Restore window
      global.window = originalWindow
    })

    it('should handle null values correctly', async () => {
      const mockUpdates: ProfileUpdate = {
        username: null,
        full_name: null,
        default_location: null
      }

      const mockProfile = {
        id: mockUserId,
        username: null,
        full_name: null,
        email: 'test@example.com',
        default_location: null,
        avatar_url: null,
        preferred_units: 'imperial' as const,
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      }
      
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)
      const originalWindow = global.window
      delete (global as any).window

      const result = await updateProfile(mockUserId, mockUpdates)
      
      global.window = originalWindow

      expect(result).not.toBeNull()
      expect(result?.username).toBeNull()
      expect(result?.full_name).toBeNull()
    })

    it('should return null on database error', async () => {
      const mockUpdates: ProfileUpdate = {
        username: 'testuser'
      }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'Database error',
            details: 'Test error',
            hint: null,
            code: 'PGRST116'
          }
        })
      }
      
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)
      const originalWindow = global.window
      delete (global as any).window

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await updateProfile(mockUserId, mockUpdates)
      
      global.window = originalWindow

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing columns with fallback', async () => {
      const mockUpdates: ProfileUpdate = {
        username: 'testuser',
        full_name: 'Test User'
      }

      const mockProfile = {
        id: mockUserId,
        username: 'testuser',
        full_name: 'Test User',
        email: null,
        default_location: null,
        avatar_url: null,
        preferred_units: 'imperial' as const,
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: null,
            error: {
              message: 'column "full_name" does not exist',
              details: null,
              hint: null,
              code: '42703'
            }
          })
          .mockResolvedValueOnce({
            data: mockProfile,
            error: null
          })
      }
      
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)
      const originalWindow = global.window
      delete (global as any).window

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = await updateProfile(mockUserId, mockUpdates)
      
      global.window = originalWindow

      expect(result).not.toBeNull()
      expect(result?.username).toBe('testuser')
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('should validate that data is returned', async () => {
      const mockUpdates: ProfileUpdate = {
        username: 'testuser'
      }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No data returned
          error: null
        })
      }
      
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)
      const originalWindow = global.window
      delete (global as any).window

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await updateProfile(mockUserId, mockUpdates)
      
      global.window = originalWindow

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Profile update succeeded but no data returned'
      )

      consoleErrorSpy.mockRestore()
    })

    it('should log detailed error information', async () => {
      const mockUpdates: ProfileUpdate = {
        username: 'testuser'
      }

      const mockError = {
        message: 'Permission denied',
        details: 'RLS policy violation',
        hint: 'Check RLS policies',
        code: '42501'
      }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      }
      
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)
      const originalWindow = global.window
      delete (global as any).window

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await updateProfile(mockUserId, mockUpdates)
      
      global.window = originalWindow

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating profile:',
        expect.objectContaining({
          message: mockError.message,
          details: mockError.details,
          hint: mockError.hint,
          code: mockError.code,
          userId: mockUserId,
          updates: mockUpdates
        })
      )

      consoleErrorSpy.mockRestore()
    })
  })
})

