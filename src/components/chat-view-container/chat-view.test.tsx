import React from 'react';
import { Waypoint } from 'react-waypoint';
import { shallow } from 'enzyme';
import { ChatView, Properties } from './chat-view';

import { Message as MessageModel } from '../../store/messages';
import InvertedScroll from '../inverted-scroll';
import { MessageInput } from '../message-input/container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { Message } from '../message';
import { User } from '../../store/authentication/types';
import moment from 'moment';
import { MessagesFetchState } from '../../store/channels';

import { bem } from '../../lib/bem';
const c = bem('.chat-view');

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
      user: null,
      joinChannel: () => null,
      onFetchMore: () => null,
      deleteMessage: () => null,
      editMessage: () => null,
      onRemove: () => null,
      onReply: () => null,
      onMessageInputRendered: () => null,
      hasLoadedMessages: true,
      messagesFetchStatus: MessagesFetchState.SUCCESS,
      otherMembers: [],
      fetchMessages: () => null,
      isOneOnOne: false,
      sendDisabledMessage: '',
      conversationErrorMessage: '',
      onHiddenMessageInfoClick: () => null,
      isSecondarySidekickOpen: false,
      toggleSecondarySidekick: () => null,
      openMessageInfo: () => null,
      loadAttachmentDetails: () => null,
      sendEmojiReaction: () => null,
      onReportUser: () => null,
      openLightbox: () => null,
      ...props,
    };

    return shallow(<ChatView {...allProps} />);
  };

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

  it('should not render MessageInput if user not a member', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: 'userId-test' } as User });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find(MessageInput).exists()).toBe(false);
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

  it('does not render skeleton if messages have not been loaded yet AND the fetch has failed', () => {
    const wrapper = subject({
      messages: MESSAGES_TEST,
      hasLoadedMessages: false,
      messagesFetchStatus: MessagesFetchState.FAILED,
    });

    expect(wrapper).not.toHaveElement('ChatSkeleton');
  });

  it('renders failure message if message load failed', () => {
    let wrapper = subject({
      messages: MESSAGES_TEST,
      messagesFetchStatus: MessagesFetchState.FAILED,
      hasLoadedMessages: true,
    });
    expect(wrapper.find(c('failure-message')).text()).toContain('Failed to load new messages. Try Reload');

    wrapper = subject({
      messages: MESSAGES_TEST,
      messagesFetchStatus: MessagesFetchState.FAILED,
      hasLoadedMessages: false,
      name: 'channel-name',
    });

    expect(wrapper.find(c('failure-message')).text()).toContain(
      'Failed to load conversation with channel-name. Try Reload'
    );

    wrapper = subject({
      messages: MESSAGES_TEST,
      messagesFetchStatus: MessagesFetchState.FAILED,
      hasLoadedMessages: false,
      name: '',
      otherMembers: [{ firstName: 'ratik', lastName: 'jindal' } as any],
    });

    expect(wrapper.find(c('failure-message')).text()).toContain(
      'Failed to load your conversation with ratik. Try Reload'
    );
  });

  it('renders failure message if message load failed, and fetches messages on reload', () => {
    const fetchMessages = jest.fn();
    let wrapper = subject({
      messages: MESSAGES_TEST,
      messagesFetchStatus: MessagesFetchState.FAILED,
      fetchMessages,
      id: 'channel-id',
    });

    wrapper.find(c('try-reload')).simulate('click');
    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'channel-id' });
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
      // setting the date here is not ideal as at some point this will fail
      const currentYearDate = moment('2025-12-11'); // Example date within the same year
      const messages = [
        { id: 111, message: 'what', createdAt: currentYearDate.valueOf() } as MessageModel,
      ];

      const wrapper = subject({ messages });
      expect(wrapper.find('.message__header-date').text()).toEqual('Thu, Dec 11');
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
