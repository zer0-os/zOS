import React from 'react';

import { shallow } from 'enzyme';

import { Message } from './message';

describe('message', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      message: '',
      ...props,
    };

    return shallow(<Message {...allProps} />);
  };

  it('renders message text', () => {
    const wrapper = subject({ message: 'the message' });

    const textes = wrapper.find('.message__block-body').text().trim();

    expect(textes).toStrictEqual('the message');
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
});
