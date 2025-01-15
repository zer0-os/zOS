import { shallow } from 'enzyme';

import { ParentMessage, Properties } from '.';
import { ContentHighlighter } from '../../content-highlighter';

import { bem } from '../../../lib/bem';

const c = bem('.parent-message-container');

describe(ParentMessage, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: 'message',
      senderIsCurrentUser: false,
      senderFirstName: '',
      senderLastName: '',
      mediaUrl: '',
      mediaName: '',
      mediaType: '',
      messageId: 'message-id',
      onMessageClick: () => {},

      ...props,
    };

    return shallow(<ParentMessage {...allProps} />);
  };

  it('renders reply message', function () {
    const wrapper = subject({ message: 'hello' });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'hello');
  });

  it('does not render reply message if no message is present', function () {
    const wrapper = subject({ message: '' });

    expect(wrapper).not.toHaveElement(ContentHighlighter);
  });

  it('renders video when media type is video and url is present', function () {
    const wrapper = subject({ mediaName: 'test-media-name', mediaUrl: 'test-media-url', mediaType: 'video' });

    expect(wrapper.find('video')).toHaveProp('src', 'test-media-url');
  });

  it('renders image when media type is image and url is present', function () {
    const wrapper = subject({ mediaName: 'test-media-name', mediaUrl: 'test-media-url', mediaType: 'image' });

    expect(wrapper.find('img')).toHaveProp('src', 'test-media-url');
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

  it('does not render when both message and mediaUrl are empty', function () {
    const wrapper = subject({ message: '', mediaUrl: '' });

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('renders the sender name when senderIsCurrentUser is false', function () {
    const wrapper = subject({ senderIsCurrentUser: false, senderFirstName: 'Jackie', senderLastName: 'Chan' });

    expect(wrapper.find(c('header'))).toHaveText('Jackie Chan');
  });

  it('renders "You" if the sender is the current user', function () {
    const wrapper = subject({ senderIsCurrentUser: true, senderFirstName: 'Jackie', senderLastName: 'Chan' });

    expect(wrapper.find(c('header'))).toHaveText('You');
  });

  it('calls onMessageClick when the parent message is clicked', function () {
    const onMessageClick = jest.fn();
    const wrapper = subject({ messageId: 'message-id', onMessageClick });

    wrapper.simulate('click');
    expect(onMessageClick).toHaveBeenCalledWith('message-id');
  });
});
