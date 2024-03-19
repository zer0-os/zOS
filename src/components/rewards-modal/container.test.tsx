import { StoreBuilder } from '../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('totalUSD', () => {
      const state = new StoreBuilder().withOtherState({
        rewards: {
          meow: '2000000000000000000',
          meowInUSD: 0.45,
        },
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ totalUSD: '$0.90' }));
    });

    test('totalMeow', () => {
      const state = new StoreBuilder().withOtherState({
        rewards: {
          meow: '9123456789111315168',
        },
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ totalMeow: '9.12 MEOW' }));
    });
  });
});
