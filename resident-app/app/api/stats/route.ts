/**
 * GET /api/stats
 * Returns dashboard statistics — proxied from FastAPI backend
 */

import { NextResponse } from 'next/server';
import { backendFetch, DEMO_RESIDENT_ID } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface ScheduleResponse {
  total_count: number;
  pending_count: number;
  approved_count: number;
  visitors: Array<{ status: string }>;
}

export async function GET() {
  try {
    const data = await backendFetch<ScheduleResponse>(
      `/api/residents/${DEMO_RESIDENT_ID}/schedule-today`
    );

    const onPremises = data.visitors?.filter(
      (v) => v.status === 'approved'
    ).length ?? 0;

    return NextResponse.json({
      today: data.total_count ?? 0,
      pending: data.pending_count ?? 0,
      approved: data.approved_count ?? 0,
      onPremises,
    });
  } catch (err) {
    console.error('Stats fetch failed:', err);
    return NextResponse.json({ today: 0, pending: 0, approved: 0, onPremises: 0 });
  }
}
