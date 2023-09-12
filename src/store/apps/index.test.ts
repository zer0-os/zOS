import { reducer, receive, AppsState } from '.';

import { apps, Apps } from '../../lib/apps';

describe('apps reducer', () => {
  const initialExistingState: AppsState = {
    selectedApp: null,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      selectedApp: apps[Apps.Channels],
    });
  });

  it('should replace existing state with new app', () => {
    const actual = reducer(initialExistingState, receive(apps[Apps.Channels]));

    expect(actual.selectedApp).toEqual(apps[Apps.Channels]);
  });
});
