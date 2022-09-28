import React from 'react';

import { shallow } from 'enzyme';

import { MessageInput, Properties } from '.';

describe('MessageInput', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
      isUserConnected: false,
      onSubmit: () => undefined,
      ...props,
    };

    return shallow(<MessageInput {...allProps}>{child}</MessageInput>);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'message-input' });

    expect(wrapper.hasClass('message-input')).toBeTrue();
  });

  it('adds placeholder', () => {
    const wrapper = subject({ placeholder: 'Speak', isUserConnected: true });

    expect(wrapper.find('textarea').prop('placeholder')).toEqual('Speak');
  });

  it('it renders the messageInput', function () {
    const wrapper = subject({ className: 'chat', isUserConnected: true });

    expect(wrapper.find('.message-input').exists()).toBe(true);
  });

  it('it not renders the messageInput if user disconnected', function () {
    const wrapper = subject({ className: 'chat' });

    expect(wrapper.find('.message-input').exists()).toBe(false);
  });

  it('submit message when click on textearea', () => {
    const onSubmit = jest.fn();

    const wrapper = subject({ onSubmit, placeholder: 'Speak', isUserConnected: true });

    const textarea = wrapper.find('textarea');
    textarea.simulate('keydown', { preventDefault() {}, keyCode: 13, shiftKey: false, target: { value: 'Hello' } });
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
