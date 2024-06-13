import React from 'react';

import { shallow } from 'enzyme';

import ReplyCard, { Properties } from './reply-card';
import { ContentHighlighter } from '../content-highlighter';
import { IconButton } from '@zero-tech/zui/components';

import { bem } from '../../lib/bem';

const c = bem('.reply-card');

describe('ReplyCard', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: '',
      senderIsCurrentUser: false,
      senderFirstName: '',
      senderLastName: '',
      mediaName: '',
      mediaUrl: '',
      onRemove: jest.fn(),
      ...props,
    };

    return shallow(<ReplyCard {...allProps} />);
  };

  it('renders reply message', function () {
    const wrapper = subject({ message: 'hello' });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'hello');
  });

  it('does not render reply message if no message is present', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(ContentHighlighter);
  });

  it('renders media when media url is present', function () {
    const wrapper = subject({ mediaName: 'test-media-name', mediaUrl: 'test-media-url' });

    expect(wrapper).toHaveElement(c('media-container'));
  });

  it('does not render media when media url is NOT present', function () {
    const wrapper = subject({ message: 'hello' });

    expect(wrapper).not.toHaveElement(c('media-container'));
  });

  it('renders the sender name when senderIsCurrentUser is false', function () {
    const wrapper = subject({ senderIsCurrentUser: false, senderFirstName: 'Jackie', senderLastName: 'Chan' });

    expect(wrapper.find(c('header'))).toHaveText('Jackie Chan');
  });

  it('renders "You" if the sender is the current user', function () {
    const wrapper = subject({ senderIsCurrentUser: true, senderFirstName: 'Jackie', senderLastName: 'Chan' });

    expect(wrapper.find(c('header'))).toHaveText('You');
  });

  it('call onRemove when close icon is clicked', function () {
    const onRemove = jest.fn();

    const wrapper = subject({ onRemove });
    wrapper.find(IconButton).simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
