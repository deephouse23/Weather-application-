'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/lib/auth'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/supabase/database'
import { updateUserPreferencesAPI } from '@/lib/services/preferences-service'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { User, Mail, MapPin, Save } from 'lucide-react'
import Navigation from '@/components/navigation'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

export function ProfileContent() {
  const router = useRouter()
  const { user, profile, preferences, refreshProfile, refreshPreferences } = useAuth()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'auth')
  
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [defaultLocation, setDefaultLocation] = useState('')
  const [autoLocation, setAutoLocation] = useState<boolean>(true)
  const [temperatureUnit, setTemperatureUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [mounted, setMounted] = useState(false)

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize form values when profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setFullName(profile.full_name || '')
      setDefaultLocation(profile.default_location || '')
    }
    if (preferences) {
      setAutoLocation(preferences.auto_location)
      setTemperatureUnit(preferences.temperature_unit)
    }
  }, [profile, preferences])

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    setMessage('')
    setMessageType('success')

    try {
      const updates = {
        username: username?.trim() || null,
        full_name: fullName?.trim() || null,
        default_location: defaultLocation?.trim() || null,
      }

      console.log('Updating profile with:', updates)
      const updatedProfile = await updateProfile(user.id, updates)

      if (updatedProfile) {
        console.log('Profile updated successfully:', updatedProfile)

        // Refresh profile to verify changes persisted
        await refreshProfile()

        // Save preferences updates (auto-location and units)
        try {
          const preferencesResult = await updateUserPreferencesAPI({
            auto_location: autoLocation,
            temperature_unit: temperatureUnit
          })
          
          if (!preferencesResult) {
            setMessageType('error')
            setMessage('Profile saved, but preferences failed to save. Please try updating preferences again.')
            setLoading(false)
            return
          }
          
          await refreshPreferences()
        } catch (prefError) {
          console.error('Error updating preferences:', prefError)
          setMessageType('error')
          setMessage('Profile saved, but preferences failed to save. Please try updating preferences again.')
          setLoading(false)
          return
        }

        setEditing(false)
        setMessageType('success')
        setMessage('Profile updated successfully! Redirecting...')

        // Redirect to dashboard after showing success message briefly
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // updateProfile returned null - database error
        console.error('updateProfile returned null - check database schema and RLS policies')
        setMessageType('error')
        setMessage('Failed to update profile. Please check your database configuration or try again later.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessageType('error')
      
      // Provide user-friendly error messages based on error type
      if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        setMessage('Permission denied. Please ensure you are logged in and have permission to update your profile.')
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setMessage('Network error. Please check your internet connection and try again.')
      } else {
        setMessage(`Unable to save profile: ${errorMessage}. Please try again or contact support if the issue persists.`)
      }
      setLoading(false)
    }
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a1a]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className={`max-w-2xl mx-auto p-8 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 border-2 flex items-center justify-center mx-auto mb-4 ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
              <User className="w-8 h-8 text-black" />
            </div>
            <h1 className={`text-3xl font-bold uppercase tracking-wider font-mono mb-2 ${themeClasses.text}`}>
              User Profile
            </h1>
            <p className={`text-sm font-mono ${themeClasses.secondary || themeClasses.text}`}>
              Manage your account settings and preferences
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-3 mb-6 border-2 text-sm font-mono ${
              messageType === 'success' 
                ? 'border-green-500 bg-green-100 text-green-700' 
                : 'border-red-500 bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.secondary || themeClasses.text}`} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent opacity-75 ${themeClasses.borderColor} ${themeClasses.text}`}
                />
              </div>
              <p className={`text-xs font-mono mt-1 ${themeClasses.secondary || themeClasses.text}`}>
                Email cannot be changed
              </p>
            </div>

            {/* Username */}
            <div>
              <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.secondary || themeClasses.text}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!editing}
                  className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current ${!editing ? 'opacity-75' : ''}`}
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.secondary || themeClasses.text}`} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editing}
                  className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current ${!editing ? 'opacity-75' : ''}`}
                  placeholder="Enter full name"
                />
              </div>
            </div>

          {/* Default Location */}
          <div>
            <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
              Default Location
            </label>
            <div className="relative">
              <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.secondary || themeClasses.text}`} />
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                disabled={!editing}
                className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current ${!editing ? 'opacity-75' : ''}`}
                placeholder="Enter default location"
              />
            </div>
          </div>

          {/* Location Preferences */}
          <div className="border-t-2 pt-6 mt-6">
            <h2 className={`text-lg font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text}`}>
              Location Preferences
            </h2>

            {/* Auto-detect Location */}
            <div className="flex items-center justify-between mb-4">
              <label className={`text-sm font-mono font-bold uppercase ${themeClasses.text}`}>
                Auto-Detect Location
              </label>
              <input
                type="checkbox"
                checked={autoLocation}
                disabled={!editing}
                onChange={(e) => setAutoLocation(e.target.checked)}
                className="w-5 h-5"
              />
            </div>

            {/* Temperature Units */}
            <div className="flex items-center justify-between">
              <label className={`text-sm font-mono font-bold uppercase ${themeClasses.text}`}>
                Temperature Units
              </label>
              <select
                value={temperatureUnit}
                disabled={!editing}
                onChange={(e) => setTemperatureUnit(e.target.value as 'fahrenheit' | 'celsius')}
                className={`px-3 py-2 border-2 text-sm font-mono bg-transparent ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text}`}
              >
                <option value="fahrenheit">Fahrenheit (°F)</option>
                <option value="celsius">Celsius (°C)</option>
              </select>
            </div>
          </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 disabled:opacity-50 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditing(false)
                      setUsername(profile?.username || '')
                      setFullName(profile?.full_name || '')
                      setDefaultLocation(profile?.default_location || '')
                    }}
                    className={`px-6 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
