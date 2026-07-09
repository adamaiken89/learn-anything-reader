import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enGB from './locales/en-GB.json';
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';

const supported = ['en-US', 'en-GB', 'zh-TW', 'zh-CN'];

let detected = 'en-US';
try {
  const stored = localStorage.getItem('coursereader-locale');
  if (stored && supported.includes(stored)) {
    detected = stored;
  } else if (stored) {
    localStorage.removeItem('coursereader-locale');
  } else {
    detected = supported.includes(navigator.language) ? navigator.language : 'en-US';
  }
} catch {
  /* ignore */
}

void i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'en-GB': { translation: enGB },
    'zh-TW': { translation: zhTW },
    'zh-CN': { translation: zhCN },
  },
  lng: detected,
  fallbackLng: {
    default: ['en-US'],
  },
  interpolation: {
    escapeValue: false,
  },
});

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enUS;
    };
  }
}

export default i18n;
