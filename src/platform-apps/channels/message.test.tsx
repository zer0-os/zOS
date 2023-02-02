import React from 'react';
import { shallow } from 'enzyme';
import Linkify from 'linkify-react';
import { Message } from './message';
import { MediaType } from '../../store/messages';
import { LinkPreview } from '../../components/link-preview';
import { LinkPreviewType } from '../../lib/link-preview';
import { MessageInput } from '../../components/message-input';
import MessageMenu from './messages-menu';

describe('message', () => {
  const sender = {
    firstName: 'John',
    lastName: 'Doe',
    profileId: '0cae10cb-a884-45f1-b480-f84881a99fc',
    profileImage: 'https://image.com/image-1',
    userId: '2769eab5-56e7-46c0-a465-c58aa2ef',
  };
  const subject = (props: any = {}) => {
    const allProps = {
      sender,
      parentMessageText: '',
      ...props,
    };

    return shallow(<Message {...allProps} />);
  };

  it('renders message text', () => {
    const wrapper = subject({ message: 'the message' });

    const text = wrapper.find('.message__block-body').text().trim();

    expect(text).toStrictEqual('the message');
  });

  it('renders message video', () => {
    const wrapper = subject({ media: { url: 'https://image.com/video.mp4', type: MediaType.Video } });

    expect(wrapper.find('.message__block-video').exists()).toBe(true);
  });

  it('passes src prop to video', () => {
    const wrapper = subject({ media: { url: 'https://image.com/video.mp4', type: MediaType.Video } });

    expect(wrapper.find('.message__block-video video source').prop('src')).toStrictEqual('https://image.com/video.mp4');
  });

  it('renders message audio', () => {
    const wrapper = subject({ media: { url: 'https://image.com/audio.mp3', type: MediaType.Audio } });

    expect(wrapper.find('.message__block-audio').exists()).toBe(true);
  });

  it('passes src prop to audio', () => {
    const wrapper = subject({ media: { url: 'https://image.com/audio.mp3', type: MediaType.Audio } });

    expect(wrapper.find('.message__block-audio audio source').prop('src')).toStrictEqual('https://image.com/audio.mp3');
  });

  it('renders message image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', type: MediaType.Image } });

    expect(wrapper.find('.message__block-image').exists()).toBe(true);
  });

  it('does not renders message text', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__block-image').exists()).toBe(false);
  });

  it('renders time', () => {
    const wrapper = subject({
      message: 'the message',
      createdAt: new Date('December 17, 1995 17:04:00').valueOf(),
    });

    expect(wrapper.find('.message__time').text()).toStrictEqual('17:04');
  });

  it('renders message menu of items', () => {
    const wrapper = subject({
      message: 'the message',
    });

    expect(wrapper.find('.message__menu-item').exists()).toBe(true);
  });

  it('renders message input', () => {
    const wrapper = subject({
      message: 'the message',
    });

    wrapper.find(MessageMenu).first().prop('onEdit')();

    expect(wrapper.find(MessageInput).exists()).toBe(true);
  });

  it('renders edited indicator', () => {
    const wrapper = subject({
      message: 'the message',
      updatedAt: 86276372,
    });

    expect(wrapper.find('.message__block-edited').exists()).toBe(true);
  });

  it('renders reply message', () => {
    const parentMessageText = 'the message';
    const wrapper = subject({
      message: 'reply message',
      parentMessageText,
    });

    expect(wrapper.find('.message__block-reply').exists()).toBe(true);
    expect(wrapper.find('.message__block-reply-text').text().trim()).toStrictEqual(parentMessageText);
  });

  it('call reply message', () => {
    const onReply = jest.fn();
    const messageId = '989887';
    const message = 'hello';
    const sender = { userId: '78676X67767' };
    const replyMessage = { messageId, message, userId: sender.userId };
    const wrapper = subject({
      message,
      messageId,
      sender,
      onReply,
    });

    wrapper.find(MessageMenu).first().prop('onReply')();

    expect(onReply).toHaveBeenCalledWith(replyMessage);
  });

  it('should not renders edited indicator', () => {
    const wrapper = subject({
      message: 'the message',
      updatedAt: 0,
    });

    expect(wrapper.find('.message__block-edited').exists()).toBe(false);
  });

  it('should not renders edited indicator when onEdit clicked', () => {
    const wrapper = subject({
      message: 'the message',
      updatedAt: 86276372,
    });

    wrapper.find(MessageMenu).first().prop('onEdit')();

    expect(wrapper.find('.message__block-edited').exists()).toBe(false);
  });

  it('should not renders message input', () => {
    const wrapper = subject({
      message: 'the message',
    });

    expect(wrapper.find(MessageInput).exists()).toBe(false);
  });

  it('passes src prop to image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', type: MediaType.Image } });

    expect(wrapper.find('.message__block-image img').prop('src')).toStrictEqual('https://image.com/image.png');
  });

  it('passes alt prop to image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', name: 'work', type: MediaType.Image } });

    expect(wrapper.find('.message__block-image img').prop('alt')).toStrictEqual('work');
  });

  it('renders LinkPreview when there is a message', () => {
    const preview = {
      url: 'http://url.com/index.cfm',
      type: LinkPreviewType.Photo,
      title: 'the-title',
      description: 'the description',
    };
    const message = 'message text accompanying link preview';

    const wrapper = subject({ preview, message });

    expect(wrapper.find(LinkPreview).props()).toEqual(preview);
    expect(wrapper.text().includes(message)).toBeTruthy();
  });

  it('renders LinkPreview when there is no message text', () => {
    const preview = {
      url: 'http://url.com/index.cfm',
      type: LinkPreviewType.Photo,
      title: 'the-title',
      description: 'the description',
    };

    const wrapper = subject({ preview, message: undefined });

    expect(wrapper.find(LinkPreview).props()).toEqual(preview);
  });

  it('renders message with mention', () => {
    const wrapper = subject({ message: '@[HamzaKH ](user:aec3c346-a34c-4440-a9e6-d476c2671dd1)' });

    const mentions = wrapper.find('.message__user-mention');

    expect(mentions).toHaveLength(1);
  });

  it('renders with a tag', () => {
    const wrapper = subject({
      message: 'http://zos.io',
    });

    expect(wrapper.find(Linkify).exists()).toBe(true);
  });

  describe('Lightbox', () => {
    it('opens when image file is clicked', () => {
      const media = { url: 'https://image.com/image.png', type: MediaType.Image };
      const onImageClick = jest.fn();

      const wrapper = subject({ media, onImageClick });

      wrapper.find('[className$="-image"]').simulate('click');

      expect(onImageClick).toHaveBeenCalled();
    });

    it('does not open when video file is clicked', () => {
      const media = { url: 'https://image.com/video.mp4', type: MediaType.Video };
      const onImageClick = jest.fn();

      const wrapper = subject({ media, onImageClick });

      wrapper.find('[className$="-video"]').simulate('click');

      expect(onImageClick).not.toHaveBeenCalled();
    });

    it('does not open when audio file is clicked', () => {
      const media = { url: 'https://image.com/audio.mp3', type: MediaType.Audio };
      const onImageClick = jest.fn();

      const wrapper = subject({ media, onImageClick });

      wrapper.find('[className$="-audio"]').simulate('click');

      expect(onImageClick).not.toHaveBeenCalled();
    });
  });
});
