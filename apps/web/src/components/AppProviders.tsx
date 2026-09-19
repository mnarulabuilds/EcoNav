'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <ApiStatusBanner />
      {children}
    </ToastProvider>
  );
}
