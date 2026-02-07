/**
 * GET /api/recurring-visitors
 * Returns list of recurring visitors — proxied from FastAPI
 */

import { NextResponse } from 'next/server';
import { backendFetch, DEMO_RESIDENT_ID } from '@/lib/api';
import type { RecurringVisitor } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface BackendRecurring {
  id: number;
  name: string;
  schedule: string;
  time_window: string;
  is_active: boolean;
  next_visit: string | null;
  created_at: string;
}

interface BackendRecurringResponse {
  recurring_visitors: BackendRecurring[];
  count: number;
}

/** Convert backend schedule strings to human-readable labels */
function formatSchedule(schedule: string, timeWindow: string): string {
  const s = schedule.toLowerCase().replace(/_/g, ' ');
  let label = s.replace('every ', '');
  // Capitalize first letters
  label = label.replace(/\b\w/g, (c) => c.toUpperCase());
  return `${label} ${timeWindow}`;
}

export async function GET() {
  try {
    const data = await backendFetch<BackendRecurringResponse>(
      `/api/recurring-visitors/?resident_id=${DEMO_RESIDENT_ID}`
    );

    const recurring: RecurringVisitor[] = (data.recurring_visitors ?? []).map((r) => ({
      id: String(r.id),
      name: r.name,
      role: r.schedule.replace(/_/g, ' '),
      recurrence_rule: formatSchedule(r.schedule, r.time_window),
      active: r.is_active,
    }));

    return NextResponse.json({ recurring });
  } catch (err) {
    console.error('Recurring-visitors fetch failed:', err);
    return NextResponse.json({ recurring: [] });
  }
}
