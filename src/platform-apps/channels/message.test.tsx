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

    const textes = wrapper.find('.message__body').text().trim();

    expect(textes).toStrictEqual('the message');
  });
});
