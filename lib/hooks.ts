/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for debounced search input with improved rate limiting
 * @param callback Function to call after debounce delay
 * @param delay Debounce delay in milliseconds
 * @param minLength Minimum length required before triggering search
 * @returns [value, setValue] - Current value and setter function
 */
export function useDebounce<T>(
  callback: (value: T) => void, 
  delay: number = 500, 
  minLength: number = 3
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>({} as T)
  const lastCalledValue = useRef<T | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Only proceed if value meets minimum length requirement
    if (typeof value === 'string' && value.length >= minLength) {
      timeoutRef.current = setTimeout(() => {
        // Prevent duplicate API calls for the same value
        if (JSON.stringify(value) !== JSON.stringify(lastCalledValue.current)) {
          lastCalledValue.current = value
          callback(value)
        }
      }, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, callback, minLength])

  return [value, setValue]
}

/**
 * Custom hook for memoized calculations
 * @param callback Function to memoize
 * @param dependencies Array of dependencies
 * @returns Memoized value
 */
export function useMemoizedCalculation<T>(
  callback: () => T,
  dependencies: any[]
): T {
  return useCallback(callback, dependencies)()
}

/**
 * Custom hook for lazy loading components
 * @param importFn Dynamic import function
 * @returns [Component, loading, error] - Component, loading state, and error state
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): [T | null, boolean, Error | null] {
  const [Component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    importFn()
      .then((module) => {
        setComponent(() => module.default)
        setError(null)
      })
      .catch((err) => {
        setError(err)
        setComponent(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [importFn])

  return [Component, loading, error]
}

/**
 * Custom hook for offline detection
 * @returns [isOffline, lastOnline] - Offline status and last online timestamp
 */
export function useOfflineDetection(): [boolean, number] {
  const [isOffline, setIsOffline] = useState(false)
  const [lastOnline, setLastOnline] = useState(Date.now())

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setLastOnline(Date.now())
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return [isOffline, lastOnline]
}

/**
 * Custom hook for retry mechanism
 * @param callback Function to retry
 * @param maxRetries Maximum number of retries
 * @param delay Delay between retries in milliseconds
 * @returns [execute, loading, error] - Execute function, loading state, and error state
 */
export function useRetry<T>(
  callback: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): [() => Promise<T>, boolean, Error | null] {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = async () => {
    setLoading(true)
    setError(null)

    let retries = 0
    while (retries < maxRetries) {
      try {
        const result = await callback()
        setLoading(false)
        return result
      } catch (err) {
        retries++
        if (retries === maxRetries) {
          setError(err instanceof Error ? err : new Error('Failed after retries'))
          setLoading(false)
          throw err
        }
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new Error('Failed after retries')
  }

  return [execute, loading, error]
} 