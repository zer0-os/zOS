import React from 'react';
import { shallow } from 'enzyme';
import { ZnsLink } from '@zer0-os/zos-component-library';
import IndicatorMessage from '.';

describe('Indicator new message', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      hasNewMessage: 0,
      ...props,
    };

    return shallow(<IndicatorMessage {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'newMessages' });

    expect(wrapper.hasClass('newMessages')).toBe(true);
  });

  it('renders indicator when new messages arrive', () => {
    const wrapper = subject({ hasNewMessage: 0 });

    expect(wrapper.find('.channel-view__newMessage').exists()).toBe(false);

    wrapper.setProps({ hasNewMessage: 2 });

    expect(wrapper.find('.channel-view__newMessage').exists()).toBe(true);
  });

  it('it should not renders indicator when click on it', () => {
    const closeIndicatorSpy = jest.fn();
    const wrapper = subject({ hasNewMessage: 3, closeIndicator: closeIndicatorSpy });

    expect(wrapper.find('.channel-view__newMessage').exists()).toBe(true);

    wrapper.find('.channel-view__newMessage-bar').simulate('click');

    expect(wrapper.prop('scrollToBottom')).toHaveBeenCalled;
  });
});
