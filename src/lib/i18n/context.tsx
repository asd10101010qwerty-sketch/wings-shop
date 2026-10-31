'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '@/types';
import { translations, formatCurrency } from './translations';

type DeepString<T> = {
  [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};
export type TranslationsType = DeepString<typeof translations.uz>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationsType;
  formatPrice: (amount: number) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('uz');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('wings_locale') as Locale | null;
    if (saved && (saved === 'uz' || saved === 'ru' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wings_locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  const t = translations[locale] || translations.uz;

  const formatPrice = (amount: number) => formatCurrency(amount, locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatPrice }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback for SSR or outside provider
    return {
      locale: 'uz' as Locale,
      setLocale: () => {},
      t: translations.uz,
      formatPrice: (amount: number) => formatCurrency(amount, 'uz'),
    };
  }
  return context;
}
