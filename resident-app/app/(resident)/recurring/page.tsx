/**
 * Recurring Visitors — Clean list with toggle switches.
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/LanguageToggle';
import { t } from '@/lib/i18n';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import type { RecurringVisitor } from '@/lib/types';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

export default function RecurringPage() {
  const { locale } = useLocale();
  const [recurring, setRecurring] = useState<RecurringVisitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchRecurring(); }, []);

  const fetchRecurring = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/recurring-visitors');
      const data = await res.json();
      setRecurring(data.recurring);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const toggleActive = (id: string) => {
    setRecurring(prev =>
      prev.map(v => (v.id === id ? { ...v, active: !v.active } : v)),
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-8 bg-base">
        <div className="skeleton h-8 w-52 mb-1" />
        <div className="skeleton h-5 w-24 mb-8" />
        {[0, 1, 2].map(i => <div key={i} className="skeleton h-24 rounded-card mb-3" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 bg-base">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <h1 className="text-display text-ink">{t('Recurring Visitors', locale)}</h1>
          <p className="text-caption text-ink-muted mt-1">
            {recurring.filter(v => v.active).length} {t('Active', locale).toLowerCase()}
          </p>
        </div>
        <Button variant="primary" onClick={() => {}}>
          + {t('Add', locale)}
        </Button>
      </motion.div>

      {/* List */}
      {recurring.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔁</p>
            <p className="text-body text-ink-muted">{t('No recurring visitors', locale)}</p>
          </div>
        </Card>
      ) : (
        <motion.div
          className="flex flex-col gap-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {recurring.map((visitor) => (
            <motion.div key={visitor.id} variants={itemVariants}>
              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-title text-ink truncate">{visitor.name}</h3>
                    <p className="text-caption text-brand mt-0.5">{visitor.role}</p>
                    <p className="text-micro text-ink-faint mt-1">{visitor.recurrence_rule}</p>
                  </div>

                  <motion.button
                    onClick={() => toggleActive(visitor.id)}
                    className="toggle-track"
                    data-state={visitor.active ? 'on' : 'off'}
                    whileTap={{ scale: 0.96 }}
                    aria-label={visitor.active ? t('Active', locale) : t('Inactive', locale)}
                  >
                    <span className="toggle-thumb" />
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
