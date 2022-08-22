import React from 'react';
import { shallow } from 'enzyme';
import { Emoji } from 'emoji-mart';
import { Message } from './message';

describe('message', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      message: '',
      media: { url: '', name: '', type: '' },
      ...props,
    };

    return shallow(<Message {...allProps} />);
  };

  it('renders message text', () => {
    const wrapper = subject({ message: 'the message' });

    const textes = wrapper.find('.message__block-body').text().trim();

    expect(textes).toStrictEqual('the message');
  });

  it('does not renders message text', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png' } });

    expect(wrapper.find('.message__block-body').exists()).toBe(false);
  });

  it('renders message icon', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__block-icon').exists()).toBe(true);
  });

  it('renders message video', () => {
    const wrapper = subject({ media: { url: 'https://image.com/video.mp4', type: 'video' } });

    expect(wrapper.find('.message__block-video').exists()).toBe(true);
  });

  it('passes src prop to video', () => {
    const wrapper = subject({ media: { url: 'https://image.com/video.mp4', type: 'video' } });

    expect(wrapper.find('.message__block-video video source').prop('src')).toStrictEqual('https://image.com/video.mp4');
  });

  it('renders message audio', () => {
    const wrapper = subject({ media: { url: 'https://image.com/audio.mp3', type: 'audio' } });

    expect(wrapper.find('.message__block-audio').exists()).toBe(true);
  });

  it('passes src prop to audio', () => {
    const wrapper = subject({ media: { url: 'https://image.com/audio.mp3', type: 'audio' } });

    expect(wrapper.find('.message__block-audio audio source').prop('src')).toStrictEqual('https://image.com/audio.mp3');
  });

  it('renders message image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', type: 'image' } });

    expect(wrapper.find('.message__block-image').exists()).toBe(true);
  });

  it('does not renders message text', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__block-image').exists()).toBe(false);
  });

  it('renders time', () => {
    const wrapper = subject({ message: 'the message', createdAt: new Date('December 17, 1995 17:04:00').valueOf() });

    expect(wrapper.find('.message__time').text()).toStrictEqual('17:04');
  });

  it('passes src prop to image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', type: 'image' } });

    expect(wrapper.find('.message__block-image img').prop('src')).toStrictEqual('https://image.com/image.png');
  });

  it('passes alt prop to image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', name: 'work', type: 'image' } });

    expect(wrapper.find('.message__block-image img').prop('alt')).toStrictEqual('work');
  });

  it('renders message with emojis', () => {
    const wrapper = subject({ message: ':kissing_heart: :stuck_out_tongue_winking_eye: and some text' });

    const classNames = wrapper.find(Emoji).map((m) => m.prop('emoji'));

    expect(classNames).toIncludeAllMembers([
      ':kissing_heart:',
      ':stuck_out_tongue_winking_eye:',
    ]);

    const textes = wrapper.find('.message__block-body').text().trim();

    expect(textes).toStrictEqual('<Emoji /> <Emoji /> and some text');
  });
});
