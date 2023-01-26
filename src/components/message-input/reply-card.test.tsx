import React from 'react';

import { shallow } from 'enzyme';
import Dropzone from 'react-dropzone';

import ReplyCard, { Properties } from './reply-card';

describe('ReplyCardReplyCard', () => {
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

    expect(wrapper.find('.reply-card__message').text().trim()).toStrictEqual(message);
  });

  it('call onRemove when close icon iss clicked', function () {
    const onRemove = jest.fn();

    const wrapper = subject({ onRemove });
    wrapper.find('.reply-card__icon-close').simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
