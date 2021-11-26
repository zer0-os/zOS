import React from 'react';
import { shallow } from 'enzyme';
import { FeedItem } from './feed-item';
import { Feed, Properties } from '.';

describe('Feed', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      items: [],
      ...props,
    };

    return shallow(<Feed {...allProps} />);
  };

  test('renders a feed item for item', () => {
    const items = [{
      id: 'the-first-id',
      title: 'The First Item',
      description: 'This is the description of the first item.',
    }, {
      id: 'the-second-id',
      title: 'The Second Item',
      description: 'This is the description of the Second item.',
    }];

    const wrapper = subject({ items });

    expect(wrapper.find(FeedItem)).toHaveLength(2);
  });

  test('passes item props to FeedItem', () => {
    const items = [{
      id: 'the-first-id',
      title: 'The First Item',
      description: 'This is the description of the first item.',
    }, {
      id: 'the-second-id',
      title: 'The Second Item',
      description: 'This is the description of the Second item.',
    }];

    const wrapper = subject({ items });

    expect(wrapper.find(FeedItem).at(1).props()).toEqual(
      expect.objectContaining({
        id: 'the-second-id',
        title: 'The Second Item',
        description: 'This is the description of the Second item.',
      }),
    );
  });
});
