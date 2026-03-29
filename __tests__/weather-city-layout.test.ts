/**
 * Unit tests for weather/[city]/layout.tsx metadata generation
 * Verifies that transient API failures don't flood Sentry
 */

// Mock modules before imports
jest.mock('@/lib/weather', () => ({
  fetchWeatherData: jest.fn()
}))

jest.mock('@/lib/error-utils', () => ({
  captureError: jest.fn()
}))

import { generateMetadata } from '@/app/weather/[city]/layout'
import { fetchWeatherData } from '@/lib/weather'
import { captureError } from '@/lib/error-utils'

const mockFetchWeatherData = fetchWeatherData as jest.MockedFunction<typeof fetchWeatherData>
const mockCaptureError = captureError as jest.MockedFunction<typeof captureError>

afterEach(() => {
  jest.clearAllMocks()
})

describe('generateMetadata', () => {
  const makeParams = (city: string) => Promise.resolve({ city })

  it('should not call captureError for transient API failures in metadata fetch', async () => {
    mockFetchWeatherData.mockRejectedValue(new Error('Geocoding API error: 401'))

    const metadata = await generateMetadata({ params: makeParams('reno-nv') })

    // Should still return valid metadata
    expect(metadata.title).toContain('Reno Nv')
    expect(metadata.description).toBeDefined()

    // Should NOT send transient API errors to Sentry - this is non-critical metadata enhancement
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  it('should return enhanced metadata when weather fetch succeeds', async () => {
    mockFetchWeatherData.mockResolvedValue({
      temperature: 72,
      unit: '°F',
      condition: 'Clear',
      forecast: [],
    } as never)

    const metadata = await generateMetadata({ params: makeParams('reno-nv') })

    expect(metadata.description).toContain('72')
    expect(metadata.description).toContain('Clear')
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  it('should call captureError for non-401 metadata fetch failures', async () => {
    mockFetchWeatherData.mockRejectedValue(new Error('Upstream timeout'))

    const metadata = await generateMetadata({ params: makeParams('reno-nv') })

    expect(metadata.title).toContain('Reno Nv')
    expect(mockCaptureError).toHaveBeenCalled()
  })
})
