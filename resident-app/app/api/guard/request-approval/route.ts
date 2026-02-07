/**
 * POST /api/guard/request-approval
 * Guard sends an approval request to a resident — proxied to FastAPI backend.
 * Optionally includes a captured face photo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const visitorName = formData.get('visitor_name') as string;
    const purpose = formData.get('purpose') as string;
    const aptNumber = formData.get('apt_number') as string;
    const visitorPhone = formData.get('visitor_phone') as string | null;
    const photo = formData.get('photo') as File | null;

    if (!visitorName || !purpose || !aptNumber) {
      return NextResponse.json(
        { ok: false, error: 'Visitor name, purpose, and apartment number are required' },
        { status: 400 }
      );
    }

    // Step 1: If photo provided, run face detection first
    let faceDetected = false;
    let photoFilename: string | null = null;

    if (photo && photo.size > 0) {
      const detectForm = new FormData();
      detectForm.append('photo', photo);

      const detectRes = await fetch(`${BACKEND_URL}/api/face/detect`, {
        method: 'POST',
        body: detectForm,
      });

      if (detectRes.ok) {
        const detectData = await detectRes.json();
        faceDetected = detectData.detected;
      }
    }

    // Step 2: Create approval request via backend
    const payload = {
      visitor_name: visitorName,
      visitor_phone: visitorPhone || null,
      purpose,
      apt_number: aptNumber,
    };

    const approvalRes = await fetch(`${BACKEND_URL}/api/visitors/request-approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!approvalRes.ok) {
      const errText = await approvalRes.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { ok: false, error: errText },
        { status: approvalRes.status }
      );
    }

    const approvalData = await approvalRes.json();

    // Step 3: If we have a photo and a visitor_id, save the photo
    if (photo && photo.size > 0 && approvalData.visitor_id) {
      try {
        const captureForm = new FormData();
        captureForm.append('photo', photo);
        captureForm.append('visitor_id', String(approvalData.visitor_id));

        await fetch(`${BACKEND_URL}/api/face/capture`, {
          method: 'POST',
          body: captureForm,
        });
      } catch {
        // Photo save is best-effort, don't fail the whole request
      }
    }

    return NextResponse.json({
      ok: true,
      face_detected: faceDetected,
      approval_id: approvalData.id,
      visitor_id: approvalData.visitor_id,
      status: approvalData.status,
    });
  } catch (error) {
    console.error('Guard request-approval failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create approval request' },
      { status: 500 }
    );
  }
}
