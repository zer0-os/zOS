import { Container } from './container';

describe(Container, () => {
  describe('mapActions', () => {
    it('returns forceLogout action', () => {
      expect(Container.mapActions({ forceLogout: jest.fn() })).toEqual({ forceLogout: expect.any(Function) });
    });
  });
});
