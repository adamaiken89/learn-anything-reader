import { describe, expect, test } from 'bun:test';

import enGB from './locales/en-GB.json';
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';

const locales = { 'en-US': enUS, 'en-GB': enGB, 'zh-TW': zhTW, 'zh-CN': zhCN };

type LocaleValue = string | { [key: string]: LocaleValue };
type Locale = { [key: string]: LocaleValue };

function findTransTags(obj: Locale, prefix = ''): string[] {
  const bad: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string' && /<[0-9]+>/.test(value)) {
      bad.push(`${fullKey}: "${value}"`);
    } else if (typeof value === 'object' && value !== null) {
      bad.push(...findTransTags(value, fullKey));
    }
  }
  return bad;
}

describe('i18n locale strings', () => {
  for (const [lang, strings] of Object.entries(locales)) {
    test(`${lang} must not contain raw <N> Trans tags`, () => {
      const bad = findTransTags(strings);
      expect(bad).toEqual([]);
    });
  }
});
