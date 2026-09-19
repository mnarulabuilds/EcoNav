'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { LanguageProvider } from '@/i18n';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ApiStatusBanner />
        {children}
      </ToastProvider>
    </LanguageProvider>
  );
}
