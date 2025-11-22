
import { describe, test, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom';

// ---------- Global/test environment shims ----------

// Make sure window exists for TypeScript
const g = globalThis as unknown as {
    window: any;
    navigator: any;
    fetch: any;
    localStorage: any;
};

// jsdom provides window, but we ensure it's accessible
if (!g.window) g.window = {} as any;

// Minimal Storage-like mock with TS-friendly typing
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(g.window, 'localStorage', {
    value: localStorageMock,
    configurable: true
});
Object.defineProperty(g, 'localStorage', {
    value: localStorageMock,
    configurable: true
});

// Ensure fetch exists and is mockable
if (!g.fetch) {
    g.fetch = jest.fn();
} else {
    g.fetch = jest.fn(g.fetch);
}

// Provide a configurable geolocation stub on navigator
if (!g.navigator) g.navigator = {} as any;
if (!g.navigator.geolocation) {
    Object.defineProperty(g.navigator, 'geolocation', {
        value: {
            getCurrentPosition: jest.fn(),
            watchPosition: jest.fn(),
            clearWatch: jest.fn()
        },
        configurable: true,
        writable: true
    });
}

describe('Debug Setup', () => {
    test('setup should not crash', () => {
        expect(true).toBe(true);
    });
});
