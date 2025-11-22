
import { describe, test, expect } from '@jest/globals';

// Uncomment one by one to find the crasher
import '@/lib/weather-api';
import '@/lib/location-service';
import '@/lib/user-cache-service';
import '@/lib/air-quality-utils';
import '@/components/weather-search';
import '@/components/forecast';
import '@/components/environmental-display';

describe('Debug Imports', () => {
    test('imports should work', () => {
        expect(true).toBe(true);
    });
});
