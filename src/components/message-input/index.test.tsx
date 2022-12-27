/**
 * @jest-environment jsdom
 */

import React from 'react';
import { MentionsInput } from 'react-mentions';
import { mount, shallow } from 'enzyme';

import { MessageInput, Properties } from '.';
import { Key } from '../../lib/keyboard-search';
import Dropzone from 'react-dropzone';
import { config } from '../../config';

describe('MessageInput', () => {
  const window = jest.fn();
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
  const subjectMount = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
      users: [],
      onSubmit: () => undefined,
      getUsersForMentions: () => undefined,
      onMessageInputRendered: () => undefined,
      ...props,
    };

    return mount(<MessageInput {...allProps}>{child}</MessageInput>);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'message-input' });

    expect(wrapper.hasClass('message-input')).toBeTrue();
  });

  it('adds placeholder', () => {
    const wrapper = subjectMount({ placeholder: 'Speak' });

    expect(wrapper.find(MentionsInput).prop('placeholder')).toEqual('Speak');
  });

  it('it renders the messageInput', function () {
    const wrapper = subject({ className: 'chat' });

    expect(wrapper.find('.message-input').exists()).toBe(true);
  });

  it('should call editActions', function () {
    const renderAfterInput = jest.fn();
    subjectMount({ renderAfterInput, className: 'chat' });

    expect(renderAfterInput).toHaveBeenCalled();
  });

  it('submit message when click on textearea', () => {
    const onSubmit = jest.fn();
    const wrapper = subjectMount({ onSubmit, placeholder: 'Speak' });

    const textarea = wrapper.find(MentionsInput).find('textarea');
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

  it('renders Dropzone', function () {
    const wrapper = subject({});

    expect(wrapper.find(Dropzone).exists()).toBe(true);
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
