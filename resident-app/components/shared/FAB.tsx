/**
 * FAB — Floating Action Button with brand blue.
 */
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.3 };

interface FABProps {
  icon: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}

export default function FAB({ icon, onClick, ariaLabel = 'Action' }: FABProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={SPRING}
      className="
        fixed bottom-24 z-40
        w-14 h-14 rounded-full
        bg-brand text-white
        flex items-center justify-center
        text-2xl font-bold
        shadow-elevated
      "
      style={{ insetInlineEnd: '1.5rem' }}
    >
      {icon}
    </motion.button>
  );
}
