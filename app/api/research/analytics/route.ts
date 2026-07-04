import { NextResponse } from 'next/server';

import { getResearchAnalytics } from '@/lib/research/analytics';

export async function GET() {
  return NextResponse.json({ analytics: getResearchAnalytics() });
}
