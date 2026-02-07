/**
 * POST /api/voice/process
 * Processes audio input — proxied to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, DEMO_RESIDENT_ID } from '@/lib/api';
import type { VoiceProcessingResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json(
        { ok: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Forward the form data to the backend
    const backendForm = new FormData();
    backendForm.append('audio', audioFile);
    backendForm.append('resident_id', DEMO_RESIDENT_ID);

    const res = await fetch(`${BACKEND_URL}/api/voice/process`, {
      method: 'POST',
      body: backendForm,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      console.error('Voice backend error:', errText);
      return NextResponse.json(
        { ok: false, error: 'Backend processing failed', transcript: '' },
        { status: 502 }
      );
    }

    const data = await res.json();

    const response: VoiceProcessingResponse = {
      ok: data.success ?? true,
      transcript: data.transcript ?? '',
      locale_guess: data.language === 'ar' ? 'ar' : 'en',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Voice process failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Processing failed', transcript: '' },
      { status: 500 }
    );
  }
}
