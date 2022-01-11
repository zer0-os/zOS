import {
  reducer,
  receive,
  FeedState,
} from './store';
import { Model as FeedItem } from '../../apps/feed/feed-item';

describe('feed reducer', () => {
  const initialExistingState: FeedState = {
    value: [{ id: 'what', title: 'the existing item' }] as FeedItem[],
    status: 'idle',
  };

  const initialEmptyState: FeedState = {
    value: null,
    status: 'idle',
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      value: [],
      status: 'idle',
    });
  });

  it('should handle receive with initial state', () => {
    const feedItems: FeedItem[] = [{ id: 'first-id', title: 'the item', description: 'the desription' }];

    const actual = reducer(initialEmptyState, receive(feedItems));

    expect(actual.value).toEqual(feedItems);
  });

  it('should replace existing state', () => {
    const feedItems: FeedItem[] = [{ id: 'first-id', title: 'the item', description: 'the desription' }];

    const actual = reducer(initialExistingState, receive(feedItems));

    expect(actual.value).toEqual(feedItems);
  });
});
