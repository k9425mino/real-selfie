export type AppLanguage = 'ko' | 'en';

// 기기 언어가 한국어면 ko, 그 외는 모두 en (TECH_SPEC §10)
export function resolveLanguage(languageCode: string | null | undefined): AppLanguage {
  return languageCode === 'ko' ? 'ko' : 'en';
}
