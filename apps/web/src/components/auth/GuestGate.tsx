'use client';

import type { PlatformUser } from '@econav/platform';
import { LoginPanel } from '@/components/LoginPanel';
import { PageLoader } from '@/components/ui/PageLoader';

interface GuestGateProps {
  loading: boolean;
  user: PlatformUser | null;
  onLoggedIn: (user: PlatformUser) => void;
  loaderLabel?: string;
  children: React.ReactNode;
}

/** Shows loader, login, or authenticated content — consistent a11y & UX. */
export function GuestGate({
  loading,
  user,
  onLoggedIn,
  loaderLabel = 'Loading…',
  children,
}: GuestGateProps) {
  if (loading) {
    return <PageLoader label={loaderLabel} />;
  }
  if (!user) {
    return <LoginPanel onLoggedIn={onLoggedIn} />;
  }
  return <>{children}</>;
}
