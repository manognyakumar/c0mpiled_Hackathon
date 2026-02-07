/**
 * POST /api/visitors/add
 * Creates a new visitor approval request — proxied to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, DEMO_RESIDENT_ID } from '@/lib/api';

interface AddVisitorBody {
  visitor_name: string;
  visitor_phone?: string;
  purpose: string;
  apt_number?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddVisitorBody = await request.json();

    if (!body.visitor_name || !body.purpose) {
      return NextResponse.json(
        { ok: false, error: 'Name and purpose are required' },
        { status: 400 }
      );
    }

    // Default to demo resident's apartment if not provided
    const payload = {
      visitor_name: body.visitor_name,
      visitor_phone: body.visitor_phone || null,
      purpose: body.purpose,
      apt_number: body.apt_number || '501', // Demo resident's apt
    };

    const data = await backendFetch('/api/visitors/request-approval', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ ok: true, ...(data as object) });
  } catch (error) {
    console.error('Add visitor failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to add visitor' },
      { status: 500 }
    );
  }
}
