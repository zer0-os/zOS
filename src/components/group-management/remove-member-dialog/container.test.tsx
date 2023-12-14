import { RemoveMemberDialogStage } from '../../../store/group-management';
import { StoreBuilder } from '../../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('gets the user name', () => {
      const state = new StoreBuilder()
        .withUsers({ userId: 'user-id', firstName: 'Jack', lastName: 'Black' })
        .managingGroup({ removeMember: { userId: 'user-id' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ userName: 'Jack Black' }));
    });

    test('gets the room name', () => {
      const state = new StoreBuilder()
        .withConversationList({ id: 'room-id', name: 'Fun Room' })
        .managingGroup({ removeMember: { roomId: 'room-id' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ roomName: 'Fun Room' }));
    });

    test('gets the remove member stage', () => {
      const state = new StoreBuilder().managingGroup({
        removeMember: { stage: RemoveMemberDialogStage.IN_PROGRESS } as any,
      });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ stage: RemoveMemberDialogStage.IN_PROGRESS })
      );
    });

    test('gets the remove member error message', () => {
      const state = new StoreBuilder().managingGroup({ removeMember: { error: 'an error' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ error: 'an error' }));
    });
  });
});
