/**
 * Guard App Layout — Obsidian Neon
 */
'use client';

import { ReactNode } from 'react';

export default function GuardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian">
      {children}
    </div>
  );
}
