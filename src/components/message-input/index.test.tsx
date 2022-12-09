import React from 'react';
import { MentionsInput } from 'react-mentions';
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
      getUsersForMentions: () => undefined,
      onMessageInputRendered: () => undefined,
      renderAfterInput: () => undefined,
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

  it('should call editActions', function () {
    const renderAfterInput = jest.fn();
    subject({ renderAfterInput, className: 'chat' });

    expect(renderAfterInput).toHaveBeenCalled();
  });

  it('submit message when click on textearea', () => {
    const onSubmit = jest.fn();

    const wrapper = subject({ onSubmit, placeholder: 'Speak' });

    const textarea = wrapper.find(MentionsInput);
    textarea.simulate('change', { target: { value: 'Hello' } });
    textarea.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('call after render', () => {
    const onMessageInputRendered = jest.fn();

    subject({ onMessageInputRendered });

    expect(onMessageInputRendered).toHaveBeenCalledWith({
      current: null,
    });
  });
});
