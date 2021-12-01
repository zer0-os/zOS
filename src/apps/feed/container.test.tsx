import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { Feed } from '.';
import {RootState} from '../../app/store';

describe('FeedContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      items: [],
      load: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  test('it loads feed on mount', () => {
    const load = jest.fn();

    subject({ load });

    expect(load.mock.calls).toHaveLength(1);
  });

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

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);

    test('items', () => {
      const items = [{
        id: 'the-first-id',
        title: 'The First Item',
        description: 'This is the description of the first item.',
      }, {
        id: 'the-second-id',
        title: 'The Second Item',
        description: 'This is the description of the Second item.',
      }];

      const state = subject({ feed: { value: items } } as RootState);

      expect(state).toEqual({ items });
    });
  });
});
