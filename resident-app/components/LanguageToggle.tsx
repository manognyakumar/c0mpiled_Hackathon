/**
 * LanguageToggle Component
 * Allows switching between EN and AR with RTL support
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Locale } from '@/lib/types';
import { getLocale, setLocale as saveLocale, isRTL } from '@/lib/i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {}
});

export function useLocale() {
  return useContext(LocaleContext);
}

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isMounted, setIsMounted] = useState(false);

  // Initialize locale from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const storedLocale = getLocale();
    setLocaleState(storedLocale);
    setIsMounted(true);

    // Apply direction to document
    document.documentElement.dir = isRTL(storedLocale) ? 'rtl' : 'ltr';
    document.documentElement.lang = storedLocale;
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
    
    // Update document direction
    document.documentElement.dir = isRTL(newLocale) ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  // Prevent hydration mismatch by rendering placeholder during SSR
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <button className="language-toggle" onClick={toggleLocale}>
      {locale === 'en' ? 'العربية' : 'EN'}
    </button>
  );
}
