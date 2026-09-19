'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginWithCookie } from '@/lib/auth-api';
import type { PlatformUser } from '@econav/platform';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { resolveUserMessage } from '@/lib/errors';

interface LoginPanelProps {
  onLoggedIn: (user: PlatformUser) => void;
}

const DEMO_ACCOUNTS = [
  { labelKey: 'citizen' as const, phone: '9999999999' },
  { labelKey: 'official' as const, phone: '8888888888' },
  { labelKey: 'field' as const, phone: '7777777777' },
];

export function LoginPanel({ onLoggedIn }: LoginPanelProps) {
  const { push } = useToast();
  const { t, locale, setLocale } = useI18n();
  const [phone, setPhone] = useState('9999999999');
  const [otp, setOtp] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await loginWithCookie(phone, otp, locale);
      if (user.preferredLanguage && user.preferredLanguage !== locale) {
        setLocale(user.preferredLanguage);
      }
      push(`Welcome, ${user.name}`, 'success');
      onLoggedIn(user);
    } catch (err) {
      const msg = resolveUserMessage(err, t.errors);
      setError(msg);
      push(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel login-panel">
      <h2>{t.login.title}</h2>
      <p className="muted">
        {t.login.demoHint}{' '}
        <Link href="/citizen/help">Help</Link>
      </p>
      <div className="demo-account-row">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.phone}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setPhone(acc.phone);
              setOtp('123456');
            }}
          >
            {t.login[acc.labelKey]}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="form-stack" noValidate>
        <label>
          {t.login.mobile}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            required
            minLength={10}
            maxLength={15}
            aria-invalid={!!error}
          />
        </label>
        <label>
          {t.login.otp}
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            minLength={4}
            maxLength={8}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t.login.signingIn : t.login.continue}
        </button>
      </form>
    </div>
  );
}
