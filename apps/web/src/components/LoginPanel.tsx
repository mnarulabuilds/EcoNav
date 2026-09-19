'use client';

import { useState } from 'react';
import { login } from '@/lib/platform-api';
import type { PlatformUser } from '@econav/platform';
import { useToast } from '@/components/ui/Toast';

interface LoginPanelProps {
  onLoggedIn: (user: PlatformUser) => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Citizen', phone: '9999999999' },
  { label: 'Official', phone: '8888888888' },
  { label: 'Field', phone: '7777777777' },
] as const;

export function LoginPanel({ onLoggedIn }: LoginPanelProps) {
  const { push } = useToast();
  const [phone, setPhone] = useState('9999999999');
  const [otp, setOtp] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await login(phone, otp);
      localStorage.setItem('cityconnect_token', token);
      push(`Welcome, ${user.name}`, 'success');
      onLoggedIn(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      push(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel login-panel">
      <h2>Sign in</h2>
      <p className="muted">Demo OTP: <strong>123456</strong> · Need help? See <a href="/citizen/help">Help</a></p>
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
            {acc.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Mobile number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={!!error}
          />
        </label>
        <label>
          OTP
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
