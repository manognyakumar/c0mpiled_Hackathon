/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FAB — Floating Action Button, spring entrance.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

const SPRING_ENTRANCE = { type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.3 };
const SPRING_UI = { type: 'spring' as const, stiffness: 300, damping: 30 };

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
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_ENTRANCE}
      className="
        fixed bottom-24 z-40
        w-14 h-14 rounded-full
        bg-neon-cyan text-obsidian
        flex items-center justify-center
        text-2xl font-bold
        shadow-glow-cyan
      "
      style={{ insetInlineEnd: '1.5rem' }}
    >
      {icon}
    </motion.button>
  );
}
