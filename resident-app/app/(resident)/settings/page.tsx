/**
 * Settings Page — Profile, language, notifications.
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
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

export default function SettingsPage() {
  const { locale, setLocale } = useLocale();
  const [pushOn, setPushOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  const toggleLang = () => setLocale(locale === 'en' ? 'ar' : 'en');

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 bg-base">
      {/* Header */}
      <motion.h1
        className="text-display text-ink mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        {t('Settings', locale)}
      </motion.h1>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-5">
        {/* Profile Card */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center gap-4">
              <Avatar src="https://i.pravatar.cc/150?img=10" alt="User" size="xl" ring />
              <div>
                <h2 className="text-heading text-ink">Mohammed</h2>
                <p className="text-caption text-ink-muted">Apartment 304</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Language */}
        <motion.div variants={fadeUp}>
          <h3 className="text-caption text-ink-muted uppercase tracking-wider mb-3">
            {t('Language', locale)}
          </h3>
          <Card onClick={toggleLang}>
            <div className="flex items-center justify-between">
              <span className="text-body text-ink">{locale === 'en' ? 'English' : 'العربية'}</span>
              <span className="text-xl">{locale === 'en' ? '🇬🇧' : '🇸🇦'}</span>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={fadeUp}>
          <h3 className="text-caption text-ink-muted uppercase tracking-wider mb-3">
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

        {/* Logout */}
        <motion.div variants={fadeUp}>
          <button className="w-full text-center text-body text-status-error py-3 hover:bg-status-error-bg rounded-button transition-colors">
            Log out
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

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
        <span className="text-body text-ink-secondary">{label}</span>
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
