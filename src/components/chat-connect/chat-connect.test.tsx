import { Container as ChatConnect } from './chat-connect';

describe('ChatConnect', () => {
  describe('mapState', () => {
    test('isReconnecting', () => {
      const state = {
        chat: { isReconnecting: true },
      };

      const props = ChatConnect.mapState(state as any, { context: { isAuthenticated: true } } as any);

      expect(props).toEqual({ isReconnecting: true });
    });

    test('guard from not authenticated', () => {
      const props = ChatConnect.mapState({} as any, { context: { isAuthenticated: false } } as any);

      expect(props).toEqual({});
    });
  });
});
