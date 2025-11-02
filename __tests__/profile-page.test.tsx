/**
 * Unit tests for profile page component
 * Tests the save handler and redirect functionality
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { ProfileContent } from '@/app/profile/page'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/supabase/database'
import { updateUserPreferencesAPI } from '@/lib/services/preferences-service'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children
}))

jest.mock('@/lib/supabase/database', () => ({
  updateProfile: jest.fn()
}))

jest.mock('@/lib/services/preferences-service', () => ({
  updateUserPreferencesAPI: jest.fn()
}))

jest.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'dark' })
}))

jest.mock('@/lib/theme-utils', () => ({
  getComponentStyles: () => ({
    background: 'bg-dark',
    text: 'text-white',
    borderColor: 'border-gray-500',
    accentBg: 'bg-blue-500',
    glow: 'glow'
  })
}))

jest.mock('@/components/navigation', () => {
  return function Navigation() {
    return <nav>Navigation</nav>
  }
})

describe('ProfilePage', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  }

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com'
  }

  const mockProfile = {
    id: mockUser.id,
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

  const mockPreferences = {
    user_id: mockUser.id,
    auto_location: true,
    temperature_unit: 'fahrenheit' as const,
    theme: 'dark',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockRefreshProfile = jest.fn()
  const mockRefreshPreferences = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      preferences: mockPreferences,
      refreshProfile: mockRefreshProfile,
      refreshPreferences: mockRefreshPreferences
    })
  })

  it('should render profile page with user data', () => {
    render(<ProfileContent />)
    
    expect(screen.getByText('User Profile')).toBeInTheDocument()
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('New York, NY')).toBeInTheDocument()
  })

  it('should enable editing mode when Edit Profile is clicked', () => {
    render(<ProfileContent />)
    
    const editButton = screen.getByText('Edit Profile')
    fireEvent.click(editButton)
    
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should successfully save profile and redirect', async () => {
    const updatedProfile = { ...mockProfile, username: 'updateduser' }
    ;(updateProfile as jest.Mock).mockResolvedValue(updatedProfile)
    ;(updateUserPreferencesAPI as jest.Mock).mockResolvedValue(mockPreferences)

    render(<ProfileContent />)
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit Profile'))
    
    // Update username
    const usernameInput = screen.getByDisplayValue('testuser')
    fireEvent.change(usernameInput, { target: { value: 'updateduser' } })
    
    // Save
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)
    
    // Wait for save to complete
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(mockUser.id, {
        username: 'updateduser',
        full_name: 'Test User',
        default_location: 'New York, NY'
      })
    })
    
    await waitFor(() => {
      expect(updateUserPreferencesAPI).toHaveBeenCalledWith({
        auto_location: true,
        temperature_unit: 'fahrenheit'
      })
    })
    
    await waitFor(() => {
      expect(mockRefreshProfile).toHaveBeenCalled()
      expect(mockRefreshPreferences).toHaveBeenCalled()
    })
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully! Redirecting.../)).toBeInTheDocument()
    })
    
    // Check redirect after delay
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 2000 })
  })

  it('should show error message when profile update fails', async () => {
    ;(updateProfile as jest.Mock).mockResolvedValue(null)

    render(<ProfileContent />)
    
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to update profile/)).toBeInTheDocument()
    })
    
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('should show error message when preferences update fails', async () => {
    const updatedProfile = { ...mockProfile }
    ;(updateProfile as jest.Mock).mockResolvedValue(updatedProfile)
    ;(updateUserPreferencesAPI as jest.Mock).mockResolvedValue(null)

    render(<ProfileContent />)
    
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(screen.getByText(/Profile saved, but preferences failed to save/)).toBeInTheDocument()
    })
    
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('should handle network errors gracefully', async () => {
    ;(updateProfile as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<ProfileContent />)
    
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    })
  })

  it('should handle permission errors gracefully', async () => {
    ;(updateProfile as jest.Mock).mockRejectedValue(new Error('Permission denied'))

    render(<ProfileContent />)
    
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(screen.getByText(/Permission denied/)).toBeInTheDocument()
    })
  })

  it('should cancel editing and reset form values', () => {
    render(<ProfileContent />)
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    // Change values
    const usernameInput = screen.getByDisplayValue('testuser')
    fireEvent.change(usernameInput, { target: { value: 'changed' } })
    
    // Cancel
    fireEvent.click(screen.getByText('Cancel'))
    
    // Values should be reset
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument()
  })

  it('should show loading state during save', async () => {
    ;(updateProfile as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockProfile), 100))
    )
    ;(updateUserPreferencesAPI as jest.Mock).mockResolvedValue(mockPreferences)

    render(<ProfileContent />)
    
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
    })
  })
})

