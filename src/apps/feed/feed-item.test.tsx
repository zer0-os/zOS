import React from 'react';
import { shallow } from 'enzyme';

import { FeedItem, Properties } from './feed-item';

describe('FeedItem', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      id: '',
      title: '',
      description: '',
      ...props,
    };

    return shallow(<FeedItem {...allProps} />);
  };

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
});
