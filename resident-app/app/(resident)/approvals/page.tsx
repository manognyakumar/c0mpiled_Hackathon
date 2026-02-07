/**
 * Approvals Page — Calm approval/deny flow.
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { format, addMinutes } from 'date-fns';
import { useLocale } from '@/components/LanguageToggle';
import { t, isRTL } from '@/lib/i18n';
import Card from '@/components/shared/Card';
import Avatar from '@/components/shared/Avatar';
import Button from '@/components/shared/Button';
import Badge from '@/components/shared/Badge';
import type { ApprovalRequest } from '@/lib/types';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

export default function ApprovalsPage() {
  const { locale } = useLocale();
  const rtl = isRTL(locale);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/approval-requests');
      const data = await res.json();
      setRequests(data.requests);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const validUntil = addMinutes(new Date(), 90).toISOString();
    try {
      const res = await fetch('/api/visitors/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: id, valid_until: validUntil }),
      });
      if (res.ok) {
        await new Promise(r => setTimeout(r, 300));
        setRequests(prev => prev.filter(req => req.id !== id));
      }
    } catch (err) { console.error(err); }
    finally { setProcessingId(null); }
  };

  const handleDeny = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/visitors/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: id }),
      });
      if (res.ok) {
        await new Promise(r => setTimeout(r, 300));
        setRequests(prev => prev.filter(req => req.id !== id));
      }
    } catch (err) { console.error(err); }
    finally { setProcessingId(null); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-8 bg-base">
        <div className="skeleton h-8 w-52 mb-1" />
        <div className="skeleton h-5 w-32 mb-8" />
        {[0, 1].map(i => <div key={i} className="skeleton h-36 rounded-card mb-4" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 bg-base">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
        <h1 className="text-display text-ink">{t('Approval Requests', locale)}</h1>
        <p className="text-caption text-ink-muted mt-1">
          {requests.length} {t('requests', locale)}
        </p>
      </motion.div>

      {/* List */}
      <div className="mt-6">
        {requests.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-body text-ink-muted">{t('No approval requests', locale)}</p>
              <p className="text-caption text-ink-faint mt-1">You're all caught up!</p>
            </div>
          </Card>
        ) : (
          <motion.div
            className="flex flex-col gap-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {requests.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95, x: rtl ? 60 : -60, transition: SPRING }}
                >
                  <Card highlight="brand">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar src={req.photo_url} alt={req.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-title text-ink truncate">{req.name}</h3>
                        <p className="text-body text-ink-secondary">{req.purpose}</p>
                        <p className="text-micro text-ink-faint mt-1">
                          {t('Requested', locale)} {format(new Date(req.requested_at), 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant="pending" pulse>{t('Pending', locale)}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="success"
                        onClick={() => handleApprove(req.id)}
                        loading={processingId === req.id}
                        disabled={processingId !== null}
                      >
                        {t('Approve', locale)}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeny(req.id)}
                        disabled={processingId !== null}
                      >
                        {t('Deny', locale)}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
