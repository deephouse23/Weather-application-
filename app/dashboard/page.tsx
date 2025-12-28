'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute, useAuth } from '@/lib/auth'
import { useSavedLocations } from '@/lib/supabase/hooks'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { MapPin, Star, Plus, Settings, RefreshCw, Bot } from 'lucide-react'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import LocationCard from '@/components/dashboard/location-card'
import AddLocationModal from '@/components/dashboard/add-location-modal'
import ThemeSelectorGrid from '@/components/dashboard/theme-selector-grid'
import AIPersonalitySelector from '@/components/dashboard/ai-personality-selector'
import { Button } from '@/components/ui/button'

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
        <div className="text-center mb-12">
          <h1 className={`text-3xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text} ${themeClasses.glow}`} style={{
            fontFamily: "monospace",
            fontSize: "clamp(24px, 5vw, 40px)"
          }}>
            Weather Dashboard
          </h1>
          <p className={`text-lg font-mono ${themeClasses.secondary || themeClasses.text} mb-8 max-w-2xl mx-auto`}>
            Welcome back, {profile?.username || profile?.full_name || 'User'}!
            {locations.length > 0 && ` You have ${locations.length} saved location${locations.length === 1 ? '' : 's'}.`}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className={`font-mono font-bold uppercase tracking-wider ${themeClasses.accentBg} text-black hover:opacity-90 transition-all active:scale-95`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={refetch}
              disabled={loading}
              className={`${themeClasses.borderColor} ${themeClasses.text} hover:bg-white/10`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Saved Locations */}
        {locations.length === 0 ? (
          <div className={`text-center py-20 mb-12 p-8 border-4 border-dashed ${themeClasses.borderColor} rounded-lg bg-black/20`}>
            <MapPin className={`w-16 h-16 mx-auto mb-6 ${themeClasses.text} opacity-50`} />
            <h3 className={`text-xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text}`}>
              No Saved Locations
            </h3>
            <p className={`text-sm font-mono mb-8 ${themeClasses.text} opacity-75 max-w-sm mx-auto`}>
              Start by adding your favorite weather locations to track temperature, humidity, and more.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className={`font-mono font-bold uppercase tracking-wider ${themeClasses.accentBg} text-black`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Location
            </Button>
          </div>
        ) : (
          <div className="space-y-12 mb-12">
            {/* Favorite Locations Section */}
            {favoriteLocations.length > 0 && (
              <div className="space-y-6">
                <div className={`flex items-center gap-2 pb-2 border-b-2 ${themeClasses.borderColor}`}>
                  <Star className={`w-5 h-5 ${themeClasses.text}`} />
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
              <div className="space-y-6">
                <div className={`flex items-center gap-2 pb-2 border-b-2 ${themeClasses.borderColor}`}>
                  <MapPin className={`w-5 h-5 ${themeClasses.text}`} />
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

        {/* AI Personality Section */}
        <div className="mb-12">
          <div className={`flex items-center gap-2 mb-6 pb-2 border-b-2 ${themeClasses.borderColor}`}>
            <Bot className={`w-5 h-5 ${themeClasses.text}`} />
            <h2 className={`text-lg font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
              AI Assistant Personality
            </h2>
          </div>
          <div className={`p-6 border-2 ${themeClasses.borderColor} bg-black/40 rounded-lg`}>
            <AIPersonalitySelector />
          </div>
        </div>

        {/* Theme Selector Section */}
        <div className="mb-12">
          <div className={`flex items-center gap-2 mb-6 pb-2 border-b-2 ${themeClasses.borderColor}`}>
            <Settings className={`w-5 h-5 ${themeClasses.text}`} />
            <h2 className={`text-lg font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
              Theme Settings
            </h2>
          </div>
          <div className={`p-6 border-2 ${themeClasses.borderColor} bg-black/40 rounded-lg`}>
            <ThemeSelectorGrid />
          </div>
        </div>

        {/* Quick Actions */}
        {locations.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/profile" className="contents">
                <Button variant="outline" className={`h-auto py-4 font-mono font-bold uppercase tracking-wider ${themeClasses.borderColor} ${themeClasses.text} hover:bg-white/5`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Profile
                </Button>
              </Link>

              <Link href="/" className="contents">
                <Button variant="outline" className={`h-auto py-4 font-mono font-bold uppercase tracking-wider ${themeClasses.borderColor} ${themeClasses.text} hover:bg-white/5`}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Weather Search
                </Button>
              </Link>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className={`h-auto py-4 font-mono font-bold uppercase tracking-wider ${themeClasses.accentBg} text-black border-2 border-transparent hover:border-white`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Location
              </Button>
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