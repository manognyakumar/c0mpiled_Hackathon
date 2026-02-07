/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Card — Composition Pattern (Card.Header, Card.Body, Card.Footer)
 * Glass surface with 1px white/10 border. Spring animations.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

import { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

/* ── Spring Presets ───────────────────────────────── */
const SPRING_UI = { type: 'spring' as const, stiffness: 300, damping: 30 };

/* ── Animation Variants ──────────────────────────── */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_UI },
};

/* ── Sub-components ──────────────────────────────── */
function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pb-3 border-b border-glass-border ${className}`}>
      {children}
    </div>
  );
}

function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`py-4 ${className}`}>{children}</div>;
}

function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pt-3 border-t border-glass-border flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

/* ── Main Card ───────────────────────────────────── */
interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'green' | 'red' | 'violet' | false;
  onClick?: () => void;
  animated?: boolean;
}

function CardRoot({
  children,
  className = '',
  glow = false,
  onClick,
  animated = true,
}: CardProps) {
  const glowClass = glow
    ? glow === 'cyan'   ? 'shadow-glow-cyan animate-pulse-glow'
    : glow === 'green'  ? 'shadow-glow-green animate-pulse-green'
    : glow === 'red'    ? 'shadow-glow-red animate-pulse-red'
    : glow === 'violet' ? 'shadow-glow-violet'
    : ''
    : '';

  const Component = animated ? motion.div : 'div';
  const motionProps = animated
    ? {
        variants: cardVariants,
        initial: 'hidden' as const,
        animate: 'visible' as const,
        whileHover: { y: -2, borderColor: 'rgba(255,255,255,0.18)', transition: SPRING_UI },
      }
    : {};

  return (
    <Component
      className={`
        glass-surface rounded-card p-5
        transition-shadow
        ${glowClass}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

/* ── Compose & Export ────────────────────────────── */
const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
