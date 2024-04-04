import React from 'react';

import { shallow } from 'enzyme';

import { MessageInput, Properties } from '.';
import { Key } from '../../lib/keyboard-search';
import Dropzone from 'react-dropzone';
import { config } from '../../config';
import ReplyCard from '../reply-card/reply-card';
import { ViewModes } from '../../shared-components/theme-engine';
import { IconSend3 } from '@zero-tech/zui/icons';
import { Mentions } from './mentions';

describe('MessageInput', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
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
      viewMode: ViewModes.Dark,
      replyIsCurrentUser: false,
      ...props,
    };

    return shallow(<MessageInput {...allProps}>{child}</MessageInput>);
  };

  it('should call editActions', function () {
    const renderAfterInput = jest.fn();
    const wrapper = subject({ renderAfterInput });
    const _dropzone = wrapper.find(Dropzone).shallow();

    expect(renderAfterInput).toHaveBeenCalled();
  });

  it('does not submit message when message state is empty', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });
    const dropzone = wrapper.find(Dropzone).shallow();

    const input = dropzone.find(Mentions);
    input.simulate('keydown', { preventDefault() {}, key: Key.Enter, ctrlKey: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits message when Enter is pressed', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });
    const dropzone = wrapper.find(Dropzone).shallow();

    const input = dropzone.find(Mentions);
    input.simulate('change', { target: { value: 'Hello' } });
    input.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Hello', [], []);
  });

  it('submits message when Enter is pressed and files have been added', () => {
    const onSubmit = jest.fn();
    const dropzoneToMedia = (files) => files;
    const wrapper = subject({ onSubmit, dropzoneToMedia });
    const dropzone = wrapper.find(Dropzone).shallow();

    const input = dropzone.find(Mentions);
    wrapper.find(Dropzone).simulate('drop', [{ name: 'file1' }]);
    input.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('', [], [{ name: 'file1' }]);
  });

  it('submits message when send icon is clicked', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });
    setInput(wrapper, 'Hello');

    const sendIcon = wrapper.find('.message-input__icon--end-action');
    sendIcon.simulate('click');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Hello', [], []);
  });

  it('shows send icon when input has value', () => {
    const wrapper = subject({});
    setInput(wrapper, 'Hello');

    const sendIcon = wrapper.find('.message-input__icon--end-action');

    expect(sendIcon.prop('Icon')).toEqual(IconSend3);
  });

  it('send icon is highlighted when input has a value and there is no disabled message', () => {
    const wrapper = subject({ sendDisabledMessage: '' });
    setInput(wrapper, 'Hello');

    expect(wrapper.find('IconButton[label="send"]').prop('isFilled')).toBe(true);
  });

  it('send icon is not highlighted if there is no input', () => {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement('.message-input__icon--highlighted');
  });

  it('send icon is not highlighted if there is a disabled message', () => {
    const wrapper = subject({ sendDisabledMessage: 'you cannot send yet' });
    setInput(wrapper, 'Hello');

    expect(wrapper).not.toHaveElement('.message-input__icon--highlighted');
  });

  it('opens tooltip if disable message is set and user tries to submit', () => {
    const wrapper = subject({ sendDisabledMessage: 'you cannot send yet' });
    setInput(wrapper, 'Hello');

    wrapper.find('.message-input__icon--end-action').simulate('click');

    expect(wrapper.find('Tooltip').prop('open')).toBe(true);
  });

  it('closes tooltip if disable message clears', () => {
    const wrapper = subject({ sendDisabledMessage: 'you cannot send yet' });
    setInput(wrapper, 'Hello');

    wrapper.find('.message-input__icon--end-action').simulate('click');
    wrapper.setProps({ sendDisabledMessage: '' });

    expect(wrapper.find('Tooltip').prop('open')).toBe(false);
  });

  it('call after render', () => {
    const onMessageInputRendered = jest.fn();

    subject({ onMessageInputRendered });

    expect(onMessageInputRendered).toHaveBeenCalledWith({
      current: null,
    });
  });

  it('renders ReplyCard', function () {
    const messageId = 98988743;
    const message = 'hello';
    const sender = { userId: '78676X67767' };
    const reply = { messageId, message, userId: sender.userId } as any;

    const wrapper = subject({ reply });

    expect(wrapper.find(ReplyCard).prop('message')).toEqual('hello');
  });

  it('call onRemoveReply', function () {
    const onRemoveReply = jest.fn();
    const messageId = 98988743;
    const message = 'hello';
    const sender = { userId: '78676X67767' };
    const reply = { messageId, message, userId: sender.userId } as any;

    const wrapper = subject({ reply, onRemoveReply });
    wrapper.find(ReplyCard).simulate('remove');

    expect(onRemoveReply).toHaveBeenCalledOnce();
  });

  it('dropzone accept all type of images, text, .pdf, .doc files', function () {
    const mimeTypes = {
      'image/*': [],
      // 'text/*': [],
      // 'video/*': [],
      // 'application/pdf': [],
      // 'application/zip': [],
      // 'application/msword': [],
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

  describe('Emojis', () => {
    it('translates typed colon emojis to unicode emojis', () => {
      const onSubmit = jest.fn();
      const wrapper = subject({ onSubmit });
      const dropzone = wrapper.find(Dropzone).shallow();

      const message = 'Message with :smile:';
      dropzone.find(Mentions).simulate('change', { target: { value: message } });
      wrapper.find('.message-input__icon--end-action').simulate('click');

      expect(onSubmit).toHaveBeenCalledWith('Message with 😄', [], []);
    });
  });
});

function setInput(wrapper, input) {
  const dropzone = wrapper.find(Dropzone).shallow();
  dropzone.find(Mentions).simulate('change', { target: { value: input } });
}
