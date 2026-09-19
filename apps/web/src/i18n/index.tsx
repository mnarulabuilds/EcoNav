'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en, type Messages } from './locales/en';
import { hi } from './locales/hi';

export type Locale = 'en' | 'hi';

const STORAGE_KEY = 'cityconnect_locale';

const catalogs: Record<Locale, Messages> = { en, hi };

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'hi' ? 'hi' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === 'hi' ? 'hi' : 'en';
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'hi' ? 'hi' : 'en';
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: catalogs[locale],
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}
