/**
 * POST /api/visitors/deny
 * Denies a visitor — proxied to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api';
import type { DenyPayload } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: DenyPayload = await request.json();

    if (!body.visitor_id) {
      return NextResponse.json(
        { ok: false, error: 'Missing visitor_id' },
        { status: 400 }
      );
    }

    // Backend expects { approval_id, reason? }
    const data = await backendFetch('/api/visitors/deny', {
      method: 'POST',
      body: JSON.stringify({
        approval_id: Number(body.visitor_id),
      }),
    });

    return NextResponse.json({
      ok: true,
      visitor_id: body.visitor_id,
      ...data as object,
    });
  } catch (error) {
    console.error('Deny failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Deny request failed' },
      { status: 500 }
    );
  }
}
