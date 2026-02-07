/**
 * BottomNav — Clean bottom navigation with brand accent indicator.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
}

interface BottomNavProps {
  items: NavItem[];
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-item-icon">{item.icon}</div>
            <span>{item.label}</span>
            {isActive && (
              <motion.div
                className="bottom-nav-indicator"
                layoutId="nav-indicator"
                transition={SPRING}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
