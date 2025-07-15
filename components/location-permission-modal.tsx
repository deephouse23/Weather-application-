"use client"

import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { locationService, LocationError } from '@/lib/location-service';
import { userCacheService } from '@/lib/user-cache-service';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted: (location: { latitude: number; longitude: number; displayName: string }) => void;
  onLocationDenied: () => void;
  onManualEntry: () => void;
}

export default function LocationPermissionModal({
  isOpen,
  onClose,
  onLocationGranted,
  onLocationDenied,
  onManualEntry
}: LocationPermissionModalProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<'permission' | 'loading' | 'error' | 'success'>('permission');
  const [error, setError] = useState<LocationError | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('permission');
      setError(null);
      setShowDetails(false);
    }
  }, [isOpen]);

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
          glow: 'shadow-[0_0_20px_rgba(0,255,255,0.4)]'
        };
    }
  };

  const themeClasses = getThemeClasses();

  // Handle location request
  const handleRequestLocation = async () => {
    setStep('loading');
    setError(null);

    try {
      // Check permission status first
      const permissionStatus = await locationService.getPermissionStatus();
      
      if (permissionStatus.denied) {
        // User has previously denied permission
        setError({
          code: 'PERMISSION_DENIED',
          message: 'Location access was previously denied',
          suggestion: 'Please enable location access in your browser settings or enter your location manually'
        });
        setStep('error');
        return;
      }

      // Request location
      const location = await locationService.getCurrentLocation();
      
      // Save permission granted status
      userCacheService.updateSettings({ 
        permissionAsked: true, 
        permissionDenied: false 
      });
      
      setStep('success');
      
      // Call success callback with a delay to show success state
      setTimeout(() => {
        onLocationGranted({
          latitude: location.latitude,
          longitude: location.longitude,
          displayName: location.displayName
        });
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('Location request failed:', err);
      setError(err);
      setStep('error');
      
      // Save permission status
      if (err.code === 'PERMISSION_DENIED') {
        userCacheService.updateSettings({ 
          permissionAsked: true, 
          permissionDenied: true 
        });
      }
    }
  };

  // Handle location with IP fallback
  const handleLocationWithFallback = async () => {
    setStep('loading');
    setError(null);

    try {
      const location = await locationService.getLocationWithFallback();
      
      setStep('success');
      
      setTimeout(() => {
        onLocationGranted({
          latitude: location.latitude,
          longitude: location.longitude,
          displayName: location.displayName
        });
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('Location with fallback failed:', err);
      setError(err);
      setStep('error');
    }
  };

  // Handle deny location
  const handleDenyLocation = () => {
    userCacheService.updateSettings({ 
      permissionAsked: true, 
      permissionDenied: true,
      autoDetectLocation: false
    });
    
    onLocationDenied();
    onClose();
  };

  // Handle manual entry
  const handleManualEntry = () => {
    userCacheService.updateSettings({ 
      permissionAsked: true,
      autoDetectLocation: false
    });
    
    onManualEntry();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeClasses.backdrop}`}>
      <div className={`
        relative w-full max-w-md bg-opacity-95 border-2 rounded-lg p-6 
        ${themeClasses.modal} ${themeClasses.glow}
      `}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded transition-colors ${themeClasses.text} hover:opacity-70`}
        >
          <X size={20} />
        </button>

        {/* Permission Request Step */}
        {step === 'permission' && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 flex items-center justify-center ${themeClasses.modal} ${themeClasses.headerText}`}>
              <MapPin size={32} />
            </div>
            
            <h2 className={`text-xl font-bold mb-3 ${themeClasses.headerText}`}>
              Enable Location Access
            </h2>
            
            <p className={`text-sm mb-6 ${themeClasses.text}`}>
              We'd like to automatically detect your location to show you accurate weather information for your area.
            </p>

            <div className={`text-xs mb-6 p-3 rounded border ${themeClasses.text} opacity-80`}>
              <p className="mb-2">🔒 <strong>Privacy Note:</strong></p>
              <p>Your location is only used to fetch weather data and is not stored on our servers. You can change this setting anytime.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRequestLocation}
                className={`w-full py-3 px-4 rounded font-medium transition-colors flex items-center justify-center gap-2 ${themeClasses.button}`}
              >
                <Navigation size={16} />
                Allow Location Access
              </button>

              <button
                onClick={handleLocationWithFallback}
                className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center gap-2 ${themeClasses.buttonSecondary}`}
              >
                <Globe size={16} />
                Use Approximate Location
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleManualEntry}
                  className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${themeClasses.buttonSecondary}`}
                >
                  Enter Manually
                </button>
                
                <button
                  onClick={handleDenyLocation}
                  className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${themeClasses.buttonDanger}`}
                >
                  No Thanks
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`mt-4 text-xs ${themeClasses.text} opacity-60 hover:opacity-80 transition-opacity`}
            >
              {showDetails ? 'Hide' : 'Show'} technical details
            </button>

            {showDetails && (
              <div className={`mt-3 text-xs ${themeClasses.text} opacity-60 text-left`}>
                <p><strong>How it works:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>"Allow Location" uses GPS/WiFi for precise location</li>
                  <li>"Approximate Location" uses your IP address</li>
                  <li>All data stays on your device</li>
                  <li>You can disable auto-detection anytime</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 flex items-center justify-center ${themeClasses.modal} ${themeClasses.headerText} animate-pulse`}>
              <Navigation size={32} className="animate-spin" />
            </div>
            
            <h2 className={`text-xl font-bold mb-3 ${themeClasses.headerText}`}>
              Getting Your Location
            </h2>
            
            <p className={`text-sm ${themeClasses.text}`}>
              Please wait while we detect your location...
            </p>
            
            <div className="mt-4">
              <div className={`h-1 bg-gray-700 rounded overflow-hidden`}>
                <div className={`h-full bg-current animate-pulse`} style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 flex items-center justify-center ${themeClasses.modal} text-green-400`}>
              <CheckCircle size={32} />
            </div>
            
            <h2 className={`text-xl font-bold mb-3 text-green-400`}>
              Location Detected!
            </h2>
            
            <p className={`text-sm ${themeClasses.text}`}>
              Successfully found your location. Loading weather data...
            </p>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && error && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 border-red-400 flex items-center justify-center text-red-400`}>
              <AlertCircle size={32} />
            </div>
            
            <h2 className={`text-xl font-bold mb-3 text-red-400`}>
              Location Access Failed
            </h2>
            
            <p className={`text-sm mb-4 ${themeClasses.text}`}>
              {error.message}
            </p>

            {error.suggestion && (
              <div className={`text-xs mb-6 p-3 rounded border border-yellow-400 text-yellow-300 bg-yellow-900 bg-opacity-20`}>
                <p><strong>Suggestion:</strong> {error.suggestion}</p>
              </div>
            )}

            <div className="space-y-3">
              {error.code !== 'PERMISSION_DENIED' && (
                <button
                  onClick={handleRequestLocation}
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${themeClasses.button}`}
                >
                  Try Again
                </button>
              )}

              {error.code === 'PERMISSION_DENIED' && (
                <button
                  onClick={handleLocationWithFallback}
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${themeClasses.button}`}
                >
                  Use Approximate Location Instead
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleManualEntry}
                  className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${themeClasses.buttonSecondary}`}
                >
                  Enter Location Manually
                </button>
                
                <button
                  onClick={onClose}
                  className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${themeClasses.buttonDanger}`}
                >
                  Cancel
                </button>
              </div>
            </div>

            {error.code === 'PERMISSION_DENIED' && (
              <div className={`mt-4 text-xs ${themeClasses.text} opacity-60`}>
                <p><strong>To enable location access:</strong></p>
                <p>Look for the location icon 📍 in your browser's address bar, or check your browser settings under "Site permissions" → "Location"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}