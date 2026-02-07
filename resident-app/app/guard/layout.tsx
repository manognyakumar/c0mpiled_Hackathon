/**
 * Guard App Layout — Light, high-contrast.
 */
'use client';

import { ReactNode } from 'react';

export default function GuardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base">
      {children}
    </div>
  );
}
