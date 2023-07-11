import React from 'react';

import { MentionsInput } from 'react-mentions';
import { shallow } from 'enzyme';

import { MessageInput, Properties } from '.';
import { Key } from '../../lib/keyboard-search';
import Dropzone from 'react-dropzone';
import { config } from '../../config';
import ReplyCard from '../reply-card/reply-card';
import { ViewModes } from '../../shared-components/theme-engine';
import { EmojiPicker } from './emoji-picker/emoji-picker';
import MessageAudioRecorder from '../message-audio-recorder';
import { Giphy } from './giphy/giphy';
import ImageCards from '../../platform-apps/channels/image-cards';

describe('MessageInput', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
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

  it('does not submit message when message state is empty', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit, placeholder: 'Speak' });
    const dropzone = wrapper.find(Dropzone).shallow();

    const input = dropzone.find(MentionsInput);
    input.simulate('keydown', { preventDefault() {}, key: Key.Enter, ctrlKey: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits message when Enter is pressed', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit, placeholder: 'Speak' });
    const dropzone = wrapper.find(Dropzone).shallow();

    const input = dropzone.find(MentionsInput);
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

    const input = dropzone.find(MentionsInput);
    wrapper.find(Dropzone).simulate('drop', [{ name: 'file1' }]);
    input.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('', [], [{ name: 'file1' }]);
  });

  it('submits message when send icon is clicked', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit, placeholder: 'Speak' });
    const dropzone = wrapper.find(Dropzone).shallow();
    const input = dropzone.find(MentionsInput);
    input.simulate('change', { target: { value: 'Hello' } });

    wrapper.update();

    const sendIcon = wrapper.find('.message-input__icon--send');
    sendIcon.simulate('click');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Hello', [], []);
  });

  it('shows send icon when input has value', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit, placeholder: 'Speak' });
    const dropzone = wrapper.find(Dropzone).shallow();
    const input = dropzone.find(MentionsInput);
    input.simulate('change', { target: { value: 'Hello' } });

    wrapper.update();

    const sendIcon = wrapper.find('.message-input__icon--send');

    expect(sendIcon.exists()).toBe(true);
  });

  it('renders end action icon', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit, placeholder: 'Speak' });

    const endActionIcon = wrapper.find('.message-input__icon--end-action');

    expect(endActionIcon.exists()).toBe(true);
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

  it('renders MessageAudioRecorder', function () {
    const wrapper = subject({});
    const dropzone = wrapper.find(Dropzone).shallow();

    expect(dropzone.find(MessageAudioRecorder).exists()).toBe(false);

    wrapper.find('.message-input__icon--end-action').simulate('click');

    dropzone.setProps({});

    expect(dropzone.find(MessageAudioRecorder).exists()).toBe(true);
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

  it('dropzone accept all type of images, text, .pdf, .doc files', function () {
    const mimeTypes = {
      'image/*': [],
      'text/*': [],
      'video/*': [],
      'application/pdf': [],
      'application/zip': [],
      'application/msword': [],
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

  it('searches for matching users via userMentionSearch function', async function () {
    const getUsersForMentions = async (_searchString) => Promise.resolve([{ id: '1', display: 'dale' }]);
    const wrapper = subject({ getUsersForMentions });

    const searchResults = await userSearch(wrapper, 'da');

    expect(searchResults).toEqual([{ display: 'dale', id: '1' }]);
  });

  it('sorts by search string index', async function () {
    const getUsersForMentions = async (_searchString) =>
      Promise.resolve([
        { id: 'd-2', display: '2-dale' },
        { id: 'd-3', display: '3--dale' },
        { id: 'd-1', display: 'dale' },
      ]);
    const wrapper = subject({ getUsersForMentions });

    const searchResults = await userSearch(wrapper, 'da');

    expect(searchResults).toEqual([
      { display: 'dale', id: 'd-1' },
      { display: '2-dale', id: 'd-2' },
      { display: '3--dale', id: 'd-3' },
    ]);
  });

  describe('Emojis', () => {
    const getEmojiPicker = () => {
      const wrapper = subject({});
      return wrapper.find(Dropzone).shallow().find(EmojiPicker);
    };

    it('renders', function () {
      const emojiPicker = getEmojiPicker();

      expect(emojiPicker.exists()).toBe(true);
    });
  });

  describe('Giphy', () => {
    it('should render giphy component', function () {
      const wrapper = subject({});
      const dropzone = wrapper.find(Dropzone).shallow();

      expect(dropzone.find(Giphy).exists()).toBe(false);

      wrapper.find('.message-input__icon--giphy').simulate('click');

      dropzone.setProps({});

      expect(dropzone.find(Giphy).exists()).toBe(true);
    });
    it('should render giphy component and insert gif in media when giphy icon is clicked', function () {
      const sampleGif = { id: '1', title: 'Hilarious gif', images: { preview_gif: { url: 'youfoundme.gif' } } };
      const wrapper = subject({});
      const dropzone = wrapper.find(Dropzone).shallow();

      wrapper.find('.message-input__icon--giphy').simulate('click');

      dropzone.setProps({});

      dropzone.find(Giphy).simulate('clickGif', sampleGif);

      dropzone.setProps({});

      expect(dropzone.find(ImageCards).prop('images')[0]).toStrictEqual({
        id: '1',
        name: 'Hilarious gif',
        url: 'youfoundme.gif',
        mediaType: 'image',
        giphy: sampleGif,
      } as any);

      expect(dropzone.find(Giphy).exists()).toBe(false);
    });
  });

  async function userSearch(wrapper, search) {
    const userMentionHandler = wrapper
      .find(Dropzone)
      .shallow()
      .find(MentionsInput)
      .shallow()
      .find('Mention')
      .findWhere((n) => n.prop('trigger') === '@');
    let searchResults = [];
    const callback = (r) => {
      searchResults = r;
    };
    await userMentionHandler.prop('data')(search, callback);
    return searchResults;
  }
});
