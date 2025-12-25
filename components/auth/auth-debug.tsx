'use client'

import { useAuth } from '@/lib/auth'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'

export default function AuthDebug() {
  const { user, session, profile, preferences, loading, isInitialized } = useAuth()
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'auth')

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={`fixed bottom-4 left-4 p-4 border-2 max-w-sm text-xs font-mono z-50 ${themeClasses.background} ${themeClasses.borderColor}`}>
      <h3 className={`font-bold mb-2 ${themeClasses.text}`}>AUTH DEBUG</h3>
      <div className="space-y-1">
        <div>
          <span className="font-semibold">Loading:</span> 
          <span className={loading ? 'text-yellow-400' : 'text-green-400'}> {loading.toString()}</span>
        </div>
        <div>
          <span className="font-semibold">Initialized:</span> 
          <span className={isInitialized ? 'text-green-400' : 'text-red-400'}> {isInitialized.toString()}</span>
        </div>
        <div>
          <span className="font-semibold">User:</span> 
          <span className={user ? 'text-green-400' : 'text-red-400'}> {user ? 'Present' : 'None'}</span>
        </div>
        <div>
          <span className="font-semibold">Session:</span> 
          <span className={session ? 'text-green-400' : 'text-red-400'}> {session ? 'Present' : 'None'}</span>
        </div>
        <div>
          <span className="font-semibold">Profile:</span> 
          <span className={profile ? 'text-green-400' : 'text-red-400'}> {profile ? 'Present' : 'None'}</span>
        </div>
        <div>
          <span className="font-semibold">Preferences:</span> 
          <span className={preferences ? 'text-green-400' : 'text-red-400'}> {preferences ? 'Present' : 'None'}</span>
        </div>
        {user && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div><span className="font-semibold">User ID:</span> {user.id.substring(0, 8)}...</div>
            <div><span className="font-semibold">Email:</span> {user.email}</div>
            {profile && (
              <div><span className="font-semibold">Username:</span> {profile.username}</div>
            )}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs opacity-70">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}