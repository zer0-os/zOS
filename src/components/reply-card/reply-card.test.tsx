import React from 'react';

import { shallow } from 'enzyme';

import ReplyCard, { Properties } from './reply-card';
import { ContentHighlighter } from '../content-highlighter';
import { IconButton } from '@zero-tech/zui/components';
import { MediaType } from '../../store/messages';

import { bem } from '../../lib/bem';

const c = bem('.reply-card');

const mockUseMatrixMedia = jest.fn();
jest.mock('../../lib/hooks/useMatrixMedia', () => ({
  useMatrixMedia: (file) => mockUseMatrixMedia(file),
}));

describe('ReplyCard', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: '',
      senderIsCurrentUser: false,
      senderFirstName: '',
      senderLastName: '',
      media: { url: '', type: MediaType.Image, name: '', width: 0, height: 0 },
      onRemove: jest.fn(),
      ...props,
    };

    return shallow(<ReplyCard {...allProps} />);
  };

  beforeEach(() => {
    mockUseMatrixMedia.mockImplementation((file) => {
      const url = file?.url || (typeof file === 'string' ? file : null);
      return {
        data: url,
        isPending: false,
        isError: false,
      };
    });
  });

  it('renders reply message', function () {
    const wrapper = subject({ message: 'hello' });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'hello');
  });

  it('does not render reply message if no message is present', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(ContentHighlighter);
  });

  it('renders video when media type is video and url is present', function () {
    const wrapper = subject({
      media: { url: 'test-video-url', type: MediaType.Video, name: 'test-video.mp4', width: 0, height: 0 },
    });

    expect(wrapper.find('video')).toHaveProp('src', 'test-video-url');
  });

  it('renders image when media type is image and url is present', function () {
    const wrapper = subject({
      media: { url: 'test-image-url', type: MediaType.Image, name: 'test-image.jpg', width: 0, height: 0 },
    });

    expect(wrapper.find('img')).toHaveProp('src', 'test-image-url');
  });

  it('renders audio icon when media type is audio', function () {
    const wrapper = subject({
      media: { url: 'test-audio-url', type: MediaType.Audio, name: 'test-audio.mp3', width: 0, height: 0 },
    });

    expect(wrapper).toHaveElement('IconVolumeMax');
  });

  it('renders file icon when media type is file', function () {
    const wrapper = subject({
      media: { url: 'test-file-url', type: MediaType.File, name: 'test-file.pdf', width: 0, height: 0 },
    });

    expect(wrapper).toHaveElement('IconPaperclip');
  });

  it('does not render media when media url is NOT present', function () {
    const wrapper = subject({ message: 'hello' });

    expect(wrapper).not.toHaveElement(c('media-container'));
  });

  it('renders the sender name when senderIsCurrentUser is false', function () {
    const wrapper = subject({
      message: 'hello',
      senderIsCurrentUser: false,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
    });

    expect(wrapper.find(c('header'))).toHaveText('Jackie Chan');
  });

  it('renders "You" if the sender is the current user', function () {
    const wrapper = subject({
      message: 'hello',
      senderIsCurrentUser: true,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
    });

    expect(wrapper.find(c('header'))).toHaveText('You');
  });

  it('call onRemove when close icon is clicked', function () {
    const onRemove = jest.fn();

    const wrapper = subject({ message: 'hello', onRemove });
    wrapper.find(IconButton).simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
