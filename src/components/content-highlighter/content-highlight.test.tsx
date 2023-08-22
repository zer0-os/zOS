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
    });
    expect(wrapper.find('.content-highlighter__user-mention').text()).toEqual('John Doe');
  });

  it('renders content with a different variant', () => {
    const wrapper = render({
      message: 'Hello, @[John Doe](user:123)!',
      variant: 'negative',
    });
    expect(wrapper.find('.content-highlighter__user-mention').prop('data-variant')).toEqual('negative');
  });
});
