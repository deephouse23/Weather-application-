'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { WeatherPreferences, defaultPreferences } from '@/types/user'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState<WeatherPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 4

  const savePreferences = async () => {
    setIsLoading(true)
    try {
      await user?.update({
        unsafeMetadata: { 
          ...user.unsafeMetadata,
          weatherPreferences: preferences,
          onboardingCompleted: true
        }
      })
      router.push('/weather')
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
    setIsLoading(false)
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      savePreferences()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono p-4 crt-scanlines">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 crt-flicker">
          <pre className="text-cyan-400 text-xs leading-none">
{`███████╗███████╗████████╗██╗   ██╗██████╗ 
██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
███████╗█████╗     ██║   ██║   ██║██████╔╝
╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ 
███████║███████╗   ██║   ╚██████╔╝██║     
╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝`}
          </pre>
          <div className="text-cyan-600 text-xs mt-4">
            WEATHER STATION CONFIGURATION PROTOCOL
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="text-xs mb-2 text-cyan-400">
            STEP {step} OF {totalSteps} [{Array(step).fill('█').join('')}{Array(totalSteps - step).fill('░').join('')}] {Math.round((step / totalSteps) * 100)}%
          </div>
          <div className="w-full bg-black border border-cyan-500 h-2">
            <div 
              className="bg-cyan-500 h-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-black border-2 border-cyan-500 p-6 mb-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg mb-4">SELECT DEFAULT LOCATION</h2>
              <input
                type="text"
                value={preferences.defaultLocation}
                onChange={(e) => setPreferences({...preferences, defaultLocation: e.target.value})}
                placeholder="Enter city, state, or ZIP code"
                className="w-full bg-black border border-cyan-500 text-cyan-400 p-3 font-mono"
              />
              <div className="text-xs text-cyan-600 mt-2">
                Examples: "New York, NY", "90210", "London, UK"
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg mb-4">CHOOSE TERMINAL THEME</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'dark-terminal', name: 'Dark Terminal', color: '#00ffff' },
                  { id: 'miami-vice', name: 'Miami Vice', color: '#ff00ff' },
                  { id: 'tron-grid', name: 'Tron Grid', color: '#8fe0ff' },
                  { id: 'amber-monitor', name: 'Amber Monitor', color: '#ffaa00' }
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setPreferences({...preferences, theme: theme.id as any})}
                    className={`p-4 border-2 transition-all ${
                      preferences.theme === theme.id 
                        ? 'border-cyan-300 bg-cyan-500/10' 
                        : 'border-cyan-500 hover:border-cyan-300'
                    }`}
                    style={{ borderColor: theme.color }}
                  >
                    <div className="text-sm font-mono" style={{ color: theme.color }}>
                      {theme.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg mb-4">CONFIGURE UNITS</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Temperature:</label>
                  <select 
                    value={preferences.units.temperature}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      units: {...preferences.units, temperature: e.target.value as any}
                    })}
                    className="w-full bg-black border border-cyan-500 text-cyan-400 p-2 font-mono"
                  >
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="celsius">Celsius (°C)</option>
                    <option value="kelvin">Kelvin (K)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Wind Speed:</label>
                  <select 
                    value={preferences.units.windSpeed}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      units: {...preferences.units, windSpeed: e.target.value as any}
                    })}
                    className="w-full bg-black border border-cyan-500 text-cyan-400 p-2 font-mono"
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

          {step === 4 && (
            <div>
              <h2 className="text-lg mb-4">DISPLAY PREFERENCES</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>CRT Scan Lines:</span>
                  <button
                    onClick={() => setPreferences({
                      ...preferences, 
                      display: {...preferences.display, scanLines: !preferences.display.scanLines}
                    })}
                    className={`px-4 py-2 border ${
                      preferences.display.scanLines 
                        ? 'border-cyan-300 bg-cyan-500/20' 
                        : 'border-cyan-500'
                    }`}
                  >
                    {preferences.display.scanLines ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Sound Effects:</span>
                  <button
                    onClick={() => setPreferences({
                      ...preferences, 
                      display: {...preferences.display, soundEffects: !preferences.display.soundEffects}
                    })}
                    className={`px-4 py-2 border ${
                      preferences.display.soundEffects 
                        ? 'border-cyan-300 bg-cyan-500/20' 
                        : 'border-cyan-500'
                    }`}
                  >
                    {preferences.display.soundEffects ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm mb-2">Data Refresh Interval:</label>
                  <select 
                    value={preferences.display.refreshInterval}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      display: {...preferences.display, refreshInterval: parseInt(e.target.value) as any}
                    })}
                    className="w-full bg-black border border-cyan-500 text-cyan-400 p-2 font-mono"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 border border-cyan-500 text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ◄ PREVIOUS
          </button>
          
          <button
            onClick={nextStep}
            disabled={isLoading}
            className="px-6 py-3 bg-cyan-500 text-black font-mono uppercase tracking-wider disabled:opacity-50"
          >
            {isLoading ? 'SAVING...' : step === totalSteps ? 'COMPLETE SETUP' : 'NEXT ►'}
          </button>
        </div>
      </div>
    </div>
  )
} 