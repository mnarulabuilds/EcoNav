'use client';

import { useState } from 'react';
import { login } from '@/lib/platform-api';
import type { PlatformUser } from '@econav/platform';

interface LoginPanelProps {
  onLoggedIn: (user: PlatformUser) => void;
}

export function LoginPanel({ onLoggedIn }: LoginPanelProps) {
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
      onLoggedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2>Sign in (demo)</h2>
      <p className="muted">
        Citizen: 9999999999 · Official: 8888888888 · OTP: 123456
      </p>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Mobile
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label>
          OTP
          <input value={otp} onChange={(e) => setOtp(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
