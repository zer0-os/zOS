import React from 'react';

import { shallow } from 'enzyme';

import { Message } from './message';
import { Embed } from '../../components/link-preview/embed';
import { LinkPreviewType } from '../../lib/link-preview';

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

    const text = wrapper.find('.message__body').text().trim();

    expect(text).toStrictEqual('the message');
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
