'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { LanguageProvider } from '@/i18n';
import { SkipLink } from '@/components/SkipLink';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <SkipLink />
        <ApiStatusBanner />
        {children}
      </ToastProvider>
    </LanguageProvider>
  );
}
