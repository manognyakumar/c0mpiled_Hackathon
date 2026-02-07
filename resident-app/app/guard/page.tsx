/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Guard App — Status Checker — Obsidian Neon
 * High-impact search + pulsing status banner.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

const statusGlow: Record<string, string> = {
  APPROVED: 'shadow-glow-green',
  PENDING:  'shadow-glow-cyan',
  DENIED:   'shadow-glow-red',
  EXPIRED:  'shadow-glow-red',
};

const statusBorder: Record<string, string> = {
  APPROVED: 'border-neon-green',
  PENDING:  'border-neon-cyan',
  DENIED:   'border-status-error',
  EXPIRED:  'border-status-error',
};

const statusText: Record<string, string> = {
  APPROVED: 'text-neon-green',
  PENDING:  'text-neon-cyan',
  DENIED:   'text-status-error',
  EXPIRED:  'text-status-error',
};

export default function GuardStatusCheck() {
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [arrivals, setArrivals] = useState<Array<{ name: string; apt: string; time: string }>>([]);

  // Fetch expected arrivals on mount
  useState(() => {
    fetch('/api/guard/expected-today')
      .then((r) => r.json())
      .then((data) => {
        if (data.arrivals?.length) setArrivals(data.arrivals);
      })
      .catch(console.error);
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/guard/search?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const match = data.results[0];
        const approval = match.latest_approval;
        const statusMap: Record<string, string> = {
          approved: 'APPROVED',
          pending: 'PENDING',
          denied: 'DENIED',
          expired: 'EXPIRED',
        };
        setResult({
          name: match.name,
          apartment: approval?.apt_number ?? 'N/A',
          status: (statusMap[approval?.status ?? ''] ?? 'PENDING') as VisitorStatusType,
          validUntil: approval?.valid_until ?? undefined,
          photo_url: match.photo_url ?? undefined,
          purpose: 'Visit',
        });
      } else {
        // No match found — show pending
        setResult({
          name: query,
          apartment: 'N/A',
          status: 'PENDING',
          purpose: 'Not found in system',
        });
      }
    } catch (err) {
      console.error('Search failed:', err);
      setResult({
        name: query,
        apartment: 'N/A',
        status: 'PENDING',
        purpose: 'Search error',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="px-5 pt-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="mb-8">
        <h1 className="text-display text-gradient-cyan">{t('Status Check', locale)}</h1>
        <p className="text-body text-white/40 mt-1">{t('Search visitor or apartment', locale)}</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            className="input-obsidian flex-1 text-body"
            placeholder={t('Search visitor or apartment', locale)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="primary" onClick={handleSearch} loading={isSearching}>
            {t('Search', locale)}
          </Button>
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.name}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={SPRING}
          >
            {/* Status Banner */}
            <div className={`
              rounded-card border-2 ${statusBorder[result.status] ?? 'border-white/10'}
              ${statusGlow[result.status] ?? ''} p-8 text-center mb-6
              bg-glass-light backdrop-blur-lg
            `}>
              <motion.p
                className={`text-5xl font-extrabold tracking-wider ${statusText[result.status] ?? 'text-white/50'}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {t(result.status, locale)}
              </motion.p>
              {result.status === 'APPROVED' && result.validUntil && (
                <p className="text-body text-white/50 font-medium mt-2">
                  {t('Valid until', locale)}{' '}
                  {new Date(result.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Visitor Details */}
            <Card>
              <div className="flex items-center gap-5 mb-5">
                <Avatar src={result.photo_url} alt={result.name} size="xl" ring />
                <div className="flex-1 min-w-0">
                  <h2 className="text-heading text-white/90">{result.name}</h2>
                  <p className="text-body text-white/50 mt-1">{t('Apartment', locale)}: {result.apartment}</p>
                  {result.purpose && (
                    <p className="text-caption text-white/30 mt-0.5">{t('Purpose', locale)}: {result.purpose}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                {result.status === 'APPROVED' && (
                  <Button variant="success" fullWidth>{t('Allow Entry', locale)}</Button>
                )}
                {result.status === 'PENDING' && (
                  <Button variant="secondary" fullWidth>{t('Contact Resident', locale)}</Button>
                )}
                {(result.status === 'DENIED' || result.status === 'EXPIRED') && (
                  <Button variant="danger" fullWidth disabled>{t('Entry Not Allowed', locale)}</Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming arrivals */}
      {!result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-title font-bold mb-4">{t('Upcoming Arrivals', locale)}</h3>
          <div className="flex flex-col gap-3">
            {arrivals.length === 0 ? (
              <Card>
                <p className="text-body text-white/40 text-center py-6">
                  {t('No visitors expected today', locale)}
                </p>
              </Card>
            ) : (
              arrivals.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.3 + i * 0.1 }}
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-semibold">{v.name}</h4>
                      <p className="text-caption text-white/40">Apt {v.apt}</p>
                    </div>
                    <Badge variant="info">{v.time}</Badge>
                  </div>
                </Card>
              </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
