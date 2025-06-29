"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/nav-bar'
import { WeatherPreferences, defaultPreferences } from '@/types/user'

console.log('Onboarding module loaded');

export default function OnboardingPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<WeatherPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [tempPreferences, setTempPreferences] = useState<WeatherPreferences>(defaultPreferences)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load preferences from localStorage for now
    const savedPrefs = localStorage.getItem('16bit-weather-preferences')
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs)
        setTempPreferences({ ...defaultPreferences, ...parsed })
      } catch (error) {
        console.error('Failed to parse preferences:', error)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && preferences) {
      setTempPreferences(preferences)
    }
  }, [isLoading, preferences])

  const handlePreferenceChange = (key: keyof WeatherPreferences, value: any) => {
    setTempPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save preferences to localStorage for now
      localStorage.setItem('16bit-weather-preferences', JSON.stringify(tempPreferences))
      router.push('/weather')
    }
  }

  const handleSkip = () => {
    router.push('/weather')
  }

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400">
        <NavBar />
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-cyan-600 font-mono">LOADING PREFERENCES...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 font-mono border-b-2 border-cyan-500 pb-4">
              SYSTEM CONFIGURATION
            </h1>
            <p className="text-lg text-cyan-300">
              Configure your 16-bit weather experience
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-cyan-600 mb-2">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-900 border-2 border-cyan-500 p-8 rounded-lg mb-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 font-mono text-cyan-400">
                  Step 1: Visual Theme
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'dark', name: 'Dark Terminal', desc: 'Classic green-on-black terminal' },
                    { id: 'miami', name: 'Miami Vice', desc: 'Neon pink and cyan aesthetic' },
                    { id: 'tron', name: 'Tron Grid', desc: 'Blue grid with glowing effects' }
                  ].map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        tempPreferences.theme === theme.id
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-gray-600 hover:border-cyan-600'
                      }`}
                      onClick={() => handlePreferenceChange('theme', theme.id)}
                    >
                      <h3 className="font-bold mb-2">{theme.name}</h3>
                      <p className="text-sm text-cyan-300">{theme.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 font-mono text-cyan-400">
                  Step 2: Units & Measurements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Temperature</label>
                    <select
                      value={tempPreferences.units.temperature}
                      onChange={(e) => handlePreferenceChange('units', {
                        ...tempPreferences.units,
                        temperature: e.target.value
                      })}
                      className="w-full p-2 bg-black border border-cyan-500 text-cyan-400 rounded"
                    >
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                      <option value="celsius">Celsius (°C)</option>
                      <option value="kelvin">Kelvin (K)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Wind Speed</label>
                    <select
                      value={tempPreferences.units.windSpeed}
                      onChange={(e) => handlePreferenceChange('units', {
                        ...tempPreferences.units,
                        windSpeed: e.target.value
                      })}
                      className="w-full p-2 bg-black border border-cyan-500 text-cyan-400 rounded"
                    >
                      <option value="mph">Miles per hour (mph)</option>
                      <option value="kmh">Kilometers per hour (km/h)</option>
                      <option value="ms">Meters per second (m/s)</option>
                      <option value="knots">Knots</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 font-mono text-cyan-400">
                  Step 3: Display Options
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold">Scan Lines Effect</label>
                    <input
                      type="checkbox"
                      checked={tempPreferences.display.scanLines}
                      onChange={(e) => handlePreferenceChange('display', {
                        ...tempPreferences.display,
                        scanLines: e.target.checked
                      })}
                      className="w-4 h-4 text-cyan-500 bg-black border-cyan-500 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold">Sound Effects</label>
                    <input
                      type="checkbox"
                      checked={tempPreferences.display.soundEffects}
                      onChange={(e) => handlePreferenceChange('display', {
                        ...tempPreferences.display,
                        soundEffects: e.target.checked
                      })}
                      className="w-4 h-4 text-cyan-500 bg-black border-cyan-500 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Font Size</label>
                    <select
                      value={tempPreferences.display.fontSize}
                      onChange={(e) => handlePreferenceChange('display', {
                        ...tempPreferences.display,
                        fontSize: e.target.value
                      })}
                      className="w-full p-2 bg-black border border-cyan-500 text-cyan-400 rounded"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 font-mono text-cyan-400">
                  Step 4: Notifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold">Weather Alerts</label>
                    <input
                      type="checkbox"
                      checked={tempPreferences.notifications.weatherAlerts}
                      onChange={(e) => handlePreferenceChange('notifications', {
                        ...tempPreferences.notifications,
                        weatherAlerts: e.target.checked
                      })}
                      className="w-4 h-4 text-cyan-500 bg-black border-cyan-500 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold">Browser Notifications</label>
                    <input
                      type="checkbox"
                      checked={tempPreferences.notifications.browser}
                      onChange={(e) => handlePreferenceChange('notifications', {
                        ...tempPreferences.notifications,
                        browser: e.target.checked
                      })}
                      className="w-4 h-4 text-cyan-500 bg-black border-cyan-500 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Alert Severity</label>
                    <select
                      value={tempPreferences.notifications.severity}
                      onChange={(e) => handlePreferenceChange('notifications', {
                        ...tempPreferences.notifications,
                        severity: e.target.value
                      })}
                      className="w-full p-2 bg-black border border-cyan-500 text-cyan-400 rounded"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleSkip}
              className="px-6 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono text-sm transition-all duration-200"
            >
              SKIP SETUP
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-cyan-500 text-black hover:bg-cyan-400 font-mono text-sm transition-all duration-200"
            >
              {currentStep === 4 ? 'COMPLETE SETUP' : 'NEXT STEP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

console.log('Onboarding type:', typeof OnboardingPage); 