import React from 'react';
import { IconXClose, IconMinus } from '@zero-tech/zui/icons';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from './';
import { ChannelViewContainer } from '../channel-view-container';

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
});
