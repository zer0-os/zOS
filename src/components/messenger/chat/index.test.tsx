/**
 * @jest-environment jsdom
 */

import React from 'react';
// import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { Channel, User } from '../../../store/channels';
import Tooltip from '../../tooltip';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { GroupManagementMenu } from '../../group-management-menu';
import { LeaveGroupDialogStatus } from '../../../store/group-management';
import { MessageInput } from '../../message-input/container';
import { Media } from '../../message-input/utils';
import { IconCurrencyEthereum, IconUsers1 } from '@zero-tech/zui/icons';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';
import { JoiningConversationDialog } from '../../joining-conversation-dialog';

import { bem } from '../../../lib/bem';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import { StoreBuilder, stubAuthenticatedUser } from '../../../store/test/store';

const c = bem('.direct-message-chat');

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

    return mount(
      <Provider store={store}>
        <DirectMessageChat {...allProps} />
      </Provider>
    );
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

  describe('one on one chat', function () {
    it('can start add group member group management saga', async function () {
      const startAddGroupMember = jest.fn();
      const wrapper = subject({ startAddGroupMember });

      wrapper.find(GroupManagementMenu).prop('onStartAddMember')();

      expect(startAddGroupMember).toHaveBeenCalledOnce();
    });
  });

  describe('one to many chat', function () {
    it('header renders full names in the title', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [
            stubUser({ firstName: 'Johnny', lastName: 'Sanderson' }),
            stubUser({ firstName: 'Jack', lastName: 'Black' }),
          ],
        } as Channel,
      });

      const tooltip = wrapper.find(Tooltip);

      expect(tooltip.html()).toContain('Johnny Sanderson, Jack Black');
    });

    it('header renders online status in the subtitle if any member is online', function () {
      const wrapper = subject({
        directMessage: { otherMembers: [stubUser({ isOnline: false }), stubUser({ isOnline: true })] } as Channel,
      });

      const subtitle = wrapper.find(c('subtitle'));

      expect(subtitle).toHaveText('Online');
    });

    it('header renders online status if any member is online', function () {
      const wrapper = subject({
        directMessage: { otherMembers: [stubUser({ isOnline: false }), stubUser({ isOnline: true })] } as Channel,
      });

      expect(wrapper).toHaveElement(c('header-avatar--online'));
    });

    it('header renders offline status', function () {
      const wrapper = subject({
        directMessage: { otherMembers: [stubUser({ isOnline: false }), stubUser({ isOnline: false })] } as Channel,
      });

      expect(wrapper).toHaveElement(c('header-avatar--offline'));
    });

    it('header renders avatar with group icon when there is no avatar url', function () {
      const wrapper = subject({
        directMessage: { otherMembers: [stubUser(), stubUser()] } as Channel,
      });

      const headerAvatar = wrapper.find(c('header-avatar'));

      expect(headerAvatar).toHaveProp('style', { backgroundImage: 'url()' });
      expect(headerAvatar).not.toHaveElement(IconCurrencyEthereum);
      expect(headerAvatar).toHaveElement(IconUsers1);
    });

    it('header renders avatar with custom background when there is an avatar url', function () {
      const wrapper = subject({
        directMessage: {
          icon: 'https://res.cloudinary.com/fact0ry-dev/image/upload/v1691505978/mze88aeuxxdobzjd0lt6.jpg',
          otherMembers: [stubUser(), stubUser()],
        } as Channel,
      });

      const headerAvatar = wrapper.find(c('header-avatar'));

      expect(headerAvatar).toHaveProp('style', {
        backgroundImage:
          'url(https://res.cloudinary.com/fact0ry-dev/image/upload/v1691505978/mze88aeuxxdobzjd0lt6.jpg)',
      });
      expect(headerAvatar).not.toHaveElement(IconCurrencyEthereum);
      expect(headerAvatar).not.toHaveElement(IconUsers1);
    });
  });

  // Skipping these tests as modal doesn't render in `mount` mode - will restore once reverted back to shallow render
  describe.skip('leave group dialog', () => {
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

  describe('room management', () => {
    describe('edit members', () => {
      it('allows editing if user is an admin and conversation is not a 1 on 1', () => {
        const wrapper = subject({ isCurrentUserRoomAdmin: true });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canEdit', true);
      });

      it('does NOT allow editing if user is NOT an admin', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: false,
          directMessage: stubConversation({ isOneOnOne: false }),
        });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canEdit', false);
      });

      it('does NOT allow editing if conversation is considered a 1 on 1', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: true,
          directMessage: stubConversation({ isOneOnOne: true }),
        });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canEdit', false);
      });
    });

    describe('add members', () => {
      it('allows adding of members if user is an admin and conversation is not a 1 on 1', () => {
        const wrapper = subject({ isCurrentUserRoomAdmin: true });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canAddMembers', true);
      });

      it('does NOT allow adding of members if user is NOT an admin', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: false,
          directMessage: stubConversation({ isOneOnOne: false }),
        });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canAddMembers', false);
      });

      it('does NOT allow adding of members if conversation is considered a 1 on 1', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: true,
          directMessage: stubConversation({ isOneOnOne: true }),
        });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canAddMembers', false);
      });
    });

    describe('view group information', () => {
      it('allows viewing of group information if conversation is not a 1 on 1', () => {
        const wrapper = subject({ directMessage: stubConversation({ isOneOnOne: false }) });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canViewGroupInformation', true);
      });

      it('does NOT allow viewing of group information if conversation is considered a 1 on 1', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: true,
          directMessage: stubConversation({ isOneOnOne: true }),
        });

        const groupManagementMenu = wrapper.find(GroupManagementMenu);

        expect(groupManagementMenu).toHaveProp('canViewGroupInformation', false);
      });
    });
  });

  describe('message input', () => {
    it('passes sendMessage prop to message input', () => {
      const sendMessage = jest.fn();
      const message = 'test message';
      const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
      const channelId = 'the-channel-id';

      const wrapper = subject({ sendMessage, activeConversationId: channelId });

      wrapper.find(MessageInput).prop('onSubmit')(message, mentionedUserIds, []);

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

      wrapper.find(MessageInput).prop('onSubmit')(message, [], []);

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ channelId, message, mentionedUserIds: [], parentMessage: reply })
      );
    });

    it('calls sendMessage with File', () => {
      const sendMessage = jest.fn();
      const message = 'test message';
      const channelId = 'the-channel-id';

      const wrapper = subject({ sendMessage, activeConversationId: channelId });

      wrapper.find(MessageInput).prop('onSubmit')(message, [], [{ id: 'file-id', name: 'file-name' } as Media]);

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
  });
});

function stubUser(attrs: Partial<User> = {}): User {
  return {
    userId: 'user-id',
    matrixId: 'matrix-id',
    firstName: 'first-name',
    lastName: 'first-name',
    isOnline: false,
    profileId: 'profile-id',
    profileImage: 'image-url',
    lastSeenAt: 'last-seen',
    primaryZID: 'primary-zid',
    ...attrs,
  };
}

function stubConversation(props: Partial<Channel> = {}): Channel {
  return {
    id: 'channel-id',
    otherMembers: [],
    ...props,
  } as Channel;
}
