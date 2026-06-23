import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';

const state = {
  exists: true,
  data: JSON.stringify({
    highlights: [],
    notes: [],
    bookmarks: [],
    completedModules: [],
    studySessions: [],
    userCards: [],
  }),
};

mock.module('fs', () => ({
  existsSync: () => state.exists,
  readFileSync: () => state.data,
  writeFileSync: (_path: unknown, raw: string) => {
    state.data = raw;
  },
  mkdirSync: () => {},
}));

import { hasAPIKey, setAPIKey, askGemini } from '../gemini';
import { restoreFetch } from './mock-fetch';

let origFetch: typeof globalThis.fetch;

beforeEach(() => {
  state.data = JSON.stringify({
    highlights: [],
    notes: [],
    bookmarks: [],
    completedModules: [],
    studySessions: [],
    userCards: [],
  });
  origFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = origFetch;
  restoreFetch();
});

describe('hasAPIKey', () => {
  test('returns false when no key set', () => {
    expect(hasAPIKey()).toBe(false);
  });

  test('returns true after setAPIKey', () => {
    setAPIKey('test-key');
    expect(hasAPIKey()).toBe(true);
  });
});

describe('setAPIKey', () => {
  test('stores key and makes hasAPIKey return true', () => {
    setAPIKey('my-key-abc');
    expect(hasAPIKey()).toBe(true);
    // verify through storage round-trip
    setAPIKey('different-key');
    expect(hasAPIKey()).toBe(true);
  });
});

describe('askGemini', () => {
  test('throws error when no API key set', async () => {
    expect(askGemini('question', 'context')).rejects.toThrow(
      'No API key set. Set your Gemini API key in Settings.',
    );
  });

  test('throws error on non-ok response', async () => {
    setAPIKey('test-key');
    globalThis.fetch = (async () => new Response('Not Found', { status: 404 })) as any;
    await expect(askGemini('q', 'ctx')).rejects.toThrow('API error (404): Not Found');
  });

  test('throws error when response has no candidates', async () => {
    setAPIKey('test-key');
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ candidates: [] }), { status: 200 })) as any;
    await expect(askGemini('q', 'ctx')).rejects.toThrow('Invalid response from API.');
  });

  test('throws error when response has no text', async () => {
    setAPIKey('test-key');
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{}] } }] }), {
        status: 200,
      })) as any;
    await expect(askGemini('q', 'ctx')).rejects.toThrow('Invalid response from API.');
  });

  test('returns text from valid response', async () => {
    setAPIKey('test-key');
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Hello from Gemini' }] } }],
        }),
        { status: 200 },
      )) as any;
    const result = await askGemini('What is 2+2?', 'Math context');
    expect(result).toBe('Hello from Gemini');
  });

  test('sends correct request body', async () => {
    setAPIKey('test-key');
    let sentBody: string | undefined;
    globalThis.fetch = (async (_url: any, init: any) => {
      sentBody = init?.body as string;
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'ok' }] } }],
        }),
        { status: 200 },
      );
    }) as any;
    await askGemini('my question', 'my context');
    const parsed = JSON.parse(sentBody!);
    expect(parsed.contents[0].parts[0].text).toContain('my question');
    expect(parsed.contents[0].parts[0].text).toContain('my context');
  });
});
