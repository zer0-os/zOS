import React from 'react';

import { shallow } from 'enzyme';

import ReplyCard, { Properties } from './reply-card';
import { ContentHighlighter } from '../content-highlighter';
import { IconButton } from '@zero-tech/zui/components';

import { bem } from '../../lib/bem';

const c = bem('.reply-card');

describe('ReplyCard', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: '',
      senderIsCurrentUser: false,
      senderFirstName: '',
      senderLastName: '',
      mediaName: '',
      mediaUrl: '',
      mediaType: '',
      onRemove: jest.fn(),
      ...props,
    };

    return shallow(<ReplyCard {...allProps} />);
  };

  it('renders reply message', function () {
    const wrapper = subject({ message: 'hello' });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'hello');
  });

  it('does not render reply message if no message is present', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(ContentHighlighter);
  });

  it('renders video when media type is video and url is present', function () {
    const wrapper = subject({ mediaName: 'test-video.mp4', mediaUrl: 'test-video-url', mediaType: 'video' });

    expect(wrapper.find('video')).toHaveProp('src', 'test-video-url');
  });

  it('renders image when media type is image and url is present', function () {
    const wrapper = subject({ mediaName: 'test-image.jpg', mediaUrl: 'test-image-url', mediaType: 'image' });

    expect(wrapper.find('img')).toHaveProp('src', 'test-image-url');
  });

  it('renders audio icon when media type is audio', function () {
    const wrapper = subject({ mediaName: 'test-audio.mp3', mediaUrl: 'test-audio-url', mediaType: 'audio' });

    expect(wrapper).toHaveElement('IconVolumeMax');
  });

  it('renders file icon when media type is file', function () {
    const wrapper = subject({ mediaName: 'test-file.pdf', mediaUrl: 'test-file-url', mediaType: 'file' });

    expect(wrapper).toHaveElement('IconPaperclip');
  });

  it('does not render media when media url is NOT present', function () {
    const wrapper = subject({ message: 'hello' });

    expect(wrapper).not.toHaveElement(c('media-container'));
  });

  it('renders the sender name when senderIsCurrentUser is false', function () {
    const wrapper = subject({ senderIsCurrentUser: false, senderFirstName: 'Jackie', senderLastName: 'Chan' });

    expect(wrapper.find(c('header'))).toHaveText('Jackie Chan');
  });

  it('renders "You" if the sender is the current user', function () {
    const wrapper = subject({ senderIsCurrentUser: true, senderFirstName: 'Jackie', senderLastName: 'Chan' });

    expect(wrapper.find(c('header'))).toHaveText('You');
  });

  it('call onRemove when close icon is clicked', function () {
    const onRemove = jest.fn();

    const wrapper = subject({ onRemove });
    wrapper.find(IconButton).simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
