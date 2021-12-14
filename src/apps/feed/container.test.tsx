import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { Feed } from '.';
import { RootState } from '../../store';

describe('FeedContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      route: '',
      items: [],
      load: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  test('it loads feed for route on mount', () => {
    const load = jest.fn();

    subject({ load, route: 'pickles' });

    expect(load).toHaveBeenCalledWith('pickles');
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
    const subject = (state: RootState) => Container.mapState({
      feed: { value: [], ...(state.feed || {}) },
      zns: { value: { route: '' }, ...(state.zns || {}) },
    } as any);

    test('route', () => {
      const route = 'deep.fried.zucchini';

      const state = subject({ zns: { value: { route } } } as RootState);

      expect(state).toMatchObject({ route });
    });

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

      expect(state).toMatchObject({ items });
    });
  });
});
