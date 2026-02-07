/**
 * GET /api/approval-requests
 * Returns pending visitor approval requests — proxied from FastAPI
 */

import { NextResponse } from 'next/server';
import { backendFetch, DEMO_RESIDENT_ID } from '@/lib/api';
import type { ApprovalRequest } from '@/lib/types';

interface BackendApproval {
  approval_id: number;
  visitor_id: number;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  photo_url: string | null;
  created_at: string;
  approval_method: string;
}

interface BackendPendingResponse {
  resident_id: number;
  pending_count: number;
  approvals: BackendApproval[];
}

export async function GET() {
  try {
    const data = await backendFetch<BackendPendingResponse>(
      `/api/residents/${DEMO_RESIDENT_ID}/pending-approvals`
    );

    // Transform backend shape to frontend shape
    const requests: ApprovalRequest[] = (data.approvals ?? []).map((a) => ({
      id: String(a.approval_id),
      name: a.visitor_name,
      purpose: a.purpose ?? 'Visit',
      requested_at: a.created_at,
      photo_url: a.photo_url ?? undefined,
    }));

    return NextResponse.json({ requests });
  } catch (err) {
    console.error('Approval-requests fetch failed:', err);
    return NextResponse.json({ requests: [] });
  }
}
