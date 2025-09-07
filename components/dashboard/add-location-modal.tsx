'use client'

import { useState } from 'react'
import { X, MapPin, Search, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { saveLocation } from '@/lib/supabase/database'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationAdded: () => void
}

export default function AddLocationModal({ isOpen, onClose, onLocationAdded }: AddLocationModalProps) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'modal')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [customName, setCustomName] = useState('')
  const [notes, setNotes] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !searchTerm.trim()) return

    setLoading(true)
    setError('')

    try {
      // Use OpenWeatherMap Geocoding API
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchTerm.trim())}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to geocode location')
      }
      
      const locationData = await response.json()
      
      if (!locationData || locationData.length === 0) {
        setError('Location not found. Please try a different search term.')
        return
      }

      const location = locationData[0]
      
      // Save to database
      const savedLocation = await saveLocation({
        user_id: user.id,
        location_name: `${location.name}, ${location.state || location.country}`,
        city: location.name,
        state: location.state || null,
        country: location.country,
        latitude: location.lat,
        longitude: location.lon,
        is_favorite: isFavorite,
        custom_name: customName.trim() || null,
        notes: notes.trim() || null
      })

      if (savedLocation) {
        onLocationAdded()
        handleClose()
      } else {
        setError('Failed to save location. It may already be saved.')
      }
    } catch (error) {
      console.error('Error saving location:', error)
      setError('Failed to save location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchTerm('')
    setCustomName('')
    setNotes('')
    setIsFavorite(false)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md p-6 border-4 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold uppercase tracking-wider font-mono ${themeClasses.text}`}>
            Add Location
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 border-2 transition-all duration-200 hover:scale-105 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 mb-4 border-2 border-red-500 bg-red-100 text-red-700 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Search */}
          <div>
            <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
              Location *
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
              <input
                type="text"
                required
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current`}
                placeholder="City, State or ZIP code"
              />
            </div>
            <p className={`text-xs font-mono mt-1 ${themeClasses.mutedText}`}>
              Examples: San Francisco, CA | 90210 | London, UK
            </p>
          </div>

          {/* Custom Name */}
          <div>
            <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
              Custom Name (Optional)
            </label>
            <div className="relative">
              <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current`}
                placeholder="My hometown, Work location..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-mono font-bold uppercase mb-2 ${themeClasses.text}`}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} focus:ring-current`}
              placeholder="Add any notes about this location..."
            />
          </div>

          {/* Favorite Checkbox */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                isFavorite 
                  ? `${themeClasses.accentBg} ${themeClasses.borderColor}`
                  : `${themeClasses.background} ${themeClasses.borderColor}`
              }`}
            >
              {isFavorite && <Star className="w-3 h-3 text-black fill-current" />}
            </button>
            <label className={`text-sm font-mono font-bold uppercase ${themeClasses.text} cursor-pointer`}>
              Add to Favorites
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.accentBg} ${themeClasses.borderColor} text-black ${themeClasses.glow}`}
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Adding Location...' : 'Add Location'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}