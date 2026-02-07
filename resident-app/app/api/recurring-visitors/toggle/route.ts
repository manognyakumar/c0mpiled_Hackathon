/**
 * PUT /api/recurring-visitors/toggle
 * Toggles a recurring visitor's active status — proxied to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api';

interface ToggleBody {
  id: number;
  is_active: boolean;
}

export async function PUT(request: NextRequest) {
  try {
    const body: ToggleBody = await request.json();

    if (body.id === undefined || body.is_active === undefined) {
      return NextResponse.json(
        { ok: false, error: 'id and is_active are required' },
        { status: 400 }
      );
    }

    const data = await backendFetch(`/api/recurring-visitors/${body.id}?is_active=${body.is_active}`, {
      method: 'PUT',
    });

    return NextResponse.json({ ok: true, ...(data as object) });
  } catch (error) {
    console.error('Toggle recurring visitor failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to toggle recurring visitor' },
      { status: 500 }
    );
  }
}
