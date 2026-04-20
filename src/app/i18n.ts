import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import authEn from '../locales/en/auth.json';
import candidatesEn from '../locales/en/candidates.json';
import commonEn from '../locales/en/common.json';
import dashboardEn from '../locales/en/dashboard.json';
import inboxEn from '../locales/en/inbox.json';
import jobsEn from '../locales/en/jobs.json';
import shellEn from '../locales/en/shell.json';
import sysadminEn from '../locales/en/sysadmin.json';
import authPt from '../locales/pt/auth.json';
import candidatesPt from '../locales/pt/candidates.json';
import commonPt from '../locales/pt/common.json';
import dashboardPt from '../locales/pt/dashboard.json';
import inboxPt from '../locales/pt/inbox.json';
import jobsPt from '../locales/pt/jobs.json';
import shellPt from '../locales/pt/shell.json';
import sysadminPt from '../locales/pt/sysadmin.json';

export const defaultLocale = 'en';

export const resources = {
  en: {
    auth: authEn,
    candidates: candidatesEn,
    common: commonEn,
    dashboard: dashboardEn,
    inbox: inboxEn,
    jobs: jobsEn,
    shell: shellEn,
    sysadmin: sysadminEn,
  },
  pt: {
    auth: authPt,
    candidates: candidatesPt,
    common: commonPt,
    dashboard: dashboardPt,
    inbox: inboxPt,
    jobs: jobsPt,
    shell: shellPt,
    sysadmin: sysadminPt,
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
      ns: ['common', 'auth', 'shell', 'dashboard', 'inbox', 'jobs', 'candidates', 'sysadmin'],
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
