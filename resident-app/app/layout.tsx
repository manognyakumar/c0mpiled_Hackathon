/**
 * Root Layout — Clarity Light Mode
 */
import type { Metadata } from 'next';
import { LocaleProvider } from '@/components/LanguageToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResidentGuard — Visitor Management',
  description: 'Trusted visitor management for modern communities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="bg-base text-ink antialiased">
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
