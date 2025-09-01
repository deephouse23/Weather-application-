'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/lib/auth'
import { useAuth } from '@/lib/auth'
import { updateProfile } from '@/lib/supabase/database'
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

function ProfileContent() {
  const { user, profile, refreshProfile } = useAuth()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'profile')
  
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(profile?.username || '')
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [defaultLocation, setDefaultLocation] = useState(profile?.default_location || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    setMessage('')

    try {
      const updates = {
        username: username || null,
        full_name: fullName || null,
        default_location: defaultLocation || null,
      }

      const updatedProfile = await updateProfile(user.id, updates)
      if (updatedProfile) {
        await refreshProfile()
        setEditing(false)
        setMessage('Profile updated successfully!')
      }
    } catch (error) {
      setMessage('Error updating profile')
    } finally {
      setLoading(false)
    }
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
            <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
              Manage your account settings and preferences
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className={`p-3 mb-6 border-2 border-green-500 bg-green-100 text-green-700 text-sm font-mono`}>
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
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent opacity-75 ${themeClasses.borderColor} ${themeClasses.text}`}
                />
              </div>
              <p className={`text-xs font-mono mt-1 ${themeClasses.mutedText}`}>
                Email cannot be changed
              </p>
            </div>

            {/* Username */}
            <div>
              <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
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
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
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
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
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