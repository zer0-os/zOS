import React from 'react';
import { shallow } from 'enzyme';
import { Message } from '.';
import { MediaDownloadStatus, MediaType, MessageSendStatus } from '../../store/messages';
import { LinkPreview } from '../link-preview';
import { LinkPreviewType } from '../../lib/link-preview';
import { MessageInput } from '../message-input/container';
import { MessageMenu } from '../../platform-apps/channels/messages-menu';
import { ContentHighlighter } from '../content-highlighter';
import { ParentMessage } from './parent-message';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator/Spinner';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { MessagesFetchState } from '../../store/channels';

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

  it('passes correct mime type to audio source', () => {
    const wrapper = subject({
      media: {
        url: 'https://image.com/audio.m4a',
        type: MediaType.Audio,
        mimetype: 'audio/x-m4a',
      },
    });

    expect(wrapper.find('.message__block-audio audio source').prop('type')).toStrictEqual('audio/x-m4a');
  });

  it('renders message image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', type: MediaType.Image } });

    expect(wrapper.find('.message__block-image').exists()).toBe(true);
  });

  it('renders placeholder if no media url and mimetype is not application', () => {
    const loadAttachmentDetails = jest.fn();

    const wrapper = subject({
      loadAttachmentDetails,
      media: { id: '1', url: null, type: MediaType.Image, mimetype: 'image/png' },
    });

    expect(wrapper.find('.message__placeholder-container').exists()).toBe(true);
  });

  it('renders placeholder if matrix media url and mimetype is not application', () => {
    const loadAttachmentDetails = jest.fn();

    const wrapper = subject({
      loadAttachmentDetails,
      media: { id: '1', url: 'mxc://some-test-matrix-url', type: MediaType.Image, mimetype: 'image/png' },
    });

    expect(wrapper.find('.message__placeholder-container').exists()).toBe(true);
  });

  it('renders attachment cards if mimetype is application and url is null', () => {
    const loadAttachmentDetails = jest.fn();

    const wrapper = subject({
      loadAttachmentDetails,
      media: { id: '1', url: null, type: MediaType.Image, mimetype: 'application/pdf' },
    });

    expect(wrapper.find(AttachmentCards).exists()).toBe(true);
  });

  it('renders failed alert icon if media download status is failed', () => {
    const loadAttachmentDetails = jest.fn();

    const wrapper = subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: null, type: MediaType.Image, downloadStatus: MediaDownloadStatus.Failed },
    });

    expect(wrapper).toHaveElement(IconAlertCircle);
  });

  it('renders loading spinner if media download status is loading', () => {
    const loadAttachmentDetails = jest.fn();

    const wrapper = subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: null, type: MediaType.Image, downloadStatus: MediaDownloadStatus.Loading },
    });

    expect(wrapper).toHaveElement(Spinner);
  });

  it('calls loadAttachmentDetails if no media url and messagesFetchStatus is success', () => {
    const loadAttachmentDetails = jest.fn();

    subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: null, type: MediaType.Image },
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });

    expect(loadAttachmentDetails).toHaveBeenCalled();
  });

  it('calls loadAttachmentDetails if url is a matrix media url and messagesFetchStatus is success', () => {
    const loadAttachmentDetails = jest.fn();
    subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: 'mxc://some-test-matrix-url', type: MediaType.Image },
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });

    expect(loadAttachmentDetails).toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if messagesFetchStatus is not success', () => {
    const loadAttachmentDetails = jest.fn();

    subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: null, type: MediaType.Image },
      messagesFetchStatus: MessagesFetchState.FAILED,
    });

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if url is defined and not a matrix media url', () => {
    const loadAttachmentDetails = jest.fn();

    subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: 'some-test-url', type: MediaType.Image, downloadStatus: MediaDownloadStatus.Failed },
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if media download status is failed', () => {
    const loadAttachmentDetails = jest.fn();

    subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: null, type: MediaType.Image, downloadStatus: MediaDownloadStatus.Failed },
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if media download status is loading', () => {
    const loadAttachmentDetails = jest.fn();

    subject({
      messageId: 'test-id',
      loadAttachmentDetails,
      media: { url: null, type: MediaType.Image, downloadStatus: MediaDownloadStatus.Loading },
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('calculates and applies correct dimensions for the placeholder', () => {
    const loadAttachmentDetails = jest.fn();
    const media = { id: '1', url: null, width: 1200, height: 1200, type: MediaType.Image };
    const maxWidthConstraint = 520;
    const aspectRatioAdjustedHeight = 520;

    const wrapper = subject({ loadAttachmentDetails, media });

    const placeholderContainer = wrapper.find('.message__placeholder-container');

    expect(placeholderContainer).toHaveProp('style', { width: maxWidthConstraint, height: aspectRatioAdjustedHeight });
  });

  it('does not renders message text', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__block-image').exists()).toBe(false);
  });

  it('renders time if specified', () => {
    const wrapper = subject({
      createdAt: new Date('December 17, 1995 17:04:00').valueOf(),
      showTimestamp: true,
      message: 'message',
    });

    expect(wrapper.find('.message__time').text()).toStrictEqual('5:04 PM');
  });

  it('does not render time if not specified', () => {
    const wrapper = subject({
      createdAt: new Date('December 17, 1995 17:04:00').valueOf(),
      showTimestamp: false,
    });

    expect(wrapper).not.toHaveElement('.message__time');
  });

  it('renders author name if specified', () => {
    const wrapper = subject({
      sender: { firstName: 'first', lastName: 'last' },
      showAuthorName: true,
      message: 'the message',
    });

    expect(wrapper.find('.message__author-name').text()).toStrictEqual('first last');
  });

  it('does not render author name if not specified', () => {
    const wrapper = subject({
      sender: { firstName: 'first', lastName: 'last' },
      showAuthorName: false,
      message: 'the message',
    });

    expect(wrapper).not.toHaveElement('.message__author-name');
  });

  it('renders time if status not failed', () => {
    const wrapper = subject({
      message: 'the message',
      createdAt: new Date('December 17, 1995 17:04:00').valueOf(),
      showTimestamp: true,
    });

    expect(wrapper.find('.message__time').text()).toStrictEqual('5:04 PM');
    expect(wrapper).not.toHaveElement('.message__failure-message');
  });

  it('renders failure message instead of time if status is failed', () => {
    const wrapper = subject({
      message: 'the message',
      createdAt: new Date('December 17, 1995 17:04:00').valueOf(),
      sendStatus: MessageSendStatus.FAILED,
      showTimestamp: true,
    });

    expect(wrapper).not.toHaveElement('.message__time');
    expect(wrapper).toHaveElement('.message__failure-message');
  });

  it('renders message menu of items', () => {
    const wrapper = subject({ message: 'the message' });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.simulate('contextmenu', mockEvent);

    expect(wrapper.find('.message__menu-item').exists()).toBe(true);
  });

  it('should not renders message input', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find(MessageInput).exists()).toBe(false);
  });

  it('disables all menu abilities when in progress', () => {
    const wrapper = subject({
      message: 'the message',
      isOwner: true,
      sendStatus: MessageSendStatus.IN_PROGRESS,
    });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.simulate('contextmenu', mockEvent);

    expect(wrapper.find(MessageMenu).exists()).toBe(true);

    const messageMenuProps = wrapper.find(MessageMenu).props();
    expect(messageMenuProps.canEdit).toBe(false);
    expect(messageMenuProps.canReply).toBe(false);
    expect(messageMenuProps.canDelete).toBe(false);
    expect(messageMenuProps.canViewInfo).toBe(false);
    expect(messageMenuProps.canReportUser).toBe(false);
  });

  it('allows reply when parent message is set', () => {
    const wrapper = subject({
      message: 'the message',
      parentMessageText: 'quoted message',
    });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.simulate('contextmenu', mockEvent);

    expect(wrapper.find(MessageMenu).exists()).toBe(true);

    const messageMenuProps = wrapper.find(MessageMenu).first().props();
    expect(messageMenuProps.canReply).toBe(true);
  });

  it('allows only delete when message send failed', () => {
    const wrapper = subject({
      message: 'the message',
      isOwner: true,
      sendStatus: MessageSendStatus.FAILED,
    });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.find('.message').simulate('contextmenu', mockEvent);

    expect(wrapper.find(MessageMenu).exists()).toBe(true);

    const messageMenuProps = wrapper.find(MessageMenu).first().props();
    expect(messageMenuProps.canEdit).toBe(false);
    expect(messageMenuProps.canReply).toBe(false);
    expect(messageMenuProps.canViewInfo).toBe(false);
    expect(messageMenuProps.canDelete).toBe(true);
  });

  it('displays the menu when message send failed', () => {
    const wrapper = subject({
      message: 'the message',
      isOwner: true,
      sendStatus: MessageSendStatus.FAILED,
    });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.find('.message').simulate('contextmenu', mockEvent);

    expect(wrapper.find('.menu--force-visible').exists()).toBe(true);
  });

  it('renders edited indicator', () => {
    const wrapper = subject({
      message: 'the message',
      updatedAt: 86276372,
    });

    expect(wrapper.find('.message__footer').text()).toEqual('(Edited)');
  });

  it('renders media when editing media message with text', () => {
    const wrapper = subject({
      message: 'the message',
      media: { url: 'https://image.com/image.png', type: MediaType.Image },
    });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.simulate('contextmenu', mockEvent);

    wrapper.find(MessageMenu).props().onEdit();

    expect(wrapper.find(MessageInput)).toExist();
    expect(wrapper.find('.message__block-image img')).toExist();
  });

  it('renders reply message', () => {
    const parentMessageText = 'the message';
    const wrapper = subject({
      message: 'reply message',
      parentMessageText,
    });

    expect(wrapper.find(ParentMessage).prop('message')).toStrictEqual(parentMessageText);
  });

  it('call reply message', () => {
    const onReply = jest.fn();
    const messageId = '989887';
    const message = 'hello';
    const sender = { userId: '78676X67767' };
    const replyMessage = {
      messageId,
      message,
      userId: sender.userId,
      sender: sender,
      isAdmin: false,
      mentionedUsers: [],
      hidePreview: true,
      admin: {},
      optimisticId: '',
      rootMessageId: '',
    };
    const wrapper = subject({
      message,
      messageId,
      sender,
      isAdmin: false,
      mentionedUsers: [],
      hidePreview: true,
      admin: {},
      optimisticId: '',
      rootMessageId: '',
      onReply,
    });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.simulate('contextmenu', mockEvent);

    wrapper.find(MessageMenu).simulate('reply');

    expect(onReply).toHaveBeenCalledWith({ reply: replyMessage });
  });

  it('should not renders edited indicator', () => {
    const wrapper = subject({
      message: 'the message',
      updatedAt: 0,
    });

    expect(wrapper.find('.message__block-edited').exists()).toBe(false);
  });

  it('should not render the edited indicator when onEdit is clicked', () => {
    const wrapper = subject({
      message: 'the message',
      updatedAt: 86276372,
    });

    const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    wrapper.simulate('contextmenu', mockEvent);

    wrapper.find(MessageMenu).props().onEdit();

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

    expect(wrapper.find(LinkPreview).props()).toEqual(expect.objectContaining(preview));
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

    expect(wrapper.find(LinkPreview).props()).toEqual(expect.objectContaining(preview));
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

    expect(wrapper.find(LinkPreview).simulate('remove'));
    expect(onEdit).toHaveBeenCalledWith(id, message, [], { hidePreview: true });
  });

  it('does not render link preview if there is a file', () => {
    const wrapper = subject({
      preview: { url: 'example.com' },
      hidePreview: false,
      media: { url: 'https://image.com/image.png', type: MediaType.Image },
    });

    expect(wrapper).not.toHaveElement(LinkPreview);
  });

  it('does not render link preview if message is a reply', () => {
    const wrapper = subject({
      preview: { url: 'example.com' },
      hidePreview: false,
      parentMessageText: 'quoted message',
    });

    expect(wrapper).not.toHaveElement(LinkPreview);
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

    const avatarComponent = wrapper.find('.message__author-avatar Avatar');

    expect(avatarComponent.exists()).toBe(true);

    expect(avatarComponent.prop('imageURL')).toEqual(`${sender.profileImage}`);
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

  describe('MessageMenu', () => {
    it('enables download option for media messages', () => {
      const wrapper = subject({
        message: 'the message',
        media: { url: 'https://image.com/image.png', type: MediaType.Image },
      });

      const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
      wrapper.simulate('contextmenu', mockEvent);

      const messageMenuProps = wrapper.find(MessageMenu).props();
      expect(messageMenuProps.canDownload).toBe(true);
      expect(messageMenuProps.isMediaMessage).toBe(true);
    });

    it('disables download option for non-media messages', () => {
      const wrapper = subject({
        message: 'the message',
      });

      const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
      wrapper.simulate('contextmenu', mockEvent);

      const messageMenuProps = wrapper.find(MessageMenu).props();
      expect(messageMenuProps.canDownload).toBe(false);
      expect(messageMenuProps.isMediaMessage).toBe(false);
    });

    it('disables download option for gif images', () => {
      const wrapper = subject({
        message: 'the message',
        media: { url: 'https://image.com/image.gif', type: MediaType.Image, mimetype: 'image/gif' },
      });

      const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
      wrapper.simulate('contextmenu', mockEvent);

      const messageMenuProps = wrapper.find(MessageMenu).props();
      expect(messageMenuProps.canDownload).toBe(false);
      expect(messageMenuProps.isMediaMessage).toBe(true);
    });

    it('enables copy option for media messages', () => {
      const wrapper = subject({
        message: 'the message',
        media: { url: 'https://image.com/image.png', type: MediaType.Image },
      });

      const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
      wrapper.simulate('contextmenu', mockEvent);

      const messageMenuProps = wrapper.find(MessageMenu).props();
      expect(messageMenuProps.canCopy).toBe(true);
    });

    it('does not enable copy option for non-media messages', () => {
      const wrapper = subject({
        message: 'the message',
      });

      const mockEvent = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
      wrapper.simulate('contextmenu', mockEvent);

      const messageMenuProps = wrapper.find(MessageMenu).props();
      expect(messageMenuProps.canCopy).toBe(false);
    });
  });

  describe('Report Button', () => {
    it('should not renders report button when message is owned by current user', () => {
      const wrapper = subject({
        message: 'the message',
        isOwner: true,
      });

      expect(wrapper.find(MessageMenu).props().canReportUser).toBe(false);
    });

    it('should renders report button when message is not owned by current user', () => {
      const wrapper = subject({
        message: 'the message',
        isOwner: false,
      });

      expect(wrapper.find(MessageMenu).props().canReportUser).toBe(true);
    });

    it('should call onReportUser when report button is clicked', () => {
      const onReportUser = jest.fn();
      const wrapper = subject({ message: 'the message', isOwner: false, onReportUser });

      wrapper.find(MessageMenu).simulate('reportUser');

      expect(onReportUser).toHaveBeenCalledWith({ reportedUserId: sender.userId });
    });
  });
});
