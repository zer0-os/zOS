import { Container } from './container';
import { StoreBuilder } from '../../../../store/test/store';
import { Stage } from '../../../../store/group-management';

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
  });
});
