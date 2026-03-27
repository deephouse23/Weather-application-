/**
 * Unit tests for SPC Outlook Tabs Component
 */

describe('SPCOutlookTabs component', () => {
  it('should export a default function component', async () => {
    const mod = await import('@/components/severe/SPCOutlookTabs');
    expect(typeof mod.default).toBe('function');
  });
});
