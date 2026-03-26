/**
 * Unit tests for WMO weather interpretation codes
 */

import { getWMOCodeInfo } from '@/lib/wmo-codes';

describe('getWMOCodeInfo', () => {
  it('should return Clear Sky with sunny condition for code 0', () => {
    const info = getWMOCodeInfo(0);
    expect(info.description).toBe('Clear Sky');
    expect(info.condition).toBe('sunny');
  });
});
