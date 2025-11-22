
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fetchWeatherData } from '@/lib/weather-api';

// Setup code (simplified for this test)
const g = globalThis as unknown as {
    window: any;
    navigator: any;
    fetch: any;
    localStorage: any;
};
if (!g.window) g.window = {} as any;
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(g.window, 'localStorage', { value: localStorageMock, configurable: true });
Object.defineProperty(g, 'localStorage', { value: localStorageMock, configurable: true });
if (!g.fetch) { g.fetch = jest.fn(); } else { g.fetch = jest.fn(g.fetch); }

describe('Weather API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    test('fetchWeatherData should handle valid city input', async () => {
        try {
            // 1. Geocoding Mock Response
            const mockGeoResponse = {
                ok: true,
                json: async () => ([{
                    name: 'San Francisco',
                    lat: 37.7749,
                    lon: -122.4194,
                    country: 'US',
                    state: 'California'
                }])
            } as Response;

            // 2. Weather Data Mock Response (One Call)
            const mockWeatherResponse = {
                ok: true,
                json: async () => ({
                    timezone: 'America/Los_Angeles',
                    current: {
                        dt: 1642680000,
                        temp: 72,
                        humidity: 65,
                        pressure: 1013,
                        weather: [{ main: 'Clear', description: 'Clear sky' }],
                        wind_speed: 10,
                        wind_deg: 315,
                        sunrise: 1642680300,
                        sunset: 1642719000,
                        uvi: 5
                    },
                    daily: Array(5).fill({
                        dt: 1642680000,
                        temp: { max: 75, min: 60 },
                        weather: [{ main: 'Clear', description: 'Clear sky' }],
                        humidity: 60,
                        wind_speed: 12,
                        wind_deg: 270,
                        pressure: 1015,
                        clouds: 10,
                        pop: 0.1,
                        uvi: 7
                    }),
                    hourly: Array(48).fill({
                        dt: 1642680000,
                        temp: 72,
                        weather: [{ main: 'Clear', description: 'Clear sky' }],
                        pop: 0
                    })
                })
            } as Response;

            // 3. Pollen Mock Response
            const mockPollenResponse = {
                ok: true,
                json: async () => ({
                    tree: { 'Oak': 'Low' },
                    grass: { 'Grass': 'Moderate' },
                    weed: { 'Ragweed': 'Low' }
                })
            } as Response;

            // 4. Air Quality Mock Response
            const mockAqiResponse = {
                ok: true,
                json: async () => ({
                    aqi: 45,
                    category: 'Good',
                    source: 'Mock'
                })
            } as Response;

            // Chain the mocks
            (g.fetch as jest.Mock)
                .mockResolvedValueOnce(mockGeoResponse)
                .mockResolvedValueOnce(mockWeatherResponse)
                .mockResolvedValueOnce(mockPollenResponse)
                .mockResolvedValueOnce(mockAqiResponse);

            const result = await fetchWeatherData('San Francisco', 'test_api_key');

            expect(result).toBeDefined();
            expect(result?.location).toContain('San Francisco');
            expect(result?.temperature).toBe(72);
            expect(result?.condition).toBe('Clear');
        } catch (error) {
            console.error('TEST FAILED WITH ERROR:', error);
            throw error;
        }
    });
});
