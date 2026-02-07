/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * StatCard — Dashboard stat with animated count, neon accent.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

import { motion } from 'framer-motion';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

type Accent = 'cyan' | 'green' | 'violet' | 'yellow' | 'red';

interface StatCardProps {
  value: number;
  label: string;
  accent?: Accent;
  delay?: number;
}

const accentColor: Record<Accent, string> = {
  cyan:   'text-neon-cyan',
  green:  'text-neon-green',
  violet: 'text-neon-violet',
  yellow: 'text-status-pending',
  red:    'text-status-denied',
};

const accentGlow: Record<Accent, string> = {
  cyan:   'shadow-glow-cyan',
  green:  'shadow-glow-green',
  violet: 'shadow-glow-violet',
  yellow: '',
  red:    'shadow-glow-red',
};

export default function StatCard({ value, label, accent = 'cyan', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.18)' }}
      transition={{ ...SPRING, delay }}
      className={`
        glass-surface rounded-card p-5
        text-center cursor-default
        hover:${accentGlow[accent]}
        transition-shadow
      `}
    >
      <div className={`text-display ${accentColor[accent]}`}>
        {value}
      </div>
      <div className="text-caption text-white/50 mt-1">
        {label}
      </div>
    </motion.div>
  );
}
