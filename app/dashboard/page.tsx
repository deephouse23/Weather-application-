'use client'

import { ProtectedRoute, useAuth } from '@/lib/auth'
import { useSavedLocations } from '@/lib/supabase/hooks'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { MapPin, Star, Plus, Settings } from 'lucide-react'
import Navigation from '@/components/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, profile } = useAuth()
  const { locations, loading } = useSavedLocations()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')

  const favoriteLocations = locations.filter(loc => loc.is_favorite)
  const recentLocations = locations.filter(loc => !loc.is_favorite).slice(0, 5)

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className={`p-6 border-4 mb-8 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
          <h1 className={`text-3xl font-bold uppercase tracking-wider font-mono mb-2 ${themeClasses.text}`}>
            Welcome back, {profile?.username || profile?.full_name || 'User'}!
          </h1>
          <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
            Manage your saved locations and weather preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favorite Locations */}
          <div className={`p-6 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
                Favorite Locations
              </h2>
              <Link
                href="/saved-locations"
                className={`flex items-center space-x-2 px-3 py-2 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black`}
              >
                <Plus className="w-3 h-3" />
                <span>ADD</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${themeClasses.borderColor}`}></div>
              </div>
            ) : favoriteLocations.length > 0 ? (
              <div className="space-y-3">
                {favoriteLocations.map((location) => (
                  <Link
                    key={location.id}
                    href={`/weather/${location.city.toLowerCase().replace(/\s+/g, '-')}-${location.state?.toLowerCase().replace(/\s+/g, '-') || location.country.toLowerCase()}`}
                    className={`flex items-center justify-between p-3 border-2 transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div>
                        <p className="font-mono font-bold text-sm">
                          {location.custom_name || location.location_name}
                        </p>
                        <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
                          {location.city}, {location.state || location.country}
                        </p>
                      </div>
                    </div>
                    <MapPin className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className={`w-8 h-8 mx-auto mb-3 ${themeClasses.mutedText}`} />
                <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
                  No favorite locations yet
                </p>
              </div>
            )}
          </div>

          {/* Recent Locations */}
          <div className={`p-6 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
            <h2 className={`text-xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text}`}>
              Recent Locations
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${themeClasses.borderColor}`}></div>
              </div>
            ) : recentLocations.length > 0 ? (
              <div className="space-y-3">
                {recentLocations.map((location) => (
                  <Link
                    key={location.id}
                    href={`/weather/${location.city.toLowerCase().replace(/\s+/g, '-')}-${location.state?.toLowerCase().replace(/\s+/g, '-') || location.country.toLowerCase()}`}
                    className={`flex items-center justify-between p-3 border-2 transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <p className="font-mono font-bold text-sm">
                          {location.custom_name || location.location_name}
                        </p>
                        <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
                          {location.city}, {location.state || location.country}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className={`w-8 h-8 mx-auto mb-3 ${themeClasses.mutedText}`} />
                <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
                  No saved locations yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/profile"
              className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
            >
              <Settings className="w-4 h-4" />
              <span>Manage Profile</span>
            </Link>
            
            <Link
              href="/"
              className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black`}
            >
              <MapPin className="w-4 h-4" />
              <span>Check Weather</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}