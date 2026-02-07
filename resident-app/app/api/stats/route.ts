/**
 * GET /api/stats
 * Returns dashboard statistics
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Mock statistics
  const stats = {
    today: 5,
    pending: 2,
    approved: 3,
    onPremises: 1
  };

  return NextResponse.json(stats);
}
