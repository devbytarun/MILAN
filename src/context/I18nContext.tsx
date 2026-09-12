import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../i18n/languages.ts';
import { LanguageCode, LanguageInfo, TranslationDictionary } from '../i18n/types.ts';
import { locales } from '../i18n/locales/index.ts';

import { activateLiveDomTranslationEngine, sweepLiveDom } from '../i18n/dom-translation-engine.ts';

export { SUPPORTED_LANGUAGES };
export type { LanguageCode, LanguageInfo, TranslationDictionary };

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguageInfo: LanguageInfo;
  isRTL: boolean;
  t: (key: keyof TranslationDictionary) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = (localStorage.getItem('milan_locale') || localStorage.getItem('milan_language')) as LanguageCode;
      if (saved && locales[saved]) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const isRTL = Boolean(currentLanguageInfo.isRTL);

  const setLanguage = (lang: LanguageCode) => {
    if (locales[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem('milan_locale', lang);
        localStorage.setItem('milan_language', lang);
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          sweepLiveDom(lang);
        });
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    if (isRTL) {
      document.body.classList.add('rtl-layout');
    } else {
      document.body.classList.remove('rtl-layout');
    }

    // Wake up the invisible background DOM neural translation engine (< 30ms)
    const cleanup = activateLiveDomTranslationEngine(language);
    return () => {
      cleanup();
    };
  }, [language, isRTL]);

  const t = (key: keyof TranslationDictionary): string => {
    const langDict = locales[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (import.meta.env?.DEV) {
      console.warn(`[i18n] Missing key "${String(key)}" in language "${language}", falling back to English.`);
    }
    return locales.en[key] || String(key);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageInfo,
        isRTL,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
