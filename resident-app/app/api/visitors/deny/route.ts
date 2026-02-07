/**
 * POST /api/visitors/deny
 * Denies a visitor approval request
 */

import { NextRequest, NextResponse } from 'next/server';
import type { DenyPayload } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: DenyPayload = await request.json();
    
    // Validate payload
    if (!body.visitor_id) {
      return NextResponse.json(
        { ok: false, error: 'Missing visitor_id' },
        { status: 400 }
      );
    }

    // Mock deny logic
    console.log(`Denied visitor ${body.visitor_id}`);

    return NextResponse.json({
      ok: true,
      visitor_id: body.visitor_id
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
