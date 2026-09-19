import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageService } from '../services/accessibility/LanguageService';
import type { SupportedLanguageCode } from '../types';
import { translations } from '../services/accessibility/translations';

interface LanguageContextProps {
  language: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguageCode>('as');

  useEffect(() => {
    // Initialize from PatientService / LocalStorage
    const savedLang = LanguageService.getCurrentLanguageCode();
    setLanguageState(savedLang);
  }, []);

  const setLanguage = (lang: SupportedLanguageCode) => {
    setLanguageState(lang);
    LanguageService.setLanguage(lang); // Persists to local storage via PatientService
  };

  const t = (key: string, fallback?: string): string => {
    // Try current language first
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    
    // Fallback to English
    const enDict = translations['en'];
    if (enDict && enDict[key]) {
      if (import.meta.env.DEV) {
        console.warn(`[I18N] Missing translation for key: "${key}" in language: "${language}"`);
      }
      return enDict[key];
    }

    // Ultimate fallback is the provided fallback or humanized key (never the raw dot-notation key)
    if (import.meta.env.DEV) {
      console.warn(`[I18N] Missing translation key completely: "${key}"`);
    }
    
    if (fallback) return fallback;
    
    // Humanize the key: 'game.memoryMatch.title' -> 'Title' or 'Memory Match Title'
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    // Convert camelCase or snake_case to Title Case
    return lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
