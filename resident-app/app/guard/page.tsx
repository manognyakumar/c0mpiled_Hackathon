/**
 * Guard App — Status Checker.
 * Light, high-contrast, fast. Large tap targets.
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/LanguageToggle';
import { t } from '@/lib/i18n';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Avatar from '@/components/shared/Avatar';
import Badge from '@/components/shared/Badge';
import type { VisitorStatus as VisitorStatusType } from '@/lib/types';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface SearchResult {
  name: string;
  apartment: string;
  status: VisitorStatusType;
  validUntil?: string;
  photo_url?: string;
  purpose?: string;
}

const statusBanner: Record<string, { bg: string; border: string; text: string; label: string }> = {
  APPROVED: {
    bg: 'bg-status-success-bg',
    border: 'border-status-success',
    text: 'text-status-success',
    label: 'APPROVED',
  },
  PENDING: {
    bg: 'bg-status-warning-bg',
    border: 'border-status-warning',
    text: 'text-amber-700',
    label: 'WAITING',
  },
  DENIED: {
    bg: 'bg-status-error-bg',
    border: 'border-status-error',
    text: 'text-status-error',
    label: 'DENIED',
  },
  EXPIRED: {
    bg: 'bg-base-muted',
    border: 'border-ink-faint',
    text: 'text-ink-muted',
    label: 'EXPIRED',
  },
};

export default function GuardStatusCheck() {
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    await new Promise(r => setTimeout(r, 800));
    setResult({
      name: query,
      apartment: '301',
      status: Math.random() > 0.5 ? 'APPROVED' : 'PENDING',
      validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      photo_url: 'https://i.pravatar.cc/150?img=25',
      purpose: 'Delivery',
    });
    setIsSearching(false);
  };

  return (
    <div className="px-5 pt-8 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <h1 className="text-display text-ink">{t('Status Check', locale)}</h1>
        <p className="text-body text-ink-muted mt-1">
          {t('Search visitor or apartment', locale)}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex gap-3">
          <input
            type="text"
            className="input-field flex-1"
            placeholder={t('Search visitor or apartment', locale)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="primary" size="lg" onClick={handleSearch} loading={isSearching}>
            {t('Search', locale)}
          </Button>
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.name}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={SPRING}
          >
            {/* Status Banner */}
            {(() => {
              const s = statusBanner[result.status] ?? statusBanner.PENDING;
              return (
                <div
                  className={`
                    rounded-card border-2 ${s.border} ${s.bg}
                    p-8 text-center mb-6
                  `}
                >
                  <motion.p
                    className={`text-4xl font-bold tracking-wide ${s.text}`}
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    {t(s.label, locale)}
                  </motion.p>
                  {result.status === 'APPROVED' && result.validUntil && (
                    <p className="text-body text-ink-muted font-medium mt-2">
                      {t('Valid until', locale)}{' '}
                      {new Date(result.validUntil).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Visitor Details */}
            <Card>
              <div className="flex items-center gap-5 mb-5">
                <Avatar src={result.photo_url} alt={result.name} size="xl" ring />
                <div className="flex-1 min-w-0">
                  <h2 className="text-heading text-ink">{result.name}</h2>
                  <p className="text-body text-ink-secondary mt-1">
                    {t('Apartment', locale)}: {result.apartment}
                  </p>
                  {result.purpose && (
                    <p className="text-caption text-ink-muted mt-0.5">
                      {t('Purpose', locale)}: {result.purpose}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {result.status === 'APPROVED' && (
                  <Button variant="success" size="lg" fullWidth>
                    {t('Allow Entry', locale)}
                  </Button>
                )}
                {result.status === 'PENDING' && (
                  <Button variant="secondary" size="lg" fullWidth>
                    {t('Contact Resident', locale)}
                  </Button>
                )}
                {(result.status === 'DENIED' || result.status === 'EXPIRED') && (
                  <Button variant="danger" size="lg" fullWidth disabled>
                    {t('Entry Not Allowed', locale)}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming arrivals */}
      {!result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-title text-ink font-semibold mb-4">
            {t('Upcoming Arrivals', locale)}
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { name: 'Ahmed Hassan', apt: '204', time: '14:00' },
              { name: 'Sarah Johnson', apt: '505', time: '15:30' },
              { name: 'Mohammed Ali', apt: '102', time: '16:00' },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.3 + i * 0.08 }}
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-semibold text-ink">{v.name}</h4>
                      <p className="text-caption text-ink-muted">Apt {v.apt}</p>
                    </div>
                    <Badge variant="info">{v.time}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
