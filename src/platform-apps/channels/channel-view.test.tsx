import React from 'react';
import { Waypoint } from 'react-waypoint';
import { shallow } from 'enzyme';
import { ChannelView } from './channel-view';
import { Message } from './message';
import { MediaType } from '../../store/messages';
import InvertedScroll from '../../components/inverted-scroll';
import IndicatorMessage from '../../components/indicator-message';
import { Lightbox } from '@zer0-os/zos-component-library';
import { MessageInput } from '../../components/message-input';
import { Button as ConnectButton } from '../../components/authentication/button';
import { IfAuthenticated } from '../../components/authentication/if-authenticated';

const mockSearchMentionableUsersForChannel = jest.fn();
jest.mock('./util/api', () => {
  return {
    searchMentionableUsersForChannel: (...args) => {
      mockSearchMentionableUsersForChannel(...args);
    },
  };
});

describe('ChannelView', () => {
  const MESSAGES_TEST = [
    { id: 'message-1', message: 'what', sender: { userId: 1 }, createdAt: 1658776625730 },
    { id: 'message-2', message: 'hello', sender: { userId: 2 }, createdAt: 1659018545428 },
    { id: 'message-3', message: 'hey', sender: { userId: 2 }, createdAt: 1659018545428 },
    { id: 'message-4', message: 'ok!', sender: { userId: 2 }, createdAt: 1659018545428 },
  ];

  const subject = (props: any = {}) => {
    const allProps = {
      name: '',
      messages: [],
      hasJoined: false,
      user: null,
      joinChannel: () => undefined,
      countNewMessages: 0,
      ...props,
    };

    return shallow(<ChannelView {...allProps} />);
  };

  it('render channel name', () => {
    const wrapper = subject({ name: 'first channel' });

    const textes = wrapper.find('.channel-view__name h1').text().trim();

    expect(textes).toStrictEqual('Welcome to #first channel');
  });

  it('render a message for each message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const ids = wrapper.find(Message).map((m) => m.prop('id'));

    expect(ids).toIncludeAllMembers([
      'message-1',
      'message-2',
      'message-3',
      'message-4',
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
      { id: 'message-one', message: 'what', createdAt: Date.now() },
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
    const wrapper = subject({ messages: MESSAGES_TEST });

    const classNames = wrapper.find(Message).map((m) => m.prop('className'));

    expect(classNames).toIncludeAllMembers([
      'messages__message messages__message--first-in-group',
      'messages__message messages__message--first-in-group',
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
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: 'userId-test' } });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find(MessageInput).exists()).toBe(false);
  });

  it('render joinButton', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: 'userId-test' } });

    expect(wrapper.find('.channel-view__join-wrapper').exists()).toBe(true);
  });

  it('should not render joinButton', () => {
    const wrapper = subject({ messages: MESSAGES_TEST, hasJoined: true, user: { id: 'userId-test' } });

    expect(wrapper.find('.channel-view__join-wrapper').exists()).toBe(false);
  });

  it('should joinChannel when click joinButton', () => {
    const joinChannel = jest.fn();
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: 'userId-test' }, joinChannel });

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
    const wrapper = subject({ messages: MESSAGES_TEST, user: { id: '2' } });

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

  describe('Lightbox', () => {
    it('render when image file is within message and LightBox has been opened', () => {
      const imageMedia = { url: 'image.jpg', type: MediaType.Image };
      const messages = [
        {
          id: 'message-1',
          message: 'image message',
          media: imageMedia,
          sender: { userId: 1 },
          createdAt: 1658776625730,
        },
        {
          id: 'message-2',
          message: 'video message',
          media: { url: 'video.avi', type: MediaType.Video },
          sender: { userId: 1 },
          createdAt: 1658776625731,
        },
        {
          id: 'message-3',
          message: 'audio message',
          media: { url: 'video.mp3', type: MediaType.Audio },
          sender: { userId: 1 },
          createdAt: 1658776625732,
        },
      ];
      const wrapper = subject({ messages });
      wrapper.find(Message).at(1).simulate('imageClick');

      expect(wrapper.find(Lightbox).prop('items')).toEqual([imageMedia]);
    });

    it('does not render Lightbox', () => {
      const messages = [
        {
          id: 'message-1',
          message: 'image message',
          media: { url: 'image.jpg', type: MediaType.Image },
          sender: { userId: 1 },
          createdAt: 1658776625730,
        },
        {
          id: 'message-2',
          message: 'video message',
          media: { url: 'video.avi', type: MediaType.Video },
          sender: { userId: 1 },
          createdAt: 1658776625731,
        },
        {
          id: 'message-3',
          message: 'audio message',
          media: { url: 'video.mp3', type: MediaType.Audio },
          sender: { userId: 1 },
          createdAt: 1658776625732,
        },
      ];
      const wrapper = subject({ messages });

      expect(wrapper.find(Lightbox).exists()).toBeFalsy();
    });
  });

  it('does not render channel name in case of a direct message', () => {
    const messages = [
      {
        id: 'message-1',
        message: 'image message',
        media: { url: 'image.jpg', type: MediaType.Image },
        sender: { userId: 1 },
        createdAt: 1658776625730,
      },
      {
        id: 'message-2',
        message: 'video message',
        media: { url: 'video.avi', type: MediaType.Video },
        sender: { userId: 1 },
        createdAt: 1658776625731,
      },
      {
        id: 'message-3',
        message: 'audio message',
        media: { url: 'video.mp3', type: MediaType.Audio },
        sender: { userId: 1 },
        createdAt: 1658776625732,
      },
    ];
    const wrapper = subject({ messages, isDirectMessage: true });

    expect(wrapper.find('.channel-view__name').exists()).toBeFalsy();
  });

  it('searches for user mentions', async () => {
    const wrapper = subject({ messages: MESSAGES_TEST, hasJoined: true, id: '5', users: ['user'] });
    const input = wrapper.find(IfAuthenticated).find(MessageInput);

    await input.prop('getUsersForMentions')('bob');

    expect(mockSearchMentionableUsersForChannel).toHaveBeenCalledWith('5', 'bob', ['user']);
  });
});
