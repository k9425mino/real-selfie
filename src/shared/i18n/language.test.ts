import en from './en.json';
import ko from './ko.json';
import { resolveLanguage } from './language';

describe('resolveLanguage', () => {
  it('한국어는 ko를 반환한다', () => {
    expect(resolveLanguage('ko')).toBe('ko');
  });

  it('그 외 언어와 알 수 없는 값은 en을 반환한다', () => {
    expect(resolveLanguage('en')).toBe('en');
    expect(resolveLanguage('ja')).toBe('en');
    expect(resolveLanguage(null)).toBe('en');
    expect(resolveLanguage(undefined)).toBe('en');
  });
});

function keyPaths(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keyPaths(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('번역 파일', () => {
  it('ko와 en의 키가 같다', () => {
    expect(keyPaths(ko).sort()).toEqual(keyPaths(en).sort());
  });
});
