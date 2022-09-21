import React from 'react';

import { shallow } from 'enzyme';

import { Properties } from './message-input';
import { MessageInput } from './message-input';

describe('MessageInput', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
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

    expect(wrapper.find('textarea').prop('placeholder')).toEqual('Speak');
  });

  it('submit message when click on textearea', () => {
    const onSubmit = jest.fn();

    const wrapper = subject({ onSubmit, placeholder: 'Speak' });

    const textarea = wrapper.find('textarea');
    textarea.simulate('keydown', { preventDefault() {}, keyCode: 13, shiftKey: false, target: { value: 'Hello' } });
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
