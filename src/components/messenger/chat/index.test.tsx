import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { Channel, User } from '../../../store/channels';
import Tooltip from '../../tooltip';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { GroupManagementMenu } from '../../group-management-menu';
import { LeaveGroupDialogStatus } from '../../../store/group-management';
import { MessageInput } from '../../message-input/container';
import { Media } from '../../message-input/utils';

const mockSearchMentionableUsersForChannel = jest.fn();
jest.mock('../../../platform-apps/channels/util/api', () => {
  return {
    searchMentionableUsersForChannel: (...args) => {
      mockSearchMentionableUsersForChannel(...args);
    },
  };
});

describe('messenger-chat', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      activeConversationId: '1',
      leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
      directMessage: { id: '1', otherMembers: [] } as any,
      sendMessage: () => null,
      onRemoveReply: () => null,
      isCurrentUserRoomAdmin: false,
      startAddGroupMember: () => null,
      startEditConversation: () => null,
      setLeaveGroupStatus: () => null,
      viewGroupInformation: () => null,
      ...props,
    };

    return shallow(<DirectMessageChat {...allProps} />);
  };

  const getDirectMessageChat = (wrapper) => wrapper.find('.direct-message-chat');

  it('render direct message chat', function () {
    const wrapper = subject({});

    expect(getDirectMessageChat(wrapper).exists()).toBe(true);
  });

  it('render channel view component', function () {
    const activeDirectMessageId = '123';

    const wrapper = subject({
      activeConversationId: activeDirectMessageId,
    });

    expect(wrapper.find(ChatViewContainer).hasClass('direct-message-chat__channel')).toBe(true);
    expect(wrapper.find(ChatViewContainer).prop('channelId')).toStrictEqual(activeDirectMessageId);
  });

  describe('title', () => {
    it('channel name as title and otherMembers in tooltip', function () {
      const directMessage = {
        name: 'this is my channel name',
        otherMembers: [
          { firstName: 'first-name', lastName: 'last-name' },
          { firstName: 'another-first-name-but-no-lastname', lastName: '' },
        ],
      };

      const tooltip = subject({ directMessage } as any).find(Tooltip);

      expect(tooltip.html()).toContain(directMessage.name);
      expect(tooltip.prop('overlay')).toEqual(
        directMessage.otherMembers
          .map((o) =>
            [
              o.firstName,
              o.lastName,
            ]
              .filter((e) => e)
              .join(' ')
          )
          .join(', ')
      );
    });

    it('otherMembers as title', function () {
      const directMessage = {
        otherMembers: [
          { firstName: 'first-name', lastName: 'last-name' },
          { firstName: 'another-first-name-but-no-lastname', lastName: '' },
        ],
        name: undefined,
      };

      const tooltip = subject({ directMessage } as any).find(Tooltip);

      const otherMembersExpectation = directMessage.otherMembers
        .map((o) =>
          [
            o.firstName,
            o.lastName,
          ]
            .filter((e) => e)
            .join(' ')
        )
        .join(', ');

      expect(tooltip.html()).toContain(otherMembersExpectation);
      expect(tooltip.prop('overlay')).toEqual(otherMembersExpectation);
    });
  });

  describe('one on one chat', function () {
    it('header renders full name in the title', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [
            stubUser({
              firstName: 'Johnny',
              lastName: 'Sanderson',
            }),
          ],
        } as Channel,
      });

      const tooltip = wrapper.find(Tooltip);

      expect(tooltip.html()).toContain('Johnny Sanderson');
    });

    it('header renders online status in the subtitle', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [stubUser({ isOnline: true })],
        } as Channel,
      });

      const subtitle = wrapper.find('.direct-message-chat__subtitle');

      expect(subtitle.text()).toEqual('Online');
    });

    it('header renders online status', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [stubUser({ isOnline: true })],
        } as Channel,
      });

      const onlineAvatar = wrapper.find('.direct-message-chat__header-avatar--online');

      expect(onlineAvatar.exists()).toBeTrue();
    });

    it('header renders offline status', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [stubUser({ isOnline: false })],
        } as Channel,
      });

      const offlineAvatar = wrapper.find('.direct-message-chat__header-avatar--offline');

      expect(offlineAvatar.exists()).toBeTrue();
    });

    it('header renders avatar', function () {
      const wrapper = subject({
        directMessage: {
          isOneOnOne: true,
          otherMembers: [
            stubUser({
              profileImage: 'avatar-url',
            }),
          ],
        } as Channel,
      });

      const headerAvatar = wrapper.find('.direct-message-chat__header-avatar');

      expect(headerAvatar.prop('style').backgroundImage).toEqual('url(avatar-url)');
      expect(headerAvatar.find('IconUsers1').exists()).toBeFalse();
    });

    it('header renders group management menu icon button', function () {
      const wrapper = subject({
        directMessage: {
          isOneOnOne: true,
          otherMembers: [
            stubUser({
              profileImage: 'avatar-url',
            }),
          ],
        } as Channel,
      });

      const groupManagementMenuContainer = wrapper.find('.direct-message-chat__group-management-menu-container');

      expect(groupManagementMenuContainer.exists()).toBeTrue();
    });

    it('passes canLeaveRoom prop as false to group management menu if only 2 members are in conversation', function () {
      const wrapper = subject({
        isCurrentUserRoomAdmin: false,
        directMessage: {
          isOneOnOne: true,
          otherMembers: [
            stubUser({
              profileImage: 'avatar-url',
            }),
          ],
        } as Channel,
      });

      const groupManagementMenu = wrapper.find(GroupManagementMenu);

      expect(groupManagementMenu.prop('canLeaveRoom')).toBe(false);
    });

    it('passes canLeaveRoom prop as true to group management menu if more than 2 members are in conversation', function () {
      const wrapper = subject({
        isCurrentUserRoomAdmin: false,
        directMessage: {
          isOneOnOne: true,
          otherMembers: [
            stubUser({
              profileImage: 'avatar-url',
            }),
            stubUser({
              profileImage: 'avatar-url',
            }),
          ],
        } as Channel,
      });

      const groupManagementMenu = wrapper.find(GroupManagementMenu);

      expect(groupManagementMenu.prop('canLeaveRoom')).toBe(true);
    });

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
            stubUser({
              firstName: 'Johnny',
              lastName: 'Sanderson',
            }),
            stubUser({
              firstName: 'Jack',
              lastName: 'Black',
            }),
          ],
        } as Channel,
      });

      const tooltip = wrapper.find(Tooltip);

      expect(tooltip.html()).toContain('Johnny Sanderson, Jack Black');
    });

    it('header renders online status in the subtitle if any member is online', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [
            stubUser({ isOnline: false }),
            stubUser({ isOnline: true }),
          ],
        } as Channel,
      });

      const subtitle = wrapper.find('.direct-message-chat__subtitle');

      expect(subtitle.text()).toEqual('Online');
    });

    it('header renders online status if any member is online', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [
            stubUser({ isOnline: false }),
            stubUser({ isOnline: true }),
          ],
        } as Channel,
      });

      const onlineAvatar = wrapper.find('.direct-message-chat__header-avatar--online');

      expect(onlineAvatar.exists()).toBeTrue();
    });

    it('header renders offline status', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [
            stubUser({ isOnline: false }),
            stubUser({ isOnline: false }),
          ],
        } as Channel,
      });

      const offlineAvatar = wrapper.find('.direct-message-chat__header-avatar--offline');

      expect(offlineAvatar.exists()).toBeTrue();
    });

    it('header renders avatar with users icon', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [
            stubUser({
              profileImage: 'avatar-url-1',
            }),
            stubUser({
              profileImage: 'avatar-url-2',
            }),
          ],
        } as Channel,
      });

      const headerAvatar = wrapper.find('.direct-message-chat__header-avatar');

      expect(headerAvatar.prop('style').backgroundImage).toEqual('url()');
      expect(headerAvatar.find('IconUsers1').exists()).toBeTrue();
    });

    it('header renders avatar in case if custom icon is set', function () {
      const wrapper = subject({
        directMessage: {
          icon: 'https://res.cloudinary.com/fact0ry-dev/image/upload/v1691505978/mze88aeuxxdobzjd0lt6.jpg',
          otherMembers: [
            stubUser({
              profileImage: 'avatar-url-1',
            }),
            stubUser({
              profileImage: 'avatar-url-2',
            }),
          ],
        } as Channel,
      });

      const headerAvatar = wrapper.find('.direct-message-chat__header-avatar');

      expect(headerAvatar.prop('style').backgroundImage).toEqual(
        'url(https://res.cloudinary.com/fact0ry-dev/image/upload/v1691505978/mze88aeuxxdobzjd0lt6.jpg)'
      );
    });
  });

  describe('leave group dialog', () => {
    it('renders leave group dialog when status is NOT closed', () => {
      let wrapper = subject({
        leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN,
      });

      // Modal is the wrapper for the leave group dialog
      expect(wrapper.find('Modal').exists()).toBeTrue();

      wrapper = subject({ leaveGroupDialogStatus: LeaveGroupDialogStatus.IN_PROGRESS });
      expect(wrapper.find('Modal').exists()).toBeTrue();
    });

    it('does not render leave group dialog when LeaveGroupDialogStatus is closed', () => {
      const wrapper = subject({
        leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
      });

      expect(wrapper.find('Modal').exists()).toBeFalse();
    });

    it('passes name and roomId to leave group dialog', () => {
      const wrapper = subject({
        leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN,
        directMessage: {
          name: 'group-name',
          id: '1',
          otherMembers: [],
        } as any,
        activeConversationId: 'room-id',
      });

      const leaveGroupDialog = wrapper.find('Modal').prop('children');
      expect(leaveGroupDialog['props'].roomId).toEqual('room-id');
      expect(leaveGroupDialog['props'].groupName).toEqual('group-name');
    });
  });

  describe('room management', () => {
    describe('edit members', () => {
      it('allows editing if user is an admin and conversation is not a 1 on 1', () => {
        const wrapper = subject({ isCurrentUserRoomAdmin: true });

        expect(wrapper.find(GroupManagementMenu).prop('canEdit')).toBe(true);
      });

      it('does NOT allow editing if user is NOT an admin', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: false,
          directMessage: stubConversation({ isOneOnOne: false }),
        });

        expect(wrapper.find(GroupManagementMenu).prop('canEdit')).toBe(false);
      });

      it('does NOT allow editing if conversation is considered a 1 on 1', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: true,
          directMessage: stubConversation({ isOneOnOne: true }),
        });

        expect(wrapper.find(GroupManagementMenu).prop('canEdit')).toBe(false);
      });
    });

    describe('add members', () => {
      it('allows adding of members if user is an admin and conversation is not a 1 on 1', () => {
        const wrapper = subject({ isCurrentUserRoomAdmin: true });

        expect(wrapper.find(GroupManagementMenu).prop('canAddMembers')).toBe(true);
      });

      it('does NOT allow adding of members if user is NOT an admin', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: false,
          directMessage: stubConversation({ isOneOnOne: false }),
        });

        expect(wrapper.find(GroupManagementMenu).prop('canAddMembers')).toBe(false);
      });

      it('does NOT allow adding of members if conversation is considered a 1 on 1', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: true,
          directMessage: stubConversation({ isOneOnOne: true }),
        });

        expect(wrapper.find(GroupManagementMenu).prop('canAddMembers')).toBe(false);
      });
    });

    describe('view group information', () => {
      it('allows viewing of group information if conversation is not a 1 on 1', () => {
        const wrapper = subject({ directMessage: stubConversation({ isOneOnOne: false }) });

        expect(wrapper.find(GroupManagementMenu).prop('canViewGroupInformation')).toBe(true);
      });

      it('does NOT allow viewing of group information if conversation is considered a 1 on 1', () => {
        const wrapper = subject({
          isCurrentUserRoomAdmin: true,
          directMessage: stubConversation({ isOneOnOne: true }),
        });

        expect(wrapper.find(GroupManagementMenu).prop('canViewGroupInformation')).toBe(false);
      });
    });
  });

  describe('message input', () => {
    it('renders message input', () => {
      const wrapper = subject({});

      expect(wrapper.find(MessageInput).exists()).toBe(true);
    });

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
