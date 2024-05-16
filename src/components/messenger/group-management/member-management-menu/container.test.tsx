import { Container } from './container';
import { StoreBuilder } from '../../../../store/test/store';

describe(Container, () => {
  describe('mapState', () => {
    test('gets activeConversationId', () => {
      const state = new StoreBuilder().withActiveConversationId('id');

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ activeConversationId: 'id' }));
    });
  });
});
