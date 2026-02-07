/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Badge — Status indicator with pulse glow
 * Uses discriminated VisitorStatus color mapping.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

type BadgeVariant = 'approved' | 'pending' | 'denied' | 'expired' | 'info' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  approved: 'bg-neon-green/15 text-neon-green border-neon-green/30',
  pending:  'bg-status-pending/15 text-status-pending border-status-pending/30',
  denied:   'bg-status-denied/15 text-status-denied border-status-denied/30',
  expired:  'bg-status-expired/15 text-status-expired border-status-expired/30',
  info:     'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
  muted:    'bg-white/5 text-white/50 border-white/10',
};

export default function Badge({
  children,
  variant = 'muted',
  pulse = false,
  icon,
}: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING}
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-badge
        text-micro font-semibold uppercase tracking-wider
        border
        ${variantStyles[variant]}
        ${pulse ? 'animate-pulse-glow' : ''}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.span>
  );
}
