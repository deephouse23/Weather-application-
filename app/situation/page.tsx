/**
 * 16-Bit Weather Platform - Current Situation Page
 *
 * Live weather intelligence dashboard showing WIS score,
 * active NWS alerts, and severity breakdown. Page shell is server-rendered
 * (for SEO metadata); live polling lives in <SituationDashboard/>.
 */
import type { Metadata } from 'next';
import PageWrapper from '@/components/page-wrapper';
import SituationDashboard from './situation-dashboard';

const BASE_URL = 'https://www.16bitweather.co';

export const metadata: Metadata = {
  title: 'The Current Situation — Live NWS Alerts & WIS Score | 16 Bit Weather',
  description:
    'Real-time US weather intelligence: NWS warnings, watches, advisories, and the 16 Bit Weather Intensity Score. Auto-refreshes every 5 minutes.',
  alternates: { canonical: `${BASE_URL}/situation` },
};

export default function SituationPage() {
  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono uppercase">
            The Current Situation
          </h1>
          <p className="text-sm font-mono text-muted-foreground tracking-wider">
            // LIVE WEATHER INTELLIGENCE // NWS ALERTS // UPDATED EVERY 5 MIN
          </p>
        </div>

        {/* Live dashboard leaf — client-only */}
        <SituationDashboard />
      </div>
    </PageWrapper>
  );
}
