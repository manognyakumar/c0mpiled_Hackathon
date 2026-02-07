/**
 * Login Page — Phone + Password login with role selection.
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth();
  const [role, setRole] = useState<'resident' | 'guard'>('resident');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Please enter phone number and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(phone.trim(), password.trim(), role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo credentials hint
  const demoHint = role === 'resident'
    ? { phone: '+971501234567', password: '1234', name: 'Ahmed (Apt 501)' }
    : { phone: '+971504567890', password: 'guard123', name: 'Security Guard' };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="animate-pulse text-ink-muted text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="w-full max-w-sm"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto rounded-2xl bg-brand/10 flex items-center justify-center mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ ...SPRING, delay: 0.1 }}
          >
            <span className="text-4xl">🏠</span>
          </motion.div>
          <h1 className="text-display text-ink text-2xl font-bold">ResidentGuard</h1>
          <p className="text-body text-ink-muted mt-1">Visitor Management System</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-6 p-1 bg-base-muted rounded-button">
          {(['resident', 'guard'] as const).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setError(''); }}
              className={`flex-1 py-2.5 rounded-button text-body font-medium transition-all ${
                role === r
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {r === 'resident' ? '🏠 Resident' : '🛡️ Guard'}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-caption text-status-error"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={demoHint.phone}
              className="w-full px-4 py-3 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-button bg-brand text-white font-semibold text-body hover:bg-brand/90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-3 rounded-lg bg-blue-50 border border-blue-200"
        >
          <p className="text-caption text-blue-700 font-medium mb-1">Demo Credentials ({role})</p>
          <p className="text-micro text-blue-600">
            <strong>{demoHint.name}</strong><br />
            Phone: {demoHint.phone}<br />
            Password: {demoHint.password}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
