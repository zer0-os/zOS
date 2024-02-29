import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { Channel } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { LeaveGroupDialogStatus } from '../../../store/group-management';
import { MessageInput } from '../../message-input/container';
import { Media } from '../../message-input/utils';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';
import { JoiningConversationDialog } from '../../joining-conversation-dialog';

import { StoreBuilder, stubAuthenticatedUser, stubConversation, stubUser } from '../../../store/test/store';
import { ConversationHeader } from './conversation-header';

const mockSearchMentionableUsersForChannel = jest.fn();
jest.mock('../../../platform-apps/channels/util/api', () => {
  return {
    searchMentionableUsersForChannel: (...args) => {
      mockSearchMentionableUsersForChannel(...args);
    },
  };
});

describe(DirectMessageChat, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      activeConversationId: '1',
      leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
      directMessage: { id: '1', otherMembers: [] } as any,
      canLeaveRoom: false,
      canEdit: false,
      canAddMembers: false,
      canViewDetails: false,
      sendMessage: () => null,
      onRemoveReply: () => null,
      isCurrentUserRoomAdmin: false,
      isJoiningConversation: false,
      startAddGroupMember: () => null,
      startEditConversation: () => null,
      setLeaveGroupStatus: () => null,
      viewGroupInformation: () => null,
      ...props,
    };

    return shallow(<DirectMessageChat {...allProps} />);
  };

  it('render channel view component', function () {
    const wrapper = subject({ activeConversationId: '123' });

    expect(wrapper.find(ChatViewContainer)).toHaveProp('channelId', '123');
  });

  it('renders JoiningConversationDialog when isJoiningConversation is true', () => {
    const wrapper = subject({ isJoiningConversation: true });

    expect(wrapper).toHaveElement(JoiningConversationDialog);
  });

  it('does not render ChatViewContainer when isJoiningConversation is true', () => {
    const wrapper = subject({ isJoiningConversation: true });

    expect(wrapper).not.toHaveElement(ChatViewContainer);
  });

  it('renders ChatViewContainer when isJoiningConversation is false', () => {
    const wrapper = subject({
      isJoiningConversation: false,
      activeConversationId: '123',
      directMessage: { otherMembers: [stubUser({ firstName: 'Johnny', lastName: 'Sanderson' })] } as Channel,
    });

    expect(wrapper).toHaveElement(ChatViewContainer);
  });

  it('does not render JoiningConversationDialog when isJoiningConversation is false', () => {
    const wrapper = subject({ isJoiningConversation: false });

    expect(wrapper).not.toHaveElement(JoiningConversationDialog);
  });

  it('calls start add group member', async function () {
    const startAddGroupMember = jest.fn();
    const wrapper = subject({ startAddGroupMember });

    wrapper.find(ConversationHeader).simulate('addMember');

    expect(startAddGroupMember).toHaveBeenCalledOnce();
  });

  describe('leave group dialog', () => {
    it('renders leave group dialog when status is OPEN', async () => {
      const wrapper = subject({ leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN });

      expect(wrapper).toHaveElement(LeaveGroupDialogContainer);
    });

    it('renders leave group dialog when status is IN_PROGRESS', () => {
      const wrapper = subject({ leaveGroupDialogStatus: LeaveGroupDialogStatus.IN_PROGRESS });

      expect(wrapper).toHaveElement(LeaveGroupDialogContainer);
    });

    it('does not render leave group dialog when LeaveGroupDialogStatus is closed', () => {
      const wrapper = subject({ leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED });

      expect(wrapper).not.toHaveElement(LeaveGroupDialogContainer);
    });

    it('passes name and roomId to leave group dialog', () => {
      const wrapper = subject({
        leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN,
        directMessage: { name: 'group-name', otherMembers: [] } as Channel,
        activeConversationId: 'room-id',
      });

      const leaveGroupDialog = wrapper.find(LeaveGroupDialogContainer);

      expect(leaveGroupDialog).toHaveProp('roomId', 'room-id');
      expect(leaveGroupDialog).toHaveProp('groupName', 'group-name');
    });
  });

  describe('message input', () => {
    it('passes sendMessage prop to message input', () => {
      const sendMessage = jest.fn();
      const message = 'test message';
      const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
      const channelId = 'the-channel-id';

      const wrapper = subject({ sendMessage, activeConversationId: channelId });

      wrapper.find(MessageInput).simulate('submit', message, mentionedUserIds, []);

      expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ channelId, message, mentionedUserIds }));
    });

    it('calls sendMessage with reply', () => {
      const sendMessage = jest.fn();
      const message = 'test message';
      const channelId = 'the-channel-id';
      const reply = { id: 1, message: 'reply message' };

      const wrapper = subject({
        sendMessage,
        activeConversationId: channelId,
        directMessage: { reply, otherMembers: [] } as any,
      });

      wrapper.find(MessageInput).simulate('submit', message, [], []);

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ channelId, message, mentionedUserIds: [], parentMessage: reply })
      );
    });

    it('calls sendMessage with File', () => {
      const sendMessage = jest.fn();
      const message = 'test message';
      const channelId = 'the-channel-id';

      const wrapper = subject({ sendMessage, activeConversationId: channelId });

      wrapper.find(MessageInput).simulate('submit', message, [], [{ id: 'file-id', name: 'file-name' } as Media]);

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ channelId, files: [{ id: 'file-id', name: 'file-name' }] })
      );
    });

    it('searches for user mentions', async () => {
      const wrapper = subject({ activeConversationId: '5', directMessage: { otherMembers: [] } as any });
      const input = wrapper.find(MessageInput);

      await input.prop('getUsersForMentions')('bob');

      expect(mockSearchMentionableUsersForChannel).toHaveBeenCalledWith('5', 'bob', []);
    });
  });

  describe('mapState', () => {
    describe('canLeaveRoom', () => {
      it('is false when only when one other member', () => {
        const state = new StoreBuilder().withActiveConversation(stubConversation({ otherMembers: [stubUser()] }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canLeaveRoom: false }));
      });

      it('is false when user is admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ otherMembers: [stubUser(), stubUser()], adminMatrixIds: ['current-user-matrix-id'] })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canLeaveRoom: false }));
      });

      it('is true when user is not admin and more than one other member', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ otherMembers: [stubUser(), stubUser()], adminMatrixIds: ['other-user-matrix-id'] })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canLeaveRoom: true }));
      });
    });

    describe('canEdit', () => {
      it('is false when one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(stubConversation({ isOneOnOne: true }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canEdit: false }));
      });

      it('is false when current user is not room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(stubConversation({ isOneOnOne: false, adminMatrixIds: ['other-user-matrix-id'] }))
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canEdit: false }));
      });

      it('is true when current user is room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(stubConversation({ isOneOnOne: false, adminMatrixIds: ['current-user-matrix-id'] }))
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canEdit: true }));
      });
    });

    describe('canAddMembers', () => {
      it('is false when one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(stubConversation({ isOneOnOne: true }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: false }));
      });

      it('is false when current user is not room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(stubConversation({ isOneOnOne: false, adminMatrixIds: ['other-user-matrix-id'] }))
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: false }));
      });

      it('is true when current user is room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(stubConversation({ isOneOnOne: false, adminMatrixIds: ['current-user-matrix-id'] }))
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canAddMembers: true }));
      });
    });

    describe('canViewDetails', () => {
      it('is false when one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(stubConversation({ isOneOnOne: true }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canViewDetails: false }));
      });

      it('is true when not a one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(stubConversation({ isOneOnOne: false }));

        expect(DirectMessageChat.mapState(state.build())).toEqual(expect.objectContaining({ canViewDetails: true }));
      });
    });
  });
});
