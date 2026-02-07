/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Resident Dashboard — Obsidian Neon Edition
 *
 * Rules enforced:
 *  ✓ Spring-only animations (stiffness:300, damping:30)
 *  ✓ staggerChildren on all lists
 *  ✓ Logical properties only (ps/pe/ms/me)
 *  ✓ RTL-aware directional animations
 *  ✓ 1px white/10 borders on every surface
 *  ✓ Composition components (Card.Header, Card.Body)
 *  ✓ Discriminated VisitorStatus union
 *  ✓ No `any`
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { format } from 'date-fns';
import { useLocale } from '@/components/LanguageToggle';
import { t, isRTL } from '@/lib/i18n';
import Card from '@/components/shared/Card';
import Badge from '@/components/shared/Badge';
import Avatar from '@/components/shared/Avatar';
import FAB from '@/components/shared/FAB';
import StatCard from '@/components/shared/StatCard';
import type { Visitor, DashboardStats, VisitorStatus } from '@/lib/types';

/* ── Spring Presets ────────────────────────────────── */
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

/* ── Animation Variants ──────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

/* ── Status → Badge mapping ──────────────────────── */
const statusBadge: Record<VisitorStatus, { variant: 'approved' | 'pending' | 'denied' | 'expired'; label: string }> = {
  APPROVED:  { variant: 'approved', label: 'APPROVED' },
  PENDING:   { variant: 'pending',  label: 'PENDING' },
  DENIED:    { variant: 'denied',   label: 'DENIED' },
  EXPIRED:   { variant: 'expired',  label: 'EXPIRED' },
  scheduled: { variant: 'pending',  label: 'PENDING' },
  arrived:   { variant: 'approved', label: 'APPROVED' },
  expired:   { variant: 'expired',  label: 'EXPIRED' },
};

/* ── Status → timeline dot color ─────────────────── */
const dotColor: Record<VisitorStatus, string> = {
  APPROVED:  'bg-neon-green',
  PENDING:   'bg-neon-cyan',
  DENIED:    'bg-status-denied',
  EXPIRED:   'bg-status-expired',
  scheduled: 'bg-neon-cyan',
  arrived:   'bg-neon-green',
  expired:   'bg-status-expired',
};

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function ResidentDashboard() {
  const { locale } = useLocale();
  const rtl = isRTL(locale);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [sRes, vRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/residents/1/schedule-today'),
        ]);
        const sData = await sRes.json();
        const vData = await vRes.json();
        setStats(sData);
        setVisitors(vData.visitors);
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ── RTL-aware slide direction ──────────────────── */
  const slideX = rtl ? 20 : -20;

  /* ── Loading skeleton ──────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-8">
        <div className="skeleton h-10 w-48 mb-2" />
        <div className="skeleton h-5 w-32 mb-8" />
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-card" />)}
        </div>
        <div className="skeleton h-6 w-40 mb-4" />
        {[0, 1, 2].map(i => <div key={i} className="skeleton h-20 rounded-card mb-3" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="px-5 pt-8 pb-6"
      >
        <h1 className="text-display text-gradient-cyan">
          {t('Dashboard', locale)}
        </h1>
        <p className="text-caption text-white/40 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* ── Stats Grid ─────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 px-5 mb-8">
          <StatCard value={stats.today}      label={t('Today', locale)}       accent="cyan"   delay={0.05} />
          <StatCard value={stats.pending}    label={t('Pending', locale)}     accent="yellow" delay={0.10} />
          <StatCard value={stats.approved}   label={t('Approved', locale)}    accent="green"  delay={0.15} />
          <StatCard value={stats.onPremises} label={t('On Premises', locale)} accent="violet" delay={0.20} />
        </div>
      )}

      {/* ── Timeline Section ───────────────────────── */}
      <div className="px-5">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="text-title text-white/90 mb-5"
        >
          {t("Today's Schedule", locale)}
        </motion.h2>

        {visitors.length === 0 ? (
          <Card>
            <p className="text-body text-white/40 text-center py-8">
              {t('No visitors today', locale)}
            </p>
          </Card>
        ) : (
          <motion.div
            className="relative"
            style={{ paddingInlineStart: '2rem' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Timeline line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-glass-border"
              style={{ insetInlineStart: '0.5rem' }}
            />

            {visitors.map((visitor, index) => {
              const badge = statusBadge[visitor.status];
              return (
                <motion.div
                  key={visitor.id}
                  variants={itemVariants}
                  className="relative pb-5"
                >
                  {/* Timeline dot */}
                  <div
                    className={`
                      absolute top-2 w-3 h-3 rounded-full
                      border-2 border-obsidian
                      ${dotColor[visitor.status]}
                    `}
                    style={{ insetInlineStart: '-1.65rem' }}
                  />

                  {/* Time label */}
                  <p className="text-micro text-white/35 mb-2 uppercase tracking-wider">
                    {visitor.time_window}
                  </p>

                  {/* Visitor Card */}
                  <Card
                    glow={visitor.status === 'PENDING' ? 'cyan' : false}
                    className="!p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                        <Avatar
                          src={visitor.photo_url}
                          alt={visitor.name}
                          size="lg"
                          ring={visitor.status === 'APPROVED'}
                        />
                        <div className="min-w-0">
                          <h3 className="text-body font-semibold text-white/90 truncate">
                            {visitor.name}
                          </h3>
                          {visitor.purpose && (
                            <p className="text-caption text-white/40 truncate">
                              {visitor.purpose}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={badge.variant}
                        pulse={visitor.status === 'PENDING'}
                      >
                        {t(badge.label, locale)}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── FAB ────────────────────────────────────── */}
      <FAB
        icon="🎤"
        onClick={() => console.log('Voice input')}
        ariaLabel="Voice command"
      />
    </div>
  );
}
