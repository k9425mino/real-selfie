import { getLocales, useLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { useEffect } from 'react';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ko from './ko.json';
import { resolveLanguage } from './language';

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: resolveLanguage(getLocales()[0]?.languageCode),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// 앱 실행 중 기기 언어(또는 Android 앱별 언어)가 바뀌면 즉시 반영한다.
export function useDeviceLanguage() {
  const languageCode = useLocales()[0]?.languageCode;

  useEffect(() => {
    i18n.changeLanguage(resolveLanguage(languageCode));
  }, [languageCode]);
}
