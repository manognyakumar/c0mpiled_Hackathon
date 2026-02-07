/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Root Layout — Obsidian Neon
 * Loads Inter + IBM Plex Sans Arabic.
 * Sets dir/lang from locale after hydration.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type { Metadata } from 'next';
import { LocaleProvider } from '@/components/LanguageToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resident App | Obsidian Neon',
  description: 'Award-winning visitor management — dark, fast, global.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="bg-obsidian text-white/90 antialiased">
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
