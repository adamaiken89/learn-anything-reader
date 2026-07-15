export const mockResponses = new Map<string, unknown>();

export const defaultMocks: Record<string, unknown> = {
  setWindowTitle: undefined,
};

export function clearMocks() {
  mockResponses.clear();
}
