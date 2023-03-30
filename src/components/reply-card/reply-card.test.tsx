import React from 'react';

import { shallow } from 'enzyme';

import ReplyCard, { Properties } from './reply-card';
import { ContentHighlighter } from '../content-highlighter';

describe('ReplyCard', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: '',
      onRemove: jest.fn(),
      ...props,
    };

    return shallow(<ReplyCard {...allProps} />);
  };

  it('renders reply message', function () {
    const message = 'hello';
    const wrapper = subject({ message });

    expect(wrapper.find(ContentHighlighter).prop('message').trim()).toStrictEqual(message);
  });

  it('call onRemove when close icon iss clicked', function () {
    const onRemove = jest.fn();

    const wrapper = subject({ onRemove });
    wrapper.find('.reply-card__icon-close').simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
