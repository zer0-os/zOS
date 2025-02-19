import { Container } from './container';
import { StoreBuilder } from '../../../store/test/store';
import { Stage } from '../../../store/group-management';
import { EditConversationState } from '../../../store/group-management/types';

describe(Container, () => {
  describe('mapState', () => {
    test('gets stage', () => {
      const state = new StoreBuilder().managingGroup({ stage: Stage.StartAddMemberToRoom });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ stage: Stage.StartAddMemberToRoom }));
    });

    test('gets isAddingMembers', () => {
      const state = new StoreBuilder().managingGroup({ isAddingMembers: true });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ isAddingMembers: true }));
    });

    test('gets addMemberError', () => {
      const state = new StoreBuilder().managingGroup({ addMemberError: 'error' });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ addMemberError: 'error' }));
    });

    test('gets errors', () => {
      const state = new StoreBuilder().managingGroup({
        errors: { editConversationErrors: { image: 'image error', general: 'general error' } },
      });
      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({
          errors: { editConversationErrors: { image: 'image error', general: 'general error' } },
        })
      );
    });

    test('gets name', () => {
      const state = new StoreBuilder().managingGroup({}).withActiveConversation({ id: 'id', name: 'name' });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ name: 'name' }));
    });

    test('gets conversationIcon', () => {
      const state = new StoreBuilder().managingGroup({}).withActiveConversation({ id: 'id', icon: 'icon' });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ conversationIcon: 'icon' }));
    });

    test('gets editConversationState', () => {
      const state = new StoreBuilder().managingGroup({ editConversationState: EditConversationState.NONE });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ editConversationState: EditConversationState.NONE })
      );
    });

    test('gets conversationModeratorIds', () => {
      const state = new StoreBuilder()
        .managingGroup({})
        .withActiveConversation({ id: 'user-id', moderatorIds: ['user-id'] });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ conversationModeratorIds: ['user-id'] })
      );
    });

    describe('canAddMembers', () => {
      test('gets true when user is admin', () => {
        const state = new StoreBuilder()
          .managingGroup({})
          .withCurrentUser({ matrixId: 'user-id' })
          .withActiveConversation({ id: 'user-id', adminMatrixIds: ['user-id'] });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: true }));
      });

      test('gets true when user is moderator', () => {
        const state = new StoreBuilder()
          .managingGroup({})
          .withCurrentUser({ id: 'user-id' })
          .withActiveConversation({ id: 'user-id', moderatorIds: ['user-id'] });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: true }));
      });

      test('gets false when user is not admin or moderator', () => {
        const state = new StoreBuilder().managingGroup({}).withActiveConversation({ id: 'user-id' });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: false }));
      });

      test('gets false when conversation is one on one', () => {
        const state = new StoreBuilder().managingGroup({}).withActiveConversation({ id: 'user-id', isOneOnOne: true });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: false }));
      });

      test('gets false when conversation is social channel', () => {
        const state = new StoreBuilder()
          .managingGroup({})
          .withActiveConversation({ id: 'user-id', isSocialChannel: true });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: false }));
      });
    });

    describe('canEditGroup', () => {
      test('gets true when user is admin', () => {
        const state = new StoreBuilder()
          .managingGroup({})
          .withCurrentUser({ matrixId: 'user-id' })
          .withActiveConversation({ id: 'user-id', adminMatrixIds: ['user-id'] });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canEditGroup: true }));
      });

      test('gets true when user is moderator', () => {
        const state = new StoreBuilder()
          .managingGroup({})
          .withCurrentUser({ id: 'user-id' })
          .withActiveConversation({ id: 'user-id', moderatorIds: ['user-id'] });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canEditGroup: true }));
      });

      test('gets false when user is not admin or moderator', () => {
        const state = new StoreBuilder().managingGroup({}).withActiveConversation({ id: 'user-id' });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canEditGroup: false }));
      });

      test('gets false when conversation is social channel', () => {
        const state = new StoreBuilder()
          .managingGroup({})
          .withActiveConversation({ id: 'user-id', isSocialChannel: true });

        expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ canEditGroup: false }));
      });
    });

    it('gets users', () => {
      const state = new StoreBuilder()
        .managingGroup({})
        .withUsers({ userId: 'user-id-1', matrixId: 'matrix-id-1', firstName: 'Jack' })
        .withUsers({ userId: 'user-id-2', matrixId: 'matrix-id-2', firstName: 'Jill' });

      const users = Container.mapState(state.build()).users;

      expect(users['user-id-1']).toEqual(
        expect.objectContaining({ userId: 'user-id-1', matrixId: 'matrix-id-1', firstName: 'Jack' })
      );
      expect(users['user-id-2']).toEqual(
        expect.objectContaining({ userId: 'user-id-2', matrixId: 'matrix-id-2', firstName: 'Jill' })
      );
    });
  });
});
