/**
 * Badge — Status indicator with calm, clear colors.
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
  approved: 'bg-status-success-bg text-status-success',
  pending:  'bg-status-warning-bg text-amber-700',
  denied:   'bg-status-error-bg text-status-error',
  expired:  'bg-base-muted text-ink-muted',
  info:     'bg-status-info-bg text-brand',
  muted:    'bg-base-muted text-ink-faint',
};

export default function Badge({
  children,
  variant = 'muted',
  pulse = false,
  icon,
}: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING}
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-badge
        text-micro font-semibold
        ${variantStyles[variant]}
        ${pulse ? 'animate-pulse-soft' : ''}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.span>
  );
}
