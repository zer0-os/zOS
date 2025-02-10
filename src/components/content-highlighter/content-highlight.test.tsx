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

  it('renders content with a user mention (ZERO user ID)', () => {
    const wrapper = render({
      message: 'Hello, @[John Doe](user:123)!',
    });
    expect(wrapper.find('.content-highlighter__user-mention').text()).toEqual('John Doe');
  });

  it('renders content with a user mention (matrix user ID)', () => {
    const wrapper = render({
      message: 'Hello, @[John Doe](user:@123:zos.zer0.io)!',
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

  it('renders content with hidden message', () => {
    const onHiddenMessageInfoClick = jest.fn();
    const wrapper = render({
      message: 'Message hidden',
      isHidden: true,
      onHiddenMessageInfoClick,
    });

    expect(wrapper.find('.content-highlighter__hidden-message-text')).toHaveText('Message hidden');

    wrapper.find('IconButton').simulate('click');
    expect(onHiddenMessageInfoClick).toHaveBeenCalled();
  });
});
