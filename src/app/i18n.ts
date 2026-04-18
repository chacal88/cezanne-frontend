import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import authEn from '../locales/en/auth.json';
import commonEn from '../locales/en/common.json';
import dashboardEn from '../locales/en/dashboard.json';
import inboxEn from '../locales/en/inbox.json';
import shellEn from '../locales/en/shell.json';
import authPt from '../locales/pt/auth.json';
import commonPt from '../locales/pt/common.json';
import dashboardPt from '../locales/pt/dashboard.json';
import inboxPt from '../locales/pt/inbox.json';
import shellPt from '../locales/pt/shell.json';

export const defaultLocale = 'en';

export const resources = {
  en: {
    auth: authEn,
    common: commonEn,
    dashboard: dashboardEn,
    inbox: inboxEn,
    shell: shellEn,
  },
  pt: {
    auth: authPt,
    common: commonPt,
    dashboard: dashboardPt,
    inbox: inboxPt,
    shell: shellPt,
  },
} as const;

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLocale,
      fallbackLng: defaultLocale,
      defaultNS: 'common',
      ns: ['common', 'auth', 'shell', 'dashboard', 'inbox'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['querystring', 'navigator'],
        caches: [],
      },
      returnNull: false,
    });
}

export { i18n };
