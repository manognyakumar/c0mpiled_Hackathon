/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Button — Obsidian Neon
 * whileTap scale:0.96, whileHover y:-2, spring transitions.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-neon-cyan text-obsidian hover:shadow-glow-cyan font-semibold',
  secondary: 'bg-neon-violet text-white hover:shadow-glow-violet font-semibold',
  success:   'bg-neon-green text-obsidian hover:shadow-glow-green font-semibold',
  danger:    'bg-status-denied text-white hover:shadow-glow-red font-semibold',
  ghost:     'bg-transparent text-white/70 hover:text-white hover:bg-white/5 border border-glass-border',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-caption rounded-button',
  md: 'px-5 py-2.5 text-body rounded-button',
  lg: 'px-7 py-3.5 text-title rounded-button',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={SPRING}
      className={`
        inline-flex items-center justify-center gap-2
        transition-shadow
        disabled:opacity-40 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
