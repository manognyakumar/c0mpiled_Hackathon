/**
 * Modal — Light overlay, gentle spring entrance.
 */
'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const SPRING_MODAL = { type: 'spring' as const, stiffness: 100, damping: 15 };

function ModalHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`pb-4 border-b border-base-border ${className}`}>{children}</div>;
}

function ModalBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`py-5 ${className}`}>{children}</div>;
}

function ModalFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pt-4 border-t border-base-border flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

function ModalRoot({ isOpen, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={`
              relative w-full ${maxW}
              bg-base-surface
              border border-base-border rounded-modal
              p-6 shadow-elevated
            `}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 12 }}
            transition={SPRING_MODAL}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default Modal;
