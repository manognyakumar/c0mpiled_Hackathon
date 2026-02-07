/**
 * GET /api/residents/[id]/schedule-today
 * Returns today's visitor schedule for a specific resident
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Visitor } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock data: realistic visitor schedule
  const visitors: Visitor[] = [
    {
      id: 'v1',
      name: 'Ahmed Hassan',
      time_window: '14:00–15:30',
      status: 'scheduled',
      purpose: 'Package Delivery',
      photo_url: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 'v2',
      name: 'Sarah Johnson',
      time_window: '09:00–10:00',
      status: 'arrived',
      purpose: 'Grocery Delivery',
      photo_url: 'https://i.pravatar.cc/150?img=45'
    },
    {
      id: 'v3',
      name: 'Mohammed Ali',
      time_window: '08:00–09:00',
      status: 'expired',
      purpose: 'Maintenance',
      photo_url: 'https://i.pravatar.cc/150?img=33'
    }
  ];

  return NextResponse.json({
    visitors,
    resident_id: params.id
  });
}
