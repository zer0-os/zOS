import React from 'react';
import { MentionsInput } from 'react-mentions';
import { shallow } from 'enzyme';

import { MessageInput, Properties } from '.';
import { Key } from '../../lib/keyboard-search';
import Dropzone from 'react-dropzone';
import { config } from '../../config';
import ReplyCard from '../reply-card/reply-card';

describe('MessageInput', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
      users: [],
      reply: null,
      onSubmit: () => undefined,
      onRemoveReply: () => undefined,
      getUsersForMentions: () => undefined,
      onMessageInputRendered: () => undefined,
      renderAfterInput: () => undefined,
      clipboard: {
        addPasteListener: (_) => {},
        removePasteListener: (_) => {},
      },
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
    const dropzone = wrapper.find(Dropzone).shallow();

    expect(dropzone.find(MentionsInput).prop('placeholder')).toEqual('Speak');
  });

  it('it renders the messageInput', function () {
    const wrapper = subject({ className: 'chat' });

    expect(wrapper.find('.message-input').exists()).toBe(true);
  });

  it('should call editActions', function () {
    const renderAfterInput = jest.fn();
    const wrapper = subject({ renderAfterInput, className: 'chat' });
    const _dropzone = wrapper.find(Dropzone).shallow();

    expect(renderAfterInput).toHaveBeenCalled();
  });

  it('submit message when click on textarea', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit, placeholder: 'Speak' });
    const dropzone = wrapper.find(Dropzone).shallow();

    const input = dropzone.find(MentionsInput);
    input.simulate('change', { target: { value: 'Hello' } });
    input.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('call after render', () => {
    const onMessageInputRendered = jest.fn();

    subject({ onMessageInputRendered });

    expect(onMessageInputRendered).toHaveBeenCalledWith({
      current: null,
    });
  });

  it('renders Dropzone', function () {
    const wrapper = subject({});

    expect(wrapper.find(Dropzone).exists()).toBe(true);
  });

  it('renders ReplyCard', function () {
    const messageId = 98988743;
    const message = 'hello';
    const sender = { userId: '78676X67767' };
    const reply = { messageId, message, userId: sender.userId };

    const wrapper = subject({ reply });
    const dropzone = wrapper.find(Dropzone).shallow();

    expect(dropzone.find(ReplyCard).exists()).toBe(true);
  });

  it('call onRemoveReply', function () {
    const onRemoveReply = jest.fn();
    const messageId = 98988743;
    const message = 'hello';
    const sender = { userId: '78676X67767' };
    const reply = { messageId, message, userId: sender.userId };

    const wrapper = subject({ reply, onRemoveReply });

    const dropzone = wrapper.find(Dropzone).shallow();
    dropzone.find(ReplyCard).prop('onRemove')();

    expect(onRemoveReply).toHaveBeenCalledOnce();
  });

  it('dropzone accept all type of images', function () {
    const mimeTypes = {
      'image/*': [],
    };

    const wrapper = subject({});
    const dropZone = wrapper.find(Dropzone);
    expect(dropZone.prop('accept')).toEqual(mimeTypes);
  });

  it('dropzone max size', function () {
    const maxSize = config.cloudinary.max_file_size;

    const wrapper = subject({});
    const dropZone = wrapper.find(Dropzone);
    expect(dropZone.prop('maxSize')).toEqual(maxSize);
  });
});
