import { Container } from './container';
import { StoreBuilder } from '../../../../store/test/store';

describe(Container, () => {
  describe('mapState', () => {
    test('gets activeConversationId', () => {
      const state = new StoreBuilder().withActiveConversationId('id');

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ activeConversationId: 'id' }));
    });

    test('gets conversationModeratorIds', () => {
      const state = new StoreBuilder().withActiveConversation({
        id: 'id',
        moderatorIds: ['moderator-id-1', 'moderator-id-2'],
      });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ conversationModeratorIds: ['moderator-id-1', 'moderator-id-2'] })
      );
    });

    test('gets allowModeratorManagement', () => {
      const state = new StoreBuilder().withCurrentUser({ matrixId: 'admin-id' }).withActiveConversation({
        id: 'id',
        adminMatrixIds: ['admin-id'],
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ allowModeratorManagement: true }));
    });
  });
});
