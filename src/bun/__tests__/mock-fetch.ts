let originalFetch: typeof globalThis.fetch;

export function mockFetch(responses: Record<string, unknown>): void {
  originalFetch = globalThis.fetch;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).fetch = async (url: RequestInfo | URL) => {
    const urlStr = url.toString();
    for (const [pattern, data] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }
    return new Response('{}', { status: 200 });
  };
}

export function restoreFetch(): void {
  if (originalFetch) (globalThis as any).fetch = originalFetch;
}
