import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LanguageCode, LanguageInfo, SUPPORTED_LANGUAGES, TranslationDict } from './types';
import { TRANSLATIONS } from './translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationDict | string, defaultText?: string) => string;
  tCategory: (categoryName: string) => string;
  isRTL: boolean;
  currentLanguageInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'satquery_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang);
      }
    }
  };

  const isRTL = useMemo(() => {
    const info = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    return !!info?.isRTL;
  }, [language]);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  // Synchronize HTML attributes for accessibility and layout direction
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      if (isRTL) {
        document.documentElement.classList.add('rtl-layout');
      } else {
        document.documentElement.classList.remove('rtl-layout');
      }
    }
  }, [language, isRTL]);

  const t = (key: keyof TranslationDict | string, defaultText?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    const val = (dict as any)[key];
    if (val) return val;
    // Fallback to English
    const enVal = (TRANSLATIONS.en as any)[key];
    if (enVal) return enVal;
    return defaultText || key;
  };

  const tCategory = (categoryName: string): string => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('veg') || lower.includes('forest') || lower.includes('canopy')) {
      return t('env.vegTitle', 'Vegetation & Canopy Health');
    }
    if (lower.includes('water') || lower.includes('lake') || lower.includes('river')) {
      return t('env.waterTitle', 'Water Bodies & Reservoirs');
    }
    if (lower.includes('urban') || lower.includes('built') || lower.includes('construction')) {
      return t('env.urbanTitle', 'Urban Expansion & Growth');
    }
    if (lower.includes('agri') || lower.includes('crop') || lower.includes('barren')) {
      return t('env.agriTitle', 'Agricultural Productivity');
    }
    return categoryName;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tCategory,
        isRTL,
        currentLanguageInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
