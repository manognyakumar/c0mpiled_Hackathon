/**
 * POST /api/voice/process
 * Processes audio input and returns transcript
 */

import { NextRequest, NextResponse } from 'next/server';
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

    // Mock voice processing
    // In a real app, this would send audio to a speech-to-text service
    const mockTranscripts = [
      'Approve delivery for Ahmed at 10am',
      'Accept the visitor Sarah Johnson',
      'موافقة على الزائر أحمد',
      'Deny the maintenance request'
    ];

    const randomTranscript = mockTranscripts[
      Math.floor(Math.random() * mockTranscripts.length)
    ];

    const isArabic = randomTranscript.includes('موافقة') || randomTranscript.includes('أحمد');

    const response: VoiceProcessingResponse = {
      ok: true,
      transcript: randomTranscript,
      locale_guess: isArabic ? 'ar' : 'en'
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Processing failed', transcript: '' },
      { status: 500 }
    );
  }
}
