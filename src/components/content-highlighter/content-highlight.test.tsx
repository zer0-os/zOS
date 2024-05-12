import React from 'react';
import { shallow } from 'enzyme';
import { ContentHighlighter, Properties } from './';
import { textToPlainEmojis } from './text-to-emojis';
import { IconButton } from '@zero-tech/zui/components';

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
    const wrapper = render({ message: 'Default message' });
    expect(wrapper.isEmptyRender()).toBeFalsy();
  });

  it('renders content with plain emojis', () => {
    const message = 'Hello, world! :)';
    (textToPlainEmojis as jest.Mock).mockReturnValueOnce('Hello, world! 🙂');

    const wrapper = render({ message });
    expect(wrapper.text()).toContain('Hello, world! 🙂');
  });

  it('renders user mentions correctly', () => {
    const message = 'Hello, @[John Doe](user:123)!';
    const wrapper = render({ message });
    expect(wrapper.find('.content-highlighter__user-mention').text()).toEqual('John Doe');
    expect(wrapper.find('.content-highlighter__user-mention').exists()).toBeTruthy();
  });

  it('renders image with click handler', () => {
    const onImageReply = jest.fn();
    const message = 'Check this out! ![Image](img.jpg)';
    const wrapper = render({ message, onImageReply });

    wrapper.find('img').simulate('click');
    expect(onImageReply).toHaveBeenCalledWith('img.jpg');
  });

  it('renders content with links', () => {
    const message = 'Visit https://example.com for more info';
    const wrapper = render({ message });

    const link = wrapper.find('.text-message__link');
    expect(link.exists()).toBeTruthy();
    expect(link.prop('href')).toContain('https://example.com');
  });

  it('renders hidden message with action button', () => {
    const onHiddenMessageInfoClick = jest.fn();
    const wrapper = render({
      message: 'This message is hidden',
      isHidden: true,
      onHiddenMessageInfoClick,
    });

    expect(wrapper.find('.content-highlighter__hidden-message-text').text()).toEqual('This message is hidden');
    wrapper.find(IconButton).simulate('click');
    expect(onHiddenMessageInfoClick).toHaveBeenCalled();
  });

  it('renders a pure image without text', () => {
    const message = '![Pure Image](pure.jpg)';
    const wrapper = render({ message });
    expect(wrapper.find('img').prop('src')).toEqual('pure.jpg');
    expect(wrapper.find('img').exists()).toBeTruthy();
  });

  it('handles absence of text and image', () => {
    const wrapper = render({ message: '' });
    expect(wrapper.isEmptyRender()).toBeTruthy();
  });
});
