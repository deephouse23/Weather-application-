'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/lib/auth'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/supabase/database'
import { updateUserPreferencesAPI } from '@/lib/services/preferences-service'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { User, Mail, MapPin, Save, Settings, Loader2 } from 'lucide-react'
import Navigation from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
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
          <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Card className={`max-w-2xl mx-auto border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
          <CardHeader className="text-center space-y-4 pb-8">
            <div className={`w-16 h-16 border-2 flex items-center justify-center mx-auto rounded-full ${themeClasses.accentBg} ${themeClasses.borderColor}`}>
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <CardTitle className={`text-3xl font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
                User Profile
              </CardTitle>
              <CardDescription className={`font-mono mt-2 ${themeClasses.secondary || themeClasses.text}`}>
                Manage your account settings and preferences
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success/Error Message */}
            {message && (
              <div className={`p-4 border-2 text-sm font-mono rounded-md ${messageType === 'success'
                  ? 'border-green-500 bg-green-950/30 text-green-400'
                  : 'border-red-500 bg-red-950/30 text-red-400'
                }`}>
                {message}
              </div>
            )}

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className={`text-xs font-mono font-bold uppercase ${themeClasses.text}`}>
                Email Address
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.secondary || themeClasses.text}`} />
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`pl-10 font-mono bg-transparent opacity-75 ${themeClasses.borderColor} ${themeClasses.text}`}
                />
              </div>
              <p className={`text-[10px] font-mono ${themeClasses.secondary || themeClasses.text}`}>
                Email cannot be changed
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label className={`text-xs font-mono font-bold uppercase ${themeClasses.text}`}>
                Username
              </Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!editing}
                  className={`pl-10 font-mono bg-transparent ${themeClasses.borderColor} ${themeClasses.text}`}
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label className={`text-xs font-mono font-bold uppercase ${themeClasses.text}`}>
                Full Name
              </Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editing}
                  className={`pl-10 font-mono bg-transparent ${themeClasses.borderColor} ${themeClasses.text}`}
                  placeholder="Enter full name"
                />
              </div>
            </div>

            {/* Default Location */}
            <div className="space-y-2">
              <Label className={`text-xs font-mono font-bold uppercase ${themeClasses.text}`}>
                Default Location
              </Label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                <Input
                  type="text"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  disabled={!editing}
                  className={`pl-10 font-mono bg-transparent ${themeClasses.borderColor} ${themeClasses.text}`}
                  placeholder="Enter default location"
                />
              </div>
            </div>

            {/* Location Preferences */}
            <div className="border-t pt-6 mt-6 space-y-6">
              <div className="flex items-center space-x-2">
                <Settings className={`w-5 h-5 ${themeClasses.text}`} />
                <h3 className={`text-lg font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
                  Preferences
                </h3>
              </div>

              {/* Auto-detect Location */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-white/5">
                <div className="space-y-0.5">
                  <Label className={`text-sm font-mono font-bold uppercase ${themeClasses.text}`}>
                    Auto-Detect Location
                  </Label>
                  <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
                    Use your current location on startup
                  </p>
                </div>
                <Switch
                  checked={autoLocation}
                  onCheckedChange={setAutoLocation}
                  disabled={!editing}
                  className={`${autoLocation ? 'bg-green-500' : 'bg-gray-600'}`}
                />
              </div>

              {/* Temperature Units */}
              <div className="space-y-2">
                <Label className={`text-xs font-mono font-bold uppercase ${themeClasses.text}`}>
                  Temperature Units
                </Label>
                <div className="relative">
                  <select
                    value={temperatureUnit}
                    disabled={!editing}
                    onChange={(e) => setTemperatureUnit(e.target.value as 'fahrenheit' | 'celsius')}
                    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono ${themeClasses.borderColor} ${themeClasses.text}`}
                  >
                    <option value="fahrenheit" className="bg-gray-900">Fahrenheit (°F)</option>
                    <option value="celsius" className="bg-gray-900">Celsius (°C)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              {!editing ? (
                <Button
                  onClick={() => setEditing(true)}
                  className={`w-full font-mono font-bold uppercase tracking-wider ${themeClasses.accentBg} text-black hover:opacity-90`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex w-full gap-4">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex-1 font-mono font-bold uppercase tracking-wider ${themeClasses.accentBg} text-black hover:opacity-90`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setUsername(profile?.username || '')
                      setFullName(profile?.full_name || '')
                      setDefaultLocation(profile?.default_location || '')
                    }}
                    className={`flex-1 font-mono font-bold uppercase tracking-wider ${themeClasses.borderColor} ${themeClasses.text} hover:bg-white/10`}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
