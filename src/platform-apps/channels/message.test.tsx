import React from 'react';

import { shallow } from 'enzyme';

import { Message } from './message';
import { Embed } from '../../components/link-preview/embed';
import { LinkPreviewType } from '../../lib/link-preview';

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

    const text = wrapper.find('.message__block-body').text().trim();

    expect(text).toStrictEqual('the message');
  });

  it('does not renders message text', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png' } });

    expect(wrapper.find('.message__block-body').exists()).toBe(false);
  });

  it('renders header date', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__date-header-date').exists()).toBe(true);
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

  it('renders message image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', type: 'image' } });

    expect(wrapper.find('.message__block-image').exists()).toBe(true);
  });

  it('does not renders message text', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__block-image').exists()).toBe(false);
  });

  it('passes src prop to image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', type: 'image' } });

    expect(wrapper.find('.message__block-image img').prop('src')).toStrictEqual('https://image.com/image.png');
  });

  it('passes alt prop to image', () => {
    const wrapper = subject({ media: { url: 'https://image.com/image.png', name: 'work', type: 'image' } });

    expect(wrapper.find('.message__block-image img').prop('alt')).toStrictEqual('work');
  });

  it('renders link preview embed', () => {
    const preview = {
      url: 'http://url.com/index.cfm',
      type: LinkPreviewType.Photo,
      title: 'the-title',
      description: 'the description',
    };

    const wrapper = subject({ preview });

    expect(wrapper.find(Embed).props()).toEqual(preview);
  });
});
