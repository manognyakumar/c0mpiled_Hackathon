/**
 * GET /api/recurring-visitors
 * Returns list of recurring visitors for the resident
 */

import { NextResponse } from 'next/server';
import type { RecurringVisitor } from '@/lib/types';

export async function GET() {
  // Mock data: recurring visitor entries
  const recurring: RecurringVisitor[] = [
    {
      id: 'rv1',
      name: 'Maria Garcia',
      role: 'Housekeeper',
      recurrence_rule: 'Mon/Wed 10:00–12:00',
      active: true
    },
    {
      id: 'rv2',
      name: 'David Lee',
      role: 'Tutor',
      recurrence_rule: 'Thu 16:00–18:00',
      active: true
    }
  ];

  return NextResponse.json({ recurring });
}
