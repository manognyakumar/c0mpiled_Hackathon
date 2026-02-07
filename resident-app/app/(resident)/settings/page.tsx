/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Settings Page — Obsidian Neon
 * Profile card, language toggle, notification switches.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/LanguageToggle';
import { t } from '@/lib/i18n';
import Card from '@/components/shared/Card';
import Avatar from '@/components/shared/Avatar';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

export default function SettingsPage() {
  const { locale, setLocale } = useLocale();
  const [pushOn, setPushOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  const toggleLang = () => setLocale(locale === 'en' ? 'ar' : 'en');

  return (
    <div className="min-h-screen pb-24 px-5 pt-8">
      {/* Header */}
      <motion.h1
        className="text-display text-white/90 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        {t('Settings', locale)}
      </motion.h1>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-5">
        {/* ── Profile Card ────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center gap-4">
              <Avatar src="https://i.pravatar.cc/150?img=10" alt="User" size="xl" ring />
              <div>
                <h2 className="text-heading text-white/90">John Smith</h2>
                <p className="text-caption text-white/40">Apartment 304</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Language ────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <h3 className="text-caption text-white/40 uppercase tracking-wider mb-3">
            {t('Language', locale)}
          </h3>
          <Card onClick={toggleLang}>
            <div className="flex items-center justify-between">
              <span className="text-body">{locale === 'en' ? 'English' : 'العربية'}</span>
              <span className="text-xl">{locale === 'en' ? '🇬🇧' : '🇸🇦'}</span>
            </div>
          </Card>
        </motion.div>

        {/* ── Notifications ──────────────────────── */}
        <motion.div variants={fadeUp}>
          <h3 className="text-caption text-white/40 uppercase tracking-wider mb-3">
            {t('Notifications', locale)}
          </h3>
          <div className="flex flex-col gap-3">
            <ToggleRow
              label={t('Push notifications', locale)}
              checked={pushOn}
              onToggle={() => setPushOn(v => !v)}
            />
            <ToggleRow
              label={t('Notification sound', locale)}
              checked={soundOn}
              onToggle={() => setSoundOn(v => !v)}
            />
            <ToggleRow
              label={t('Auto-approve recurring', locale)}
              checked={autoApprove}
              onToggle={() => setAutoApprove(v => !v)}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Toggle Row Component ──────────────────────────── */
function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Card animated={false}>
      <div className="flex items-center justify-between">
        <span className="text-body text-white/70">{label}</span>
        <motion.button
          onClick={onToggle}
          className="toggle-track"
          data-state={checked ? 'on' : 'off'}
          whileTap={{ scale: 0.96 }}
          aria-pressed={checked}
        >
          <span className="toggle-thumb" />
        </motion.button>
      </div>
    </Card>
  );
}
