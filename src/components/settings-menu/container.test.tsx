import { StoreBuilder } from '../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('hasUnviewedRewards', () => {
      const state = new StoreBuilder().withOtherState({ rewards: { showNewRewardsIndicator: true } });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ hasUnviewedRewards: true }));
    });
  });
});
