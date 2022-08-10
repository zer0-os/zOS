import React from 'react';
import { Waypoint } from 'react-waypoint';
import { shallow } from 'enzyme';

import { ChannelView } from './channel-view';
import { Message } from './message';
import InvertedScroll from '../../components/inverted-scroll';

describe('ChannelView', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      name: '',
      messages: [],
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
    const messages = [
      { id: 'message-one', message: 'what', createdAt: 1658776625730 },
      { id: 'message-two', message: 'hello', createdAt: 1658776625730 },
    ];

    const wrapper = subject({ messages });

    const ids = wrapper.find(Message).map((m) => m.prop('id'));

    expect(ids).toIncludeAllMembers([
      'message-one',
      'message-two',
    ]);
  });

  it('renders header date', () => {
    const messages = [
      { id: 'message-one', message: 'what', createdAt: 1658776625730 },
      { id: 'message-two', message: 'hello', createdAt: 1658776625730 },
    ];

    const wrapper = subject({ messages });

    expect(wrapper.find('.message__header-date').exists()).toBe(true);
  });

  it('renders a header Date grouped by day', () => {
    const messages = [
      { id: 'message-one', message: 'what', createdAt: 1658776625730 },
      { id: 'message-two', message: 'hello', createdAt: 1658776625730 },
      { id: 'message-three', message: 'who', createdAt: 1659018545428 },
      { id: 'message-for', message: 'there', createdAt: 1659655757948 },
    ];

    const wrapper = subject({ messages });

    expect(wrapper.find('.message__header-date').length).toStrictEqual(3);
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
    const messages = [
      { id: 'message-one', message: 'what', createdAt: 1658776625730 },
      { id: 'message-two', message: 'hello', createdAt: 1658776625730 },
    ];

    const wrapper = subject({ messages });

    const messageTextes = wrapper.find(Message).map((m) => m.prop('message'));

    expect(messageTextes).toIncludeAllMembers([
      'what',
      'hello',
    ]);
  });

  it('renders InvertedScroll', () => {
    const messages = [
      { id: 'message-one', message: 'what' },
      { id: 'message-two', message: 'hello' },
    ];

    const wrapper = subject({ messages });

    expect(wrapper.find(InvertedScroll).exists()).toBe(true);
    expect(wrapper.find(InvertedScroll).hasClass('channel-view__inverted-scroll')).toBe(true);
  });

  it('renders Waypoint in case we have messages', () => {
    const messages = [
      { id: 'message-one', message: 'what' },
      { id: 'message-two', message: 'hello' },
    ];
    const onFetchMoreSpy = jest.fn();

    const wrapper = subject({ messages, onFetchMore: onFetchMoreSpy });

    expect(wrapper.find(Waypoint).exists()).toBe(true);
    expect(wrapper.find(Waypoint).prop('onEnter')).toStrictEqual(onFetchMoreSpy);
  });

  it('it should not renders Waypoint in case we do not messages', () => {
    const wrapper = subject({ messages: [] });

    expect(wrapper.find(Waypoint).exists()).toBe(false);
  });
});
