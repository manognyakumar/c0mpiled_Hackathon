/**
 * POST /api/visitors/approve
 * Approves a visitor — proxied to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api';
import type { ApprovePayload } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ApprovePayload = await request.json();

    if (!body.visitor_id || !body.valid_until) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Backend expects { approval_id, valid_until }
    const data = await backendFetch('/api/visitors/approve', {
      method: 'POST',
      body: JSON.stringify({
        approval_id: Number(body.visitor_id),
        valid_until: body.valid_until,
      }),
    });

    return NextResponse.json({
      ok: true,
      visitor_id: body.visitor_id,
      valid_until: body.valid_until,
      ...data as object,
    });
  } catch (error) {
    console.error('Approve failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Approve request failed' },
      { status: 500 }
    );
  }
}
