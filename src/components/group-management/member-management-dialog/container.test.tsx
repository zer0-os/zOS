import { MemberManagementAction, MemberManagementDialogStage } from '../../../store/group-management';
import { StoreBuilder } from '../../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('gets the member management type', () => {
      const state = new StoreBuilder()
        .withUsers({ userId: 'user-id', firstName: 'Jack', lastName: 'Black' })
        .managingGroup({ memberMangement: { type: MemberManagementAction.RemoveMember } as any });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ type: MemberManagementAction.RemoveMember })
      );
    });

    test('gets the user name', () => {
      const state = new StoreBuilder()
        .withUsers({ userId: 'user-id', firstName: 'Jack', lastName: 'Black' })
        .managingGroup({ memberMangement: { userId: 'user-id' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ userName: 'Jack Black' }));
    });

    test('gets the room name', () => {
      const state = new StoreBuilder()
        .withConversationList({ id: 'room-id', name: 'Fun Room' })
        .managingGroup({ memberMangement: { roomId: 'room-id' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ roomName: 'Fun Room' }));
    });

    test('gets the remove member stage', () => {
      const state = new StoreBuilder().managingGroup({
        memberMangement: { stage: MemberManagementDialogStage.IN_PROGRESS } as any,
      });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ stage: MemberManagementDialogStage.IN_PROGRESS })
      );
    });

    test('gets the remove member error message', () => {
      const state = new StoreBuilder().managingGroup({ memberMangement: { error: 'an error' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ error: 'an error' }));
    });
  });
});
