import React from 'react';
import { MemberManagementAction, MemberManagementDialogStage } from '../../../store/group-management';
import { StoreBuilder } from '../../../store/test/store';
import { Container, RemoveMember, Properties } from './container';
import { shallow } from 'enzyme';
import { MemberManagementDialog } from '.';

describe(Container, () => {
  describe('mapState', () => {
    test('gets the member management type', () => {
      const state = new StoreBuilder()
        .withUsers({ userId: 'user-id', firstName: 'Jack', lastName: 'Black' })
        .managingGroup({ memberManagement: { type: MemberManagementAction.RemoveMember } as any });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ type: MemberManagementAction.RemoveMember })
      );
    });

    test('gets the user name', () => {
      const state = new StoreBuilder()
        .withUsers({ userId: 'user-id', firstName: 'Jack', lastName: 'Black' })
        .managingGroup({ memberManagement: { userId: 'user-id' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ userName: 'Jack Black' }));
    });

    test('gets the room name', () => {
      const state = new StoreBuilder()
        .withConversationList({ id: 'room-id', name: 'Fun Room' })
        .managingGroup({ memberManagement: { roomId: 'room-id' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ roomName: 'Fun Room' }));
    });

    test('gets the remove member stage', () => {
      const state = new StoreBuilder().managingGroup({
        memberManagement: { stage: MemberManagementDialogStage.IN_PROGRESS } as any,
      });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ stage: MemberManagementDialogStage.IN_PROGRESS })
      );
    });

    test('gets the remove member error message', () => {
      const state = new StoreBuilder().managingGroup({ memberManagement: { error: 'an error' } as any });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ error: 'an error' }));
    });
  });

  describe('container actions', () => {
    const subject = (props: Partial<Properties>) => {
      const allProps: Properties = {
        type: MemberManagementAction.RemoveMember,
        stage: MemberManagementDialogStage.IN_PROGRESS,
        userId: 'user-id',
        roomId: 'room-id',
        error: '',
        userName: 'Jack Black',
        roomName: 'Fun Room',
        cancel: jest.fn(),
        remove: jest.fn(),
        setAsMod: jest.fn(),
        removeAsMod: jest.fn(),
        ...props,
      };

      return shallow(<Container {...allProps} />);
    };

    it('passes confirmation definition to dialog', () => {
      const wrapper = subject({
        type: MemberManagementAction.RemoveMember,
        roomName: 'Fun Room',
        userName: 'Jack Black',
      });

      const expectedDefinition = new RemoveMember('Jack Black', 'Fun Room');

      expect(wrapper.find(MemberManagementDialog).prop('definition').getMessage()).toEqual(
        expectedDefinition.getMessage()
      );
      expect(wrapper.find(MemberManagementDialog).prop('definition').getProgressMessage()).toEqual(
        expectedDefinition.getProgressMessage()
      );
      expect(wrapper.find(MemberManagementDialog).prop('definition').getTitle()).toEqual(expectedDefinition.getTitle());
    });
  });
});
