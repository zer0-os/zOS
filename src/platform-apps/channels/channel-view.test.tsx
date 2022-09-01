import React from 'react';
import { Waypoint } from 'react-waypoint';
import { shallow } from 'enzyme';

import { ChannelView } from './channel-view';
import { Message } from './message';
import InvertedScroll from '../../components/inverted-scroll';
import IndicatorMessage from '../../components/indicator-message';

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
      countNewMessage: 0,
      ...props,
    };

    return shallow(<ChannelView {...allProps} />);
  };

  it('renders channel name', () => {
    const wrapper = subject({ name: 'first channel' });

    const textes = wrapper.find('.channel-view__name h1').text().trim();

    expect(textes).toStrictEqual('Welcome to #first channel');
  });

  it('renders a message for each message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const ids = wrapper.find(Message).map((m) => m.prop('id'));

    expect(ids).toIncludeAllMembers([
      'message-1',
      'message-2',
      'message-3',
      'message-4',
    ]);
  });

  it('renders header date', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    expect(wrapper.find('.message__header-date').exists()).toBe(true);
  });

  it('renders a header Date grouped by day', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    expect(wrapper.find('.message__header-date').length).toStrictEqual(2);
  });

  it('renders a header Date contain Today', () => {
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

  it('renders InvertedScroll', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    expect(wrapper.find(InvertedScroll).exists()).toBe(true);
    expect(wrapper.find(InvertedScroll).hasClass('channel-view__inverted-scroll')).toBe(true);
  });

  it('renders Waypoint in case we have messages', () => {
    const onFetchMoreSpy = jest.fn();

    const wrapper = subject({ messages: MESSAGES_TEST, onFetchMore: onFetchMoreSpy });

    expect(wrapper.find(Waypoint).exists()).toBe(true);
    expect(wrapper.find(Waypoint).prop('onEnter')).toStrictEqual(onFetchMoreSpy);
  });

  it('it should not renders Waypoint in case we do not messages', () => {
    const wrapper = subject({ messages: [] });

    expect(wrapper.find(Waypoint).exists()).toBe(false);
  });

  it('renders IndicatorMessage', () => {
    const wrapper = subject({ countNewMessage: 2 });

    expect(wrapper.find(IndicatorMessage).exists()).toBe(true);
    expect(wrapper.find(IndicatorMessage).prop('countNewMessage')).toStrictEqual(2);
  });
});
