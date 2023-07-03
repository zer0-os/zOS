import React from 'react';
import { shallow } from 'enzyme';
import { Message } from '.';
import { MediaType } from '../../store/messages';
import { LinkPreview } from '../link-preview';
import { LinkPreviewType } from '../../lib/link-preview';
import { MessageInput } from '../message-input/container';
import { MessageMenu } from '../../platform-apps/channels/messages-menu';
import { ContentHighlighter } from '../content-highlighter';

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

    const text = wrapper.find(ContentHighlighter).prop('message');

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

    expect(wrapper.find('.message__time').text()).toStrictEqual('5:04 PM');
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
    expect(wrapper.find(ContentHighlighter).first().prop('message').trim()).toStrictEqual(parentMessageText);
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

    const wrapper = subject({ preview, message, hidePreview: false });

    expect(wrapper.find(LinkPreview).props()).toEqual(preview);
    expect(wrapper.find(ContentHighlighter).first().prop('message').includes(message)).toBeTruthy();
  });

  it('renders LinkPreview when there is no message text', () => {
    const preview = {
      url: 'http://url.com/index.cfm',
      type: LinkPreviewType.Photo,
      title: 'the-title',
      description: 'the description',
    };

    const wrapper = subject({ preview, message: undefined, hidePreview: false });

    expect(wrapper.find(LinkPreview).props()).toEqual(preview);
  });

  it('does not render LinkPreview when there is a message but hidePreview is true', () => {
    const preview = {
      url: 'http://url.com/index.cfm',
      type: LinkPreviewType.Photo,
      title: 'the-title',
      description: 'the description',
    };
    const message = 'message text accompanying link preview';

    const wrapper = subject({ preview, message, hidePreview: true });

    expect(wrapper.find(LinkPreview)).toEqual({});
  });

  it('renders remove link preview icon when there is a message owned by current user', () => {
    const preview = {
      url: 'http://url.com/index.cfm',
      type: LinkPreviewType.Photo,
      title: 'the-title',
      description: 'the description',
    };
    const message = 'message';
    const id = 'id';
    const onEdit = jest.fn();

    const wrapper = subject({ messageId: id, preview, message, hidePreview: false, isOwner: true, onEdit });

    expect(wrapper.find('.remove-preview__icon').simulate('click'));
    expect(onEdit).toHaveBeenCalledWith(id, message, [], { hidePreview: true });
  });

  it('renders message with mention', () => {
    const wrapper = subject({ message: '@[HamzaKH ](user:aec3c346-a34c-4440-a9e6-d476c2671dd1)' });

    expect(wrapper.find(ContentHighlighter).first().prop('message')).toStrictEqual(
      '@[HamzaKH ](user:aec3c346-a34c-4440-a9e6-d476c2671dd1)'
    );
  });

  it('renders author avatar', () => {
    const wrapper = subject({
      message: 'text',
      showSenderAvatar: true,
    });

    const authorAvatarElement = wrapper.find('.message__author-avatar');

    expect(authorAvatarElement.prop('style').backgroundImage).toEqual(`url(${sender.profileImage})`);
  });

  it('renders with a tag', () => {
    const wrapper = subject({
      message: 'http://zos.io',
    });

    expect(wrapper.find(ContentHighlighter).exists()).toBe(true);
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
