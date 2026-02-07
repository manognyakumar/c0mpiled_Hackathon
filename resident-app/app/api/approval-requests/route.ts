/**
 * GET /api/approval-requests
 * Returns pending visitor approval requests
 */

import { NextResponse } from 'next/server';
import type { ApprovalRequest } from '@/lib/types';

export async function GET() {
  // Mock data: pending approval requests
  const requests: ApprovalRequest[] = [
    {
      id: 'ar1',
      name: 'Fatima Al-Mansoori',
      purpose: 'Delivery',
      requested_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      photo_url: 'https://i.pravatar.cc/150?img=20'
    },
    {
      id: 'ar2',
      name: 'John Smith',
      purpose: 'Guest Visit',
      requested_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      photo_url: 'https://i.pravatar.cc/150?img=8'
    }
  ];

  return NextResponse.json({ requests });
}
