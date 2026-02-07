/**
 * GET /api/guard/expected-today
 * Returns visitors expected today — proxied from FastAPI backend
 */

import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface BackendExpectedResponse {
  date: string;
  total_expected: number;
  pending: Array<{
    approval_id: number;
    status: string;
    visitor_name: string;
    purpose: string | null;
    photo_url: string | null;
    apt_number: string;
    resident_name: string;
    valid_from: string | null;
    valid_until: string | null;
    created_at: string;
  }>;
  pending_count: number;
  approved: Array<{
    approval_id: number;
    status: string;
    visitor_name: string;
    purpose: string | null;
    photo_url: string | null;
    apt_number: string;
    resident_name: string;
    valid_from: string | null;
    valid_until: string | null;
    created_at: string;
  }>;
  approved_count: number;
}

export async function GET() {
  try {
    const data = await backendFetch<BackendExpectedResponse>(
      '/api/guards/expected-today'
    );

    // Combine and transform for the frontend
    const arrivals = [
      ...(data.approved ?? []),
      ...(data.pending ?? []),
    ].map((v) => ({
      name: v.visitor_name,
      apt: v.apt_number,
      time: v.valid_from
        ? new Date(v.valid_from).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : '--:--',
      status: v.status,
    }));

    return NextResponse.json({ arrivals, count: data.total_expected ?? 0 });
  } catch (err) {
    console.error('Expected-today fetch failed:', err);
    return NextResponse.json({ arrivals: [], count: 0 });
  }
}
