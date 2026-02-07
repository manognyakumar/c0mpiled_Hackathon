/**
 * StatCard — Dashboard stat with clean accent stripe.
 */
'use client';

import { motion } from 'framer-motion';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

type Accent = 'blue' | 'green' | 'amber' | 'teal' | 'red';

interface StatCardProps {
  value: number;
  label: string;
  accent?: Accent;
  delay?: number;
}

const accentBorder: Record<Accent, string> = {
  blue:  'border-s-brand',
  green: 'border-s-accent-green',
  amber: 'border-s-status-warning',
  teal:  'border-s-accent-teal',
  red:   'border-s-status-error',
};

const accentText: Record<Accent, string> = {
  blue:  'text-brand',
  green: 'text-accent-green',
  amber: 'text-status-warning',
  teal:  'text-accent-teal',
  red:   'text-status-error',
};

export default function StatCard({ value, label, accent = 'blue', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      transition={{ ...SPRING, delay }}
      className={`
        surface-card p-4 border-s-4
        ${accentBorder[accent]}
        transition-shadow duration-200
      `}
    >
      <div className={`text-display ${accentText[accent]}`}>
        {value}
      </div>
      <div className="text-caption text-ink-muted mt-0.5">
        {label}
      </div>
    </motion.div>
  );
}
