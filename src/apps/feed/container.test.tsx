import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { Feed } from '.';

describe('FeedContainer', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      items: [],
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  test('passes items to child', () => {
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

    expect(wrapper.find(Feed).prop('items')).toEqual(items);
  });
});
