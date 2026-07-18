export const mockResponses = new Map<string, unknown>();

export const defaultMocks: Record<string, unknown> = {
  setWindowTitle: undefined,
  openExternal: { ok: true },
};

export function clearMocks() {
  mockResponses.clear();
}
