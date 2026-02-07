/**
 * GET /api/guard/search?query=...
 * Proxies guard visitor search to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api';

interface BackendSearchResult {
  visitor_id: number;
  name: string;
  phone: string | null;
  photo_url: string | null;
  latest_approval: {
    approval_id: number;
    status: string;
    is_valid_now: boolean;
    valid_until: string | null;
    apt_number: string | null;
  } | null;
}

interface BackendSearchResponse {
  results: BackendSearchResult[];
  count: number;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');

  if (!query?.trim()) {
    return NextResponse.json({ results: [], count: 0 });
  }

  try {
    const data = await backendFetch<BackendSearchResponse>(
      `/api/guards/search?query=${encodeURIComponent(query)}`
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error('Guard search failed:', err);
    return NextResponse.json({ results: [], count: 0 });
  }
}
