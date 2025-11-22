'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute, useAuth } from '@/lib/auth'
import { useSavedLocations } from '@/lib/supabase/hooks'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { MapPin, Star, Plus, Settings, RefreshCw } from 'lucide-react'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import LocationCard from '@/components/dashboard/location-card'
import AddLocationModal from '@/components/dashboard/add-location-modal'
import ThemeSelectorGrid from '@/components/dashboard/theme-selector-grid'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { profile } = useAuth()
  const { locations, loading, refetch } = useSavedLocations()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const favoriteLocations = locations.filter(loc => loc.is_favorite)
  const otherLocations = locations.filter(loc => !loc.is_favorite)

  const handleLocationUpdate = () => {
    refetch()
  }

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
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text} ${themeClasses.glow}`} style={{
            fontFamily: "monospace",
            fontSize: "clamp(24px, 5vw, 40px)"
          }}>
            Weather Dashboard
          </h1>
          <p className={`text-lg font-mono ${themeClasses.secondary || themeClasses.text} mb-6`}>
            Welcome back, {profile?.username || profile?.full_name || 'User'}! 
            {locations.length > 0 && ` You have ${locations.length} saved location${locations.length === 1 ? '' : 's'}.`}
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`flex items-center space-x-2 px-4 py-2 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>

            <button
              onClick={refetch}
              disabled={loading}
              className={`p-2 border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Saved Locations */}
        {locations.length === 0 ? (
          <div className={`text-center py-16 mb-8 p-6 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
            <MapPin className={`w-16 h-16 mx-auto mb-4 ${themeClasses.text} opacity-50`} />
            <h3 className={`text-xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text}`}>
              No Saved Locations
            </h3>
            <p className={`text-sm font-mono mb-6 ${themeClasses.text} opacity-75`}>
              Start by adding your favorite weather locations to track
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`flex items-center space-x-2 px-4 py-2 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 mx-auto ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Location</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {/* Favorite Locations Section */}
            {favoriteLocations.length > 0 && (
              <div>
                <div className={`flex items-center justify-center mb-4 p-3 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
                  <Star className={`w-5 h-5 mr-2 ${themeClasses.text}`} />
                  <h2 className={`text-lg font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
                    Favorite Locations ({favoriteLocations.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteLocations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      onUpdate={handleLocationUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Locations Section */}
            {otherLocations.length > 0 && (
              <div>
                <div className={`flex items-center justify-center mb-4 p-3 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
                  <MapPin className={`w-5 h-5 mr-2 ${themeClasses.text}`} />
                  <h2 className={`text-lg font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
                    {favoriteLocations.length > 0 ? 'Other Locations' : 'All Locations'} ({otherLocations.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherLocations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      onUpdate={handleLocationUpdate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Selector Section */}
        <div className="mb-8">
          <div className={`flex items-center justify-center mb-4 p-3 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
            <Settings className={`w-5 h-5 mr-2 ${themeClasses.text}`} />
            <h2 className={`text-lg font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
              Theme Settings
            </h2>
          </div>
          <div className={`p-6 border-2 ${themeClasses.background} ${themeClasses.borderColor}`}>
            <ThemeSelectorGrid />
          </div>
        </div>

        {/* Quick Actions */}
        {locations.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/profile"
                className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
              >
                <Settings className="w-4 h-4" />
                <span>Manage Profile</span>
              </Link>
              
              <Link
                href="/"
                className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
              >
                <MapPin className="w-4 h-4" />
                <span>Weather Search</span>
              </Link>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Location</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLocationAdded={handleLocationUpdate}
      />
    </div>
  )
}