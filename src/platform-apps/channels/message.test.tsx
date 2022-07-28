import React from 'react';

import { shallow } from 'enzyme';

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

  it('renders header date', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__date-header-date').exists()).toBe(true);
  });

  it('renders message icon', () => {
    const wrapper = subject({ message: 'the message' });

    expect(wrapper.find('.message__block-icon').exists()).toBe(true);
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
});
