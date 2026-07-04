import { createMockRPC } from './mockRPC';

export const Electroview = {
  defineRPC: () => {
    const mock = createMockRPC();
    return {
      request: mock.request,
      send: () => {},
      proxy: { request: mock.request, send: {} },
      addMessageListener: () => {},
      removeMessageListener: () => {},
    };
  },
};
