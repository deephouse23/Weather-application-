"use client"

import React, { useState, useEffect } from 'react';
import { Star, MapPin, X, Plus, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { LocationData } from '@/lib/location-service';
import { userCacheService } from '@/lib/user-cache-service';

interface FavoriteLocationsProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  currentLocation?: string;
}

export default function FavoriteLocations({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation
}: FavoriteLocationsProps) {
  const { theme } = useTheme();
  const [favorites, setFavorites] = useState<LocationData[]>([]);
  const [isAddingCurrent, setIsAddingCurrent] = useState(false);

  // Load favorites on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = () => {
    const favs = userCacheService.getFavoriteLocations();
    setFavorites(favs);
  };

  // Theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          backdrop: 'bg-black bg-opacity-75',
          modal: 'bg-[#0f0f0f] border-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          headerText: 'text-[#00d4ff]',
          button: 'bg-[#00d4ff] text-[#0f0f0f] hover:bg-[#00a8cc]',
          buttonSecondary: 'bg-gray-700 text-[#e0e0e0] hover:bg-gray-600',
          buttonDanger: 'bg-red-600 text-white hover:bg-red-700',
          card: 'bg-gray-800 border-gray-700 hover:border-[#00d4ff]',
          glow: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]'
        };
      case 'miami':
        return {
          backdrop: 'bg-black bg-opacity-75',
          modal: 'bg-[#0a0025] border-[#ff1493]',
          text: 'text-[#00ffff]',
          headerText: 'text-[#ff1493]',
          button: 'bg-[#ff1493] text-[#0a0025] hover:bg-[#cc1075]',
          buttonSecondary: 'bg-purple-700 text-[#00ffff] hover:bg-purple-600',
          buttonDanger: 'bg-red-600 text-white hover:bg-red-700',
          card: 'bg-purple-900 border-purple-700 hover:border-[#ff1493]',
          glow: 'shadow-[0_0_20px_rgba(255,20,147,0.3)]'
        };
      case 'tron':
        return {
          backdrop: 'bg-black bg-opacity-80',
          modal: 'bg-black border-[#00FFFF]',
          text: 'text-white',
          headerText: 'text-[#00FFFF]',
          button: 'bg-[#00FFFF] text-black hover:bg-[#00CCCC]',
          buttonSecondary: 'bg-gray-800 text-[#00FFFF] hover:bg-gray-700',
          buttonDanger: 'bg-red-600 text-white hover:bg-red-700',
          card: 'bg-gray-900 border-gray-700 hover:border-[#00FFFF]',
          glow: 'shadow-[0_0_20px_rgba(0,255,255,0.4)]'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleAddCurrentLocation = async () => {
    if (!currentLocation) return;

    setIsAddingCurrent(true);
    try {
      // Get the last location from cache to get coordinates
      const lastLocation = userCacheService.getLastLocation();
      
      if (lastLocation) {
        const success = userCacheService.addFavoriteLocation(lastLocation);
        if (success) {
          loadFavorites();
          console.log('Current location added to favorites');
        }
      } else {
        console.warn('No last location data available to add to favorites');
      }
    } catch (error) {
      console.error('Failed to add current location to favorites:', error);
    } finally {
      setIsAddingCurrent(false);
    }
  };

  const handleRemoveFavorite = (location: LocationData) => {
    const success = userCacheService.removeFavoriteLocation(location);
    if (success) {
      loadFavorites();
      console.log('Location removed from favorites');
    }
  };

  const handleSelectLocation = (location: LocationData) => {
    onLocationSelect(location);
    onClose();
  };

  const formatLocationDisplay = (location: LocationData): string => {
    if (location.city && location.region && location.country) {
      return `${location.city}, ${location.region}`;
    } else if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    } else if (location.displayName) {
      return location.displayName;
    } else {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
  };

  const formatLocationSubtext = (location: LocationData): string => {
    if (location.country) {
      return location.country;
    }
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const getLocationIcon = (source?: string) => {
    switch (source) {
      case 'geolocation':
        return <Navigation size={16} className="text-green-400" />;
      case 'ip':
        return <MapPin size={16} className="text-blue-400" />;
      default:
        return <MapPin size={16} className="text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeClasses.backdrop}`}>
      <div className={`
        relative w-full max-w-lg bg-opacity-95 border-2 rounded-lg p-6 max-h-[80vh] overflow-hidden flex flex-col
        ${themeClasses.modal} ${themeClasses.glow}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className={`h-6 w-6 ${themeClasses.headerText}`} />
            <h2 className={`text-xl font-bold ${themeClasses.headerText}`}>
              Favorite Locations
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${themeClasses.text} hover:opacity-70`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Add Current Location */}
        {currentLocation && (
          <div className={`mb-4 p-3 rounded border ${themeClasses.card} transition-colors`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${themeClasses.headerText}`}>
                  <MapPin size={16} />
                </div>
                <div>
                  <p className={`font-medium ${themeClasses.text}`}>Current Location</p>
                  <p className={`text-sm opacity-75 ${themeClasses.text}`}>{currentLocation}</p>
                </div>
              </div>
              <button
                onClick={handleAddCurrentLocation}
                disabled={isAddingCurrent}
                className={`p-2 rounded transition-colors ${themeClasses.button} disabled:opacity-50`}
              >
                {isAddingCurrent ? (
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Star className={`h-12 w-12 mx-auto mb-4 opacity-30 ${themeClasses.text}`} />
              <p className={`${themeClasses.text} opacity-75 mb-2`}>No favorite locations yet</p>
              <p className={`text-sm ${themeClasses.text} opacity-50`}>
                Add locations you visit frequently for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((location, index) => (
                <div
                  key={`${location.latitude}-${location.longitude}-${index}`}
                  className={`p-3 rounded border transition-all cursor-pointer group ${themeClasses.card}`}
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${themeClasses.headerText}`}>
                        {getLocationIcon(location.source)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${themeClasses.text}`}>
                          {formatLocationDisplay(location)}
                        </p>
                        <p className={`text-sm opacity-75 truncate ${themeClasses.text}`}>
                          {formatLocationSubtext(location)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectLocation(location);
                        }}
                        className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${themeClasses.buttonSecondary}`}
                        title="Select location"
                      >
                        <Navigation size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(location);
                        }}
                        className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${themeClasses.buttonDanger}`}
                        title="Remove from favorites"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${themeClasses.buttonSecondary}`}
            >
              Close
            </button>
          </div>
          
          <div className={`mt-3 text-xs ${themeClasses.text} opacity-60 text-center`}>
            <p>💡 Tip: Click any location to quickly load its weather</p>
          </div>
        </div>
      </div>
    </div>
  );
}