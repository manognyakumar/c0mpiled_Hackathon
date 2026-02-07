/**
 * Card — Composition Pattern (Card.Header, Card.Body, Card.Footer)
 * Clean white surface with subtle border and shadow.
 */
'use client';

import { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`pb-3 border-b border-base-border ${className}`}>{children}</div>;
}

function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`py-4 ${className}`}>{children}</div>;
}

function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pt-3 border-t border-base-border flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  highlight?: 'success' | 'warning' | 'error' | 'brand' | false;
  onClick?: () => void;
  animated?: boolean;
}

function CardRoot({
  children,
  className = '',
  highlight = false,
  onClick,
  animated = true,
}: CardProps) {
  const highlightClass = highlight
    ? highlight === 'success' ? 'border-status-success/30 bg-status-success-bg/30'
    : highlight === 'warning' ? 'border-status-warning/30 bg-status-warning-bg/30'
    : highlight === 'error'   ? 'border-status-error/30 bg-status-error-bg/30'
    : highlight === 'brand'   ? 'border-brand/20 bg-brand-50/40'
    : ''
    : '';

  const Component = animated ? motion.div : 'div';
  const motionProps = animated
    ? {
        variants: cardVariants,
        initial: 'hidden' as const,
        animate: 'visible' as const,
        whileHover: { y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: SPRING },
      }
    : {};

  return (
    <Component
      className={`
        surface-card p-5
        transition-shadow duration-200
        ${highlightClass}
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
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

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
