import React from 'react';

import { shallow } from 'enzyme';

import ReplyCard, { Properties } from './reply-card';
import { ContentHighlighter } from '../content-highlighter';

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
    const message = 'hello';
    const wrapper = subject({ message });

    expect(wrapper.find(ContentHighlighter).prop('message').trim()).toStrictEqual(message);
  });

  it('does not render reply message if no message is present', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(ContentHighlighter);
  });

  it('call onRemove when close icon is clicked', function () {
    const onRemove = jest.fn();

    const wrapper = subject({ onRemove });
    wrapper.find('IconButton').simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('renders the sender name', function () {
    const wrapper = subject({
      senderIsCurrentUser: false,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
    });

    expect(wrapper.find('.reply-card__header').text()).toEqual('Jackie Chan');
  });

  it('renders "You" if the sender is the current user', function () {
    const wrapper = subject({
      senderIsCurrentUser: true,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
    });

    expect(wrapper.find('.reply-card__header').text()).toEqual('You');
  });

  it('renders media when media url is present and NO message', function () {
    const wrapper = subject({
      senderIsCurrentUser: true,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
      mediaName: 'test-media-name',
      mediaUrl: 'test-media-url',
    });

    expect(wrapper).toHaveElement('.reply-card__media-container');
    expect(wrapper).not.toHaveElement(ContentHighlighter);
  });

  it('renders media and message when media url and message are present', function () {
    const wrapper = subject({
      senderIsCurrentUser: true,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
      mediaName: 'test-media-name',
      mediaUrl: 'test-media-url',
      message: 'hello',
    });

    expect(wrapper).toHaveElement('.reply-card__media-container');
    expect(wrapper).toHaveElement(ContentHighlighter);
  });

  it('does not render media when media url is NOT present', function () {
    const wrapper = subject({
      senderIsCurrentUser: true,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
      mediaName: '',
      mediaUrl: '',
      message: 'hello',
    });

    expect(wrapper).not.toHaveElement('.reply-card__media-container');
  });
});
