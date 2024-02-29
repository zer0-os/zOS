import { StoreBuilder } from '../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('returns empty props', () => {
      const state = new StoreBuilder();

      expect(Container.mapState(state.build())).toEqual({});
    });
  });
});
