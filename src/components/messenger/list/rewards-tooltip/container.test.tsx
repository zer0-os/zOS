import { StoreBuilder } from '../../../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('meowPreviousDayInUSD', () => {
      const state = new StoreBuilder().withOtherState({
        rewards: {
          meowPreviousDay: '9123456789111315168',
          meowInUSD: 0.45,
        },
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ meowPreviousDayInUSD: '$4.11' }));
    });

    test('isLoading', () => {
      const state = new StoreBuilder().withOtherState({
        rewards: {
          meowPreviousDay: '0',
          loading: true,
        },
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ isLoading: true }));
    });

    test('isOpen', () => {
      const state = new StoreBuilder().withOtherState({
        rewards: {
          showRewardsInTooltip: true,
          meowPreviousDay: '0',
        },
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ isOpen: true }));
    });
  });
});
