/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Resident Layout — Bottom nav + content area.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

import { ReactNode } from 'react';
import BottomNav from '@/components/shared/BottomNav';
import { useLocale } from '@/components/LanguageToggle';
import { t } from '@/lib/i18n';

export default function ResidentLayout({ children }: { children: ReactNode }) {
  const { locale } = useLocale();

  const navItems = [
    { href: '/',          icon: '🏠', label: t('Dashboard', locale) },
    { href: '/approvals', icon: '✅', label: t('Approvals', locale) },
    { href: '/recurring', icon: '🔄', label: t('Recurring', locale) },
    { href: '/settings',  icon: '⚙️', label: t('Settings', locale) },
  ];

  return (
    <>
      {children}
      <BottomNav items={navItems} />
    </>
  );
}
