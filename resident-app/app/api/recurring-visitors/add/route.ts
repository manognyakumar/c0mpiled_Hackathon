/**
 * POST /api/recurring-visitors/add
 * Creates a new recurring visitor — proxied to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, DEMO_RESIDENT_ID } from '@/lib/api';

interface AddRecurringBody {
  name: string;
  schedule: string;
  time_window: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddRecurringBody = await request.json();

    if (!body.name || !body.schedule || !body.time_window) {
      return NextResponse.json(
        { ok: false, error: 'Name, schedule, and time window are required' },
        { status: 400 }
      );
    }

    const payload = {
      resident_id: Number(DEMO_RESIDENT_ID),
      name: body.name,
      schedule: body.schedule,
      time_window: body.time_window,
    };

    const data = await backendFetch('/api/recurring-visitors/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ ok: true, ...(data as object) });
  } catch (error) {
    console.error('Add recurring visitor failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to add recurring visitor' },
      { status: 500 }
    );
  }
}
