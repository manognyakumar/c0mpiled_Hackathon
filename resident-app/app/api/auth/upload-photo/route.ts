/**
 * POST /api/auth/upload-photo — Proxy to FastAPI.
 */
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const formData = await req.formData();

    const res = await fetch(`${BACKEND_URL}/api/auth/upload-photo`, {
      method: 'POST',
      headers: { Authorization: auth },
      body: formData,
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to upload photo' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
