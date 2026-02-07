/**
 * POST /api/guard/face-detect
 * Proxies face detection to the FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo');

    if (!photo) {
      return NextResponse.json(
        { ok: false, error: 'No photo provided' },
        { status: 400 }
      );
    }

    const backendForm = new FormData();
    backendForm.append('photo', photo);

    const res = await fetch(`${BACKEND_URL}/api/face/detect`, {
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
    console.error('Face detect failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Face detection failed' },
      { status: 500 }
    );
  }
}
