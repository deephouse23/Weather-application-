import { NextRequest, NextResponse } from 'next/server';
import {
  fetchSPCOutlook,
  type SPCOutlookDay,
  type SPCOutlookType,
} from '@/lib/services/spc-outlook-service';

const VALID_TYPES = new Set(['cat', 'torn', 'hail', 'wind']);

export async function GET(request: NextRequest) {
  try {
    const dayParam = request.nextUrl.searchParams.get('day') ?? '1';
    const typeParam = request.nextUrl.searchParams.get('type') ?? 'cat';

    if (!/^[123]$/.test(dayParam)) {
      return NextResponse.json({ error: 'day must be 1, 2, or 3' }, { status: 400 });
    }
    const day = Number(dayParam) as SPCOutlookDay;

    if (!VALID_TYPES.has(typeParam)) {
      return NextResponse.json({ error: 'type must be cat, torn, hail, or wind' }, { status: 400 });
    }

    const geojson = await fetchSPCOutlook(day, typeParam as SPCOutlookType);

    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[SPC Outlook API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch SPC outlook data' },
      { status: 500 }
    );
  }
}
