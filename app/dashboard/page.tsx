'use client'

import { useState } from 'react'
import { ProtectedRoute, useAuth } from '@/lib/auth'
import { useSavedLocations } from '@/lib/supabase/hooks'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { MapPin, Star, Plus, Settings, RefreshCw, Grid, List } from 'lucide-react'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import LocationCard from '@/components/dashboard/location-card'
import AddLocationModal from '@/components/dashboard/add-location-modal'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, profile } = useAuth()
  const { locations, loading, refetch } = useSavedLocations()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const favoriteLocations = locations.filter(loc => loc.is_favorite)
  const otherLocations = locations.filter(loc => !loc.is_favorite)

  const handleLocationUpdate = () => {
    refetch()
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className={`p-6 border-4 mb-8 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold uppercase tracking-wider font-mono mb-2 ${themeClasses.text}`}>
                Weather Dashboard
              </h1>
              <p className={`text-sm font-mono ${themeClasses.mutedText}`}>
                Welcome back, {profile?.username || profile?.full_name || 'User'}! 
                {locations.length > 0 && ` You have ${locations.length} saved location${locations.length === 1 ? '' : 's'}.`}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex border-2 border-current">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 text-xs font-mono transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? `${themeClasses.accentBg} text-black`
                      : `${themeClasses.background} ${themeClasses.text}`
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 text-xs font-mono border-l-2 border-current transition-all duration-200 ${
                    viewMode === 'list' 
                      ? `${themeClasses.accentBg} text-black`
                      : `${themeClasses.background} ${themeClasses.text}`
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Location Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={`flex items-center space-x-2 px-4 py-2 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Location</span>
              </button>

              {/* Refresh All */}
              <button
                onClick={refetch}
                disabled={loading}
                className={`p-2 border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeClasses.borderColor}`}></div>
          </div>
        ) : locations.length === 0 ? (
          /* Empty State */
          <div className={`text-center py-16 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
            <MapPin className={`w-16 h-16 mx-auto mb-4 ${themeClasses.mutedText}`} />
            <h2 className={`text-2xl font-bold uppercase tracking-wider font-mono mb-4 ${themeClasses.text}`}>
              No Saved Locations
            </h2>
            <p className={`text-sm font-mono mb-6 ${themeClasses.mutedText}`}>
              Start by adding your favorite weather locations to track
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`flex items-center space-x-2 px-6 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 mx-auto ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Location</span>
            </button>
          </div>
        ) : (
          <>
            {/* Favorite Locations Section */}
            {favoriteLocations.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <h2 className={`text-xl font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
                    Favorite Locations ({favoriteLocations.length})
                  </h2>
                </div>
                
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
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

            {/* Other Locations Section */}
            {otherLocations.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className={`w-5 h-5 ${themeClasses.text}`} />
                  <h2 className={`text-xl font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
                    Saved Locations ({otherLocations.length})
                  </h2>
                </div>
                
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
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
          </>
        )}

        {/* Quick Actions */}
        {locations.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/profile"
                className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
              >
                <Settings className="w-4 h-4" />
                <span>Manage Profile</span>
              </Link>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.accentBg} ${themeClasses.borderColor} text-black`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Location</span>
              </button>
              
              <Link
                href="/"
                className={`flex items-center justify-center space-x-3 p-4 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
              >
                <MapPin className="w-4 h-4" />
                <span>Weather Search</span>
              </Link>
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