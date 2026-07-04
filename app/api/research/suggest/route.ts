import { NextRequest, NextResponse } from 'next/server';

import { buildRealtimeSuggestions } from '@/lib/research/query-intelligence';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query')?.trim() ?? '';
  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = buildRealtimeSuggestions(query);
  return NextResponse.json({ suggestions });
}
