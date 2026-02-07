/**
 * Settings Page — Profile, photo, password, language, notifications.
 */
'use client';

import { useState, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/LanguageToggle';
import { t } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
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
  const { user, logout, refreshUser } = useAuth();
  const [pushOn, setPushOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');

  const toggleLang = () => setLocale(locale === 'en' ? 'ar' : 'en');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setPhotoMsg('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('rg_auth_token');
      const res = await fetch('/api/auth/upload-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setPhotoMsg(data.error || 'Upload failed');
      } else {
        setPhotoMsg('Photo updated!');
        await refreshUser();
      }
    } catch {
      setPhotoMsg('Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwdError('');
    setPwdSuccess('');

    if (!newPassword || newPassword.length < 4) {
      setPwdError('Password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match');
      return;
    }

    setPwdLoading(true);
    try {
      const token = localStorage.getItem('rg_auth_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error || 'Failed to change password');
      } else {
        setPwdSuccess('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setShowPasswordForm(false), 1500);
      }
    } catch {
      setPwdError('Network error');
    } finally {
      setPwdLoading(false);
    }
  };

  const photoSrc = user?.photo_url
    ? (user.photo_url.startsWith('/api/') ? `http://localhost:8000${user.photo_url}` : user.photo_url)
    : 'https://i.pravatar.cc/150?img=10';

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
              <div className="relative">
                <Avatar src={photoSrc} alt={user?.name || 'User'} size="xl" ring />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand text-white text-xs flex items-center justify-center shadow-md hover:bg-brand/90 transition-colors"
                  disabled={photoUploading}
                >
                  {photoUploading ? '...' : '📷'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              <div>
                <h2 className="text-heading text-ink">{user?.name || 'Resident'}</h2>
                <p className="text-caption text-ink-muted">
                  Apartment {user?.apt_number || '—'}
                </p>
                {photoMsg && (
                  <p className={`text-micro mt-1 ${photoMsg.includes('failed') ? 'text-status-error' : 'text-status-success'}`}>
                    {photoMsg}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={fadeUp}>
          <h3 className="text-caption text-ink-muted uppercase tracking-wider mb-3">
            Security
          </h3>
          <Card>
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center justify-between w-full"
              >
                <span className="text-body text-ink-secondary">🔒 Change Password</span>
                <span className="text-ink-faint">→</span>
              </button>
            ) : (
              <div className="space-y-3">
                {pwdError && (
                  <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-caption text-status-error">
                    {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div className="p-2 rounded-lg bg-green-50 border border-green-200 text-caption text-status-success">
                    {pwdSuccess}
                  </div>
                )}
                <input
                  type="password"
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowPasswordForm(false); setPwdError(''); setPwdSuccess(''); }}
                    className="flex-1 py-2 rounded-button border border-base-border text-caption text-ink-muted hover:bg-base-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={pwdLoading}
                    className="flex-1 py-2 rounded-button bg-brand text-white text-caption font-medium hover:bg-brand/90 disabled:opacity-60 transition-colors"
                  >
                    {pwdLoading ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
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
          <button
            onClick={logout}
            className="w-full text-center text-body text-status-error py-3 hover:bg-status-error-bg rounded-button transition-colors"
          >
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
