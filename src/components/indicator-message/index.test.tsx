import React from 'react';
import { shallow } from 'enzyme';
import { ZnsLink } from '@zer0-os/zos-component-library';
import IndicatorMessage from '.';

describe('Indicator new message', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      countNewMessages: 0,
      ...props,
    };

    return shallow(<IndicatorMessage {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'newMessages' });

    expect(wrapper.hasClass('newMessages')).toBe(true);
  });

  it('it should not renders indicator when click on it', () => {
    const closeIndicatorSpy = jest.fn();
    const wrapper = subject({ countNewMessages: 3, closeIndicator: closeIndicatorSpy });

    expect(wrapper.find('.indicator__new-message').exists()).toBe(true);

    wrapper.find('.indicator__new-message-bar').simulate('click');

    expect(closeIndicatorSpy).toHaveBeenCalledOnce();
  });
});
