import React from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { shallow } from 'enzyme';

import { MessageInput, Properties } from '.';
import { Key } from '../../lib/keyboard-search';

describe('MessageInput', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
      users: [],
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
    const wrapper = subject({ placeholder: 'Speak' });

    expect(wrapper.find(MentionsInput).prop('placeholder')).toEqual('Speak');
  });

  it('it renders the messageInput', function () {
    const wrapper = subject({ className: 'chat' });

    expect(wrapper.find('.message-input').exists()).toBe(true);
  });

  it('submit message when click on textearea', () => {
    const onSubmit = jest.fn();

    const wrapper = subject({ onSubmit, placeholder: 'Speak' });

    const textarea = wrapper.find(MentionsInput);
    textarea.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false, target: { value: 'Hello' } });
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
