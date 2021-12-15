import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';

import { FeedItem, Properties } from './feed-item';

describe('FeedItem', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      znsRoute: '',
      ...props,
    };

    return shallow(<FeedItem {...allProps} />);
  };

  test('renders image', () => {
    const wrapper = subject({
      imageUrl: 'http://example.com/theimage.jpg',
    });

    expect(wrapper.find('.feed-item__image').prop('src')).toStrictEqual('http://example.com/theimage.jpg');
  });

  it('adds title as alt text to image', () => {
    const wrapper = subject({
      title: 'what',
      imageUrl: 'http://example.com/theimage.jpg',
    });

    expect(wrapper.find('.feed-item__image').prop('alt')).toStrictEqual('what');
  });

  it('does not render image if not provided', () => {
    const wrapper = subject({
      imageUrl: null,
    });

    expect(wrapper.find('.feed-item__image').exists()).toBe(false);
  });

  test('renders title', () => {
    const title = 'The First Item';

    const wrapper = subject({
      id: 'the-first-id',
      title,
      description: 'This is the description of the first item.',
    });

    expect(wrapper.find('.feed-item__title').text().trim()).toStrictEqual(title);
  });

  test('renders description', () => {
    const description = 'This is the description of the first item.';

    const wrapper = subject({
      id: 'the-first-id',
      title: 'The First Item',
      description,
    });

    expect(wrapper.find('.feed-item__description').text().trim()).toStrictEqual(description);
  });

  test('renders title as link to route', () => {
    const wrapper = subject({
      id: 'the-first-id',
      znsRoute: 'the.route.yo',
    });

    const link = wrapper.find('.feed-item__title').closest(Link);

    expect(link.prop('to')).toStrictEqual('the.route.yo');
  });
});
