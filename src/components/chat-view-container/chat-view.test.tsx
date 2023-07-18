import React from 'react';
import { Waypoint } from 'react-waypoint';
import { shallow } from 'enzyme';
import { ChatView, Properties } from './chat-view';

import { MediaType, Message as MessageModel } from '../../store/messages';
import InvertedScroll from '../inverted-scroll';
import IndicatorMessage from '../indicator-message';
import { Lightbox } from '@zer0-os/zos-component-library';
import { MessageInput } from '../message-input/container';
import { Button as ConnectButton } from '../authentication/button';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { Message } from '../message';
import { User } from '../../store/authentication/types';
import moment from 'moment';

const mockSearchMentionableUsersForChannel = jest.fn();
jest.mock('../../platform-apps/channels/util/api', () => {
  return {
    searchMentionableUsersForChannel: (...args) => {
      mockSearchMentionableUsersForChannel(...args);
    },
  };
});

describe('ChatView', () => {
  const MESSAGES_TEST = [
    { id: 1111, message: 'what', sender: { userId: '1' }, createdAt: 1658776625730 },
    { id: 2222, message: 'hello', sender: { userId: '2' }, createdAt: 1659018545428 },
    { id: 3333, message: 'hey', sender: { userId: '2' }, createdAt: 1659018545428 },
    { id: 4444, message: 'ok!', sender: { userId: '2' }, createdAt: 1659018545428 },
  ] as MessageModel[];

  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      id: '',
      name: '',
      messages: [],
      hasJoined: false,
      user: null,
      joinChannel: () => null,
      countNewMessages: 0,
      onFetchMore: () => null,
      sendMessage: () => null,
      deleteMessage: () => null,
      editMessage: () => null,
      onRemove: () => null,
      onReply: () => null,
      resetCountNewMessage: () => null,
      onMessageInputRendered: () => null,
      isDirectMessage: true,
      isMessengerFullScreen: false,
      hasLoadedMessages: true,
      ...props,
    };

    return shallow(<ChatView {...allProps} />);
  };

  it('render channel name', () => {
    const wrapper = subject({ name: 'first channel', isDirectMessage: false });

    const text = wrapper.find('.channel-view__name h1').text().trim();

    expect(text).toStrictEqual('Welcome to #first channel');
  });

  it('render a message for each message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const ids = wrapper.find(Message).map((m) => m.prop('id'));
    expect(ids).toIncludeAllMembers([
      1111,
      2222,
      3333,
      4444,
    ]);
  });

  it('render header date', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    expect(wrapper.find('.message__header-date').exists()).toBe(true);
  });

  it('render a header Date grouped by day', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    expect(wrapper.find('.message__header-date').length).toStrictEqual(2);
  });

  it('render a header Date contain Today', () => {
    const messages = [
      { id: 111, message: 'what', createdAt: Date.now() } as MessageModel,
    ];

    const wrapper = subject({ messages });

    expect(wrapper.find('.message__header-date').length).toStrictEqual(1);

    expect(wrapper.find('.message__header-date').text()).toEqual('Today');
  });

  it('passes message prop to Message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const messageTextes = wrapper.find(Message).map((m) => m.prop('message'));

    expect(messageTextes).toIncludeAllMembers([
      'what',
      'hello',
      'hey',
      'ok!',
    ]);
  });

  it('passes className prop to Message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, showSenderAvatar: true });

    const classNames = wrapper.find(Message).map((m) => m.prop('className'));

    expect(classNames).toIncludeAllMembers([
      'messages__message messages__message--last-in-group',
      'messages__message messages__message--last-in-group',
      'messages__message',
      'messages__message',
    ]);
  });

  it('render InvertedScroll', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    expect(wrapper.find(InvertedScroll).exists()).toBe(true);
    expect(wrapper.find(InvertedScroll).hasClass('channel-view__inverted-scroll')).toBe(true);
  });

  it('render MessageInput', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, hasJoined: true });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find(MessageInput).exists()).toBe(true);
  });

  it('should not render MessageInput if user not a member', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: 'userId-test' } as User });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find(MessageInput).exists()).toBe(false);
  });

  it('render joinButton', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: 'userId-test' } as User });

    expect(wrapper.find('.channel-view__join-wrapper').exists()).toBe(true);
  });

  it('should not render joinButton', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, hasJoined: true, user: { id: 'userId-test' } as User });

    expect(wrapper.find('.channel-view__join-wrapper').exists()).toBe(false);
  });

  it('should joinChannel when click joinButton', () => {
    const joinChannel = jest.fn();
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: 'userId-test' } as User, joinChannel });

    wrapper.find('.channel-view__join-wrapper').simulate('click');

    expect(joinChannel).toHaveBeenCalled();
  });

  it('render ConnectButton', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ hideChildren: true });

    expect(ifAuthenticated.find(ConnectButton).exists()).toBe(true);
  });

  it('render Waypoint in case we have messages', () => {
    const onFetchMoreSpy = jest.fn();

    const wrapper = subject({ messages: MESSAGES_TEST, onFetchMore: onFetchMoreSpy });

    expect(wrapper.find(Waypoint).exists()).toBe(true);
    expect(wrapper.find(Waypoint).prop('onEnter')).toStrictEqual(onFetchMoreSpy);
  });

  it('it should not render Waypoint in case we do not messages', () => {
    const wrapper = subject({ messages: [] });

    expect(wrapper.find(Waypoint).exists()).toBe(false);
  });

  it('passes isOwner prop to Message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: '2' } as User });

    const classNames = wrapper.find(Message).map((m) => m.prop('isOwner'));

    expect(classNames).toIncludeAllMembers([
      false,
      true,
      false,
      false,
    ]);
  });

  it('it should not render IndicatorMessage at first', () => {
    const wrapper = subject({ countNewMessages: 2 });

    expect(wrapper.find(IndicatorMessage).exists()).toBe(false);
  });

  it('render with className', () => {
    const className = 'className';
    const wrapper = subject({ className });

    expect(wrapper.find(`.${className}`).exists()).toBe(true);
  });

  it('renders skeleton if messages have not been loaded yet', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, hasLoadedMessages: false });

    expect(wrapper).toHaveElement('ChatSkeleton');

    wrapper.setProps({ hasLoadedMessages: true });
    expect(wrapper).not.toHaveElement('ChatSkeleton');
  });

  describe('Lightbox', () => {
    it('render when image file is within message and LightBox has been opened', () => {
      const imageMedia = { url: 'image.jpg', type: MediaType.Image };
      const messages = [
        {
          id: 1,
          media: imageMedia,
          sender: { userId: '1' },
        } as MessageModel,
        {
          id: 2,
          media: { url: 'video.avi', type: MediaType.Video },
          sender: { userId: '1' },
        } as MessageModel,
        {
          id: 3,
          media: { url: 'video.mp3', type: MediaType.Audio },
          sender: { userId: '1' },
        } as MessageModel,
      ];
      const wrapper = subject({ messages });
      wrapper.find(Message).at(1).simulate('imageClick');

      expect(wrapper.find(Lightbox).prop('items')).toEqual([imageMedia]);
    });

    it('does not render Lightbox', () => {
      const wrapper = subject({ messages: [] });

      expect(wrapper.find(Lightbox).exists()).toBeFalsy();
    });
  });

  it('does not render channel name in case of a direct message', () => {
    const wrapper = subject({ messages: [], isDirectMessage: true });

    expect(wrapper.find('.channel-view__name').exists()).toBeFalsy();
  });

  it('searches for user mentions', async () => {
    const wrapper = subject({ messages: MESSAGES_TEST, hasJoined: true, id: '5' });
    const input = wrapper.find(IfAuthenticated).find(MessageInput);

    await input.prop('getUsersForMentions')('bob');

    expect(mockSearchMentionableUsersForChannel).toHaveBeenCalledWith('5', 'bob');
  });

  describe('formatDayHeader', () => {
    it('returns "Today" for the current day', () => {
      const today = moment().startOf('day');
      const messages = [
        { id: 111, message: 'what', createdAt: today.valueOf() } as MessageModel,
      ];

      const wrapper = subject({ messages });

      expect(wrapper.find('.message__header-date').text()).toEqual('Today');
    });

    it('returns "Yesterday" for the previous day', () => {
      const yesterday = moment().subtract(1, 'day').startOf('day');
      const messages = [
        { id: 111, message: 'what', createdAt: yesterday.valueOf() } as MessageModel,
      ];

      const wrapper = subject({ messages });

      expect(wrapper.find('.message__header-date').text()).toEqual('Yesterday');
    });

    it('returns the formatted date for the same year', () => {
      const currentYearDate = moment('2023-06-11'); // Example date within the same year
      const messages = [
        { id: 111, message: 'what', createdAt: currentYearDate.valueOf() } as MessageModel,
      ];

      const wrapper = subject({ messages });
      expect(wrapper.find('.message__header-date').text()).toEqual('Sun, Jun 11');
    });

    it('returns the formatted date for previous years', () => {
      const previousYearDate = moment('2022-07-16'); // Example date from a previous year
      const messages = [
        { id: 111, message: 'what', createdAt: previousYearDate.valueOf() } as MessageModel,
      ];

      const wrapper = subject({ messages });
      expect(wrapper.find('.message__header-date').text()).toEqual('Jul 16, 2022');
    });
  });
});
