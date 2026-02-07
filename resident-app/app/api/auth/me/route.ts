/**
 * GET /api/auth/me — Proxy to FastAPI /api/auth/me.
 */
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';

    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Unauthorized' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
