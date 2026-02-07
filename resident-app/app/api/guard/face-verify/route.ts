/**
 * POST /api/guard/face-verify
 * Proxies face verification (compare two photos) to the FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo1 = formData.get('photo1');
    const photo2 = formData.get('photo2');

    if (!photo1 || !photo2) {
      return NextResponse.json(
        { ok: false, error: 'Two photos are required' },
        { status: 400 }
      );
    }

    const backendForm = new FormData();
    backendForm.append('photo1', photo1);
    backendForm.append('photo2', photo2);

    const res = await fetch(`${BACKEND_URL}/api/face/verify`, {
      method: 'POST',
      body: backendForm,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { ok: false, error: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error('Face verify failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Face verification failed' },
      { status: 500 }
    );
  }
}
