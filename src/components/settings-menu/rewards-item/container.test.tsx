import { StoreBuilder } from '../../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('totalUSD', () => {
      const state = new StoreBuilder().withOtherState({ rewards: {} });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ totalUSD: '$1.00' }));
    });
  });
});
