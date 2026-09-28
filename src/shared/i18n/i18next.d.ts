import 'i18next';

import type en from './en.json';

// 번역 키를 타입으로 검사한다. en.json이 키의 기준이다.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
