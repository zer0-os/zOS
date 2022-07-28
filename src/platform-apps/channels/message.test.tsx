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
});
