import React from 'react';
import { shallow } from 'enzyme';

import { ContentHighlighter, Properties } from './';
import { textToPlainEmojis } from './text-to-emojis';

jest.mock('./text-to-emojis', () => ({
  textToPlainEmojis: jest.fn((text) => text),
}));

describe('ContentHighlighter', () => {
  const render = (props: Partial<Properties>) => {
    const defaultProps: Properties = {
      message: '',
      mentionedUserIds: [],
      ...props,
    };
    return shallow(<ContentHighlighter {...defaultProps} />);
  };

  it('renders without crashing', () => {
    render({});
  });

  it('renders content with plain emojis', () => {
    const message = 'Hello, world! :)';
    (textToPlainEmojis as jest.Mock).mockReturnValueOnce('Hello, world! 🙂');

    const wrapper = render({
      message,
    });

    expect(wrapper.text()).toContain('Hello, world! 🙂');
  });

  it('renders content with a user mention', () => {
    const wrapper = render({
      message: 'Hello, @[John Doe](user:123)!',
      mentionedUserIds: [{ id: '123', profileId: 'john_doe' }],
    });
    expect(wrapper.find('.content-highlighter__user-mention').text()).toEqual('John Doe');
  });

  it('renders content with a user mention without a profileId', () => {
    const wrapper = render({
      message: 'Hello, @[John Doe](user:123)!',
      mentionedUserIds: [{ id: '123' }],
    });
    expect(wrapper.find('.content-highlighter__user-mention').text()).toEqual('John Doe');
    expect(wrapper.find('.content-highlighter__user-mention').prop('id')).toBeUndefined();
  });

  it('renders content with a different variant', () => {
    const wrapper = render({
      message: 'Hello, @[John Doe](user:123)!',
      mentionedUserIds: [{ id: '123', profileId: 'john_doe' }],
      variant: 'negative',
    });
    expect(wrapper.find('.content-highlighter__user-mention').prop('data-variant')).toEqual('negative');
  });
});
