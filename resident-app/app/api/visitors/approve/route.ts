/**
 * POST /api/visitors/approve
 * Approves a visitor with a validity window
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApprovePayload } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ApprovePayload = await request.json();
    
    // Validate payload
    if (!body.visitor_id || !body.valid_until) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mock approval logic
    console.log(`Approved visitor ${body.visitor_id} until ${body.valid_until}`);

    return NextResponse.json({
      ok: true,
      visitor_id: body.visitor_id,
      valid_until: body.valid_until
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
