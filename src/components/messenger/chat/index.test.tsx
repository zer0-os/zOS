import React from 'react';
import { IconXClose, IconMinus, IconExpand1 } from '@zero-tech/zui/icons';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { Channel, User } from '../../../store/channels';
import Tooltip from '../../tooltip';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { GroupManagementMenu } from '../../group-management-menu';

describe('messenger-chat', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      activeConversationId: '1',
      setactiveConversationId: jest.fn(),
      directMessage: { id: '1', otherMembers: [] } as any,
      isFullScreen: false,
      enterFullScreenMessenger: () => null,
      exitFullScreenMessenger: () => null,
      isCurrentUserRoomAdmin: false,
      startAddGroupMember: () => null,
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

  it('minimizes chat', function () {
    const wrapper = subject({});

    icon(wrapper, IconMinus).simulate('click');

    expect(getDirectMessageChat(wrapper).hasClass('direct-message-chat--minimized')).toBe(true);
  });

  it('closes chat', function () {
    const setActiveDirectMessageId = jest.fn();
    const wrapper = subject({ setactiveConversationId: setActiveDirectMessageId });

    icon(wrapper, IconXClose).simulate('click');

    expect(setActiveDirectMessageId).toHaveBeenCalledWith('');
  });

  it('publishes full screen event', function () {
    const enterFullScreenMessenger = jest.fn();
    const wrapper = subject({ enterFullScreenMessenger });

    icon(wrapper, IconExpand1).simulate('click');

    expect(enterFullScreenMessenger).toHaveBeenCalledOnce();
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

function icon(wrapper, icon) {
  return wrapper.find('IconButton').findWhere((n) => n.prop('Icon') === icon);
}
