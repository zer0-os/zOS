import React from 'react';
import { IconXClose, IconMinus } from '@zero-tech/zui/icons';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from './';
import { ChannelViewContainer } from '../channel-view-container';
import { User } from '../../../store/channels';
import { DirectMessage } from '../../../store/direct-messages/types';
import Tooltip from '../../../components/tooltip';

describe('direct-message-chat', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      activeDirectMessageId: '1',
      setActiveDirectMessageId: jest.fn(),
      directMessage: null,
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
      activeDirectMessageId,
    });

    expect(wrapper.find(ChannelViewContainer).hasClass('direct-message-chat__channel')).toBe(true);
    expect(wrapper.find(ChannelViewContainer).prop('channelId')).toStrictEqual(activeDirectMessageId);
  });

  it('minimize chat', function () {
    const stopPropagation = jest.fn();
    const wrapper = subject({});

    const minimizeButton = wrapper.find('.direct-message-chat__minimize-button');
    minimizeButton.simulate('click', {
      stopPropagation,
    });
    expect(getDirectMessageChat(wrapper).hasClass('direct-message-chat--minimized')).toBe(true);
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('renders minimize icon', function () {
    const wrapper = subject({});

    const minimizeButton = wrapper.find('.direct-message-chat__minimize-button');

    expect(minimizeButton.find(IconMinus).exists()).toBe(true);
  });

  it('handle close chat', function () {
    const setActiveDirectMessageId = jest.fn();
    const wrapper = subject({ setActiveDirectMessageId });

    const minimizeButton = wrapper.find('.direct-message-chat__close-button');
    minimizeButton.simulate('click');

    expect(setActiveDirectMessageId).toHaveBeenCalledWith('');
  });

  it('renders close icon', function () {
    const wrapper = subject({});

    const minimizeButton = wrapper.find('.direct-message-chat__close-button');

    expect(minimizeButton.find(IconXClose).exists()).toBe(true);
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

    it('nothing as title', function () {
      const title = subject({ directMessage: undefined }).find('[className$="__title"]');

      expect(title.text()).toEqual('');
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
        } as DirectMessage,
      });

      const tooltip = wrapper.find(Tooltip);

      expect(tooltip.html()).toContain('Johnny Sanderson');
    });

    it('header renders online status in the subtitle', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [stubUser({ isOnline: true })],
        } as DirectMessage,
      });

      const subtitle = wrapper.find('.direct-message-chat__subtitle');

      expect(subtitle.text()).toEqual('Online');
    });

    it('header renders online status', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [stubUser({ isOnline: true })],
        } as DirectMessage,
      });

      const onlineAvatar = wrapper.find('.direct-message-chat__header-avatar--online');

      expect(onlineAvatar.exists()).toBeTrue();
    });

    it('header renders offline status', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [stubUser({ isOnline: false })],
        } as DirectMessage,
      });

      const offlineAvatar = wrapper.find('.direct-message-chat__header-avatar--offline');

      expect(offlineAvatar.exists()).toBeTrue();
    });

    it('header renders avatar', function () {
      const wrapper = subject({
        directMessage: {
          otherMembers: [
            stubUser({
              profileImage: 'avatar-url',
            }),
          ],
        } as DirectMessage,
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
        } as DirectMessage,
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
        } as DirectMessage,
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
        } as DirectMessage,
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
        } as DirectMessage,
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
        } as DirectMessage,
      });

      const headerAvatar = wrapper.find('.direct-message-chat__header-avatar');

      expect(headerAvatar.prop('style').backgroundImage).toEqual('url()');
      expect(headerAvatar.find('IconUsers1').exists()).toBeTrue();
    });
  });
});

function stubUser(attrs: Partial<User> = {}): User {
  return {
    id: 'user-id',
    firstName: 'first-name',
    lastName: 'first-name',
    isOnline: false,
    profileId: 'profile-id',
    profileImage: 'image-url',
    lastSeenAt: 'last-seen',
    ...attrs,
  };
}
