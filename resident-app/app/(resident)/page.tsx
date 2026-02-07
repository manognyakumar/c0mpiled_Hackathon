/**
 * Resident Dashboard — Light, trust-driven, calm.
 * Card-based layout with greeting, stats, today's visitors.
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

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

const statusBadge: Record<VisitorStatus, { variant: 'approved' | 'pending' | 'denied' | 'expired'; label: string }> = {
  APPROVED:  { variant: 'approved', label: 'Approved' },
  PENDING:   { variant: 'pending',  label: 'Pending' },
  DENIED:    { variant: 'denied',   label: 'Denied' },
  EXPIRED:   { variant: 'expired',  label: 'Expired' },
  scheduled: { variant: 'pending',  label: 'Scheduled' },
  arrived:   { variant: 'approved', label: 'Arrived' },
  expired:   { variant: 'expired',  label: 'Expired' },
};

const dotColor: Record<VisitorStatus, string> = {
  APPROVED:  'bg-status-success',
  PENDING:   'bg-status-warning',
  DENIED:    'bg-status-error',
  EXPIRED:   'bg-ink-faint',
  scheduled: 'bg-brand',
  arrived:   'bg-status-success',
  expired:   'bg-ink-faint',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

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
          fetch('/api/residents/123/schedule-today'),
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

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-8">
        <div className="skeleton h-8 w-56 mb-1" />
        <div className="skeleton h-5 w-36 mb-8" />
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-card" />)}
        </div>
        <div className="skeleton h-5 w-40 mb-4" />
        {[0, 1, 2].map(i => <div key={i} className="skeleton h-20 rounded-card mb-3" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-base">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="px-5 pt-8 pb-2"
      >
        <h1 className="text-display text-ink">
          {getGreeting()}, Mohammed
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse-soft" />
          <p className="text-caption text-ink-muted">
            Community Secure · {format(new Date(), 'EEEE, MMM d')}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 px-5 py-5">
          <StatCard value={stats.today}      label={t('Today', locale)}       accent="blue"  delay={0.05} />
          <StatCard value={stats.pending}    label={t('Pending', locale)}     accent="amber" delay={0.10} />
          <StatCard value={stats.approved}   label={t('Approved', locale)}    accent="green" delay={0.15} />
          <StatCard value={stats.onPremises} label={t('On Premises', locale)} accent="teal"  delay={0.20} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-5 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="flex gap-3"
        >
          <button className="flex-1 surface-card p-3 text-center hover:shadow-card-hover transition-shadow duration-200 text-caption text-ink-secondary">
            ➕ {t('Add', locale)} {t('visitors', locale)}
          </button>
          <button className="flex-1 surface-card p-3 text-center hover:shadow-card-hover transition-shadow duration-200 text-caption text-ink-secondary">
            🎤 {t('Voice Command', locale)}
          </button>
          <button className="flex-1 surface-card p-3 text-center hover:shadow-card-hover transition-shadow duration-200 text-caption text-ink-secondary">
            ✅ {t('Approvals', locale)}
          </button>
        </motion.div>
      </div>

      {/* Today's Visitors */}
      <div className="px-5 pt-2">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING, delay: 0.3 }}
          className="text-title text-ink mb-4"
        >
          {t("Today's Schedule", locale)}
        </motion.h2>

        {visitors.length === 0 ? (
          <Card>
            <p className="text-body text-ink-muted text-center py-8">
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
              className="absolute top-0 bottom-0 w-[2px] bg-base-border"
              style={{ insetInlineStart: '0.5rem' }}
            />

            {visitors.map((visitor) => {
              const badge = statusBadge[visitor.status];
              return (
                <motion.div
                  key={visitor.id}
                  variants={itemVariants}
                  className="relative pb-5"
                >
                  <div
                    className={`absolute top-2 w-3 h-3 rounded-full border-2 border-base-surface ${dotColor[visitor.status]}`}
                    style={{ insetInlineStart: '-1.65rem' }}
                  />

                  <p className="text-micro text-ink-faint mb-2 uppercase tracking-wider">
                    {visitor.time_window}
                  </p>

                  <Card className="!p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={visitor.photo_url}
                          alt={visitor.name}
                          size="lg"
                          ring={visitor.status === 'APPROVED' || visitor.status === 'arrived'}
                        />
                        <div className="min-w-0">
                          <h3 className="text-body font-semibold text-ink truncate">
                            {visitor.name}
                          </h3>
                          {visitor.purpose && (
                            <p className="text-caption text-ink-muted truncate">
                              {visitor.purpose}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={badge.variant}
                        pulse={visitor.status === 'PENDING'}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <FAB
        icon="🎤"
        onClick={() => console.log('Voice input')}
        ariaLabel="Voice command"
      />
    </div>
  );
}
