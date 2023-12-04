import { Container } from './container';
import { StoreBuilder } from '../../../../store/test/store';
import { Stage } from '../../../../store/group-management';

describe(Container, () => {
  describe('mapState', () => {
    test('gets stage', () => {
      const state = new StoreBuilder().managingGroup({ stage: Stage.StartAddMemberToRoom });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ stage: Stage.StartAddMemberToRoom }));
    });
  });
});
