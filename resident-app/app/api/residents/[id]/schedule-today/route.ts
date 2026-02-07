/**
 * GET /api/residents/[id]/schedule-today
 * Returns today's visitor schedule — proxied from FastAPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api';
import type { Visitor, VisitorStatus } from '@/lib/types';

interface BackendScheduleVisitor {
  approval_id: number;
  visitor_id: number;
  visitor_name: string;
  purpose: string | null;
  photo_url: string | null;
  status: string;
  valid_from: string | null;
  valid_until: string | null;
  approval_method: string;
}

interface BackendScheduleResponse {
  resident_id: number;
  resident_name: string;
  apt_number: string;
  date: string;
  visitors: BackendScheduleVisitor[];
  total_count: number;
  pending_count: number;
  approved_count: number;
}

/** Map backend status to frontend VisitorStatus */
function mapStatus(backendStatus: string): VisitorStatus {
  switch (backendStatus) {
    case 'approved': return 'APPROVED';
    case 'pending':  return 'PENDING';
    case 'denied':   return 'DENIED';
    case 'expired':  return 'EXPIRED';
    default:         return 'PENDING';
  }
}

/** Format datetime range into a time window string */
function formatTimeWindow(from: string | null, until: string | null): string {
  if (!from && !until) return 'All day';
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const start = from ? fmt(from) : '??';
  const end = until ? fmt(until) : '??';
  return `${start}\u2013${end}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const residentId = params.id;
    const data = await backendFetch<BackendScheduleResponse>(
      `/api/residents/${residentId}/schedule-today`
    );

    const visitors: Visitor[] = (data.visitors ?? []).map((v) => ({
      id: String(v.visitor_id),
      name: v.visitor_name,
      time_window: formatTimeWindow(v.valid_from, v.valid_until),
      status: mapStatus(v.status),
      purpose: v.purpose ?? undefined,
      photo_url: v.photo_url ?? undefined,
    }));

    return NextResponse.json({
      visitors,
      resident_id: residentId,
    });
  } catch (err) {
    console.error('Schedule-today fetch failed:', err);
    return NextResponse.json({ visitors: [], resident_id: params.id });
  }
}
