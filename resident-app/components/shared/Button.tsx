/**
 * Button — Light trust-driven design.
 * Gentle hover elevation, no harsh glows.
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
  primary:   'bg-brand text-white hover:bg-brand-dark shadow-sm font-medium',
  secondary: 'bg-base-muted text-ink-secondary hover:bg-base-hover border border-base-border font-medium',
  success:   'bg-status-success text-white hover:bg-green-700 shadow-sm font-medium',
  danger:    'bg-status-error text-white hover:bg-red-700 shadow-sm font-medium',
  ghost:     'bg-transparent text-ink-muted hover:text-ink hover:bg-base-muted font-medium',
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
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={SPRING}
      className={`
        inline-flex items-center justify-center gap-2
        transition-colors duration-200
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
