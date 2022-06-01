import {
  reducer,
  receive,
  setOverlay,
  setOverlayOpen,
  AppsState,
} from '.';

import { apps, Apps } from '../../lib/apps';


describe('apps reducer', () => {
  const initialExistingState: AppsState = {
    selectedApp: apps[Apps.Members],
    hasOverlay: false,
    isOverlayOpen: false,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      selectedApp: apps[Apps.Feed],
      hasOverlay: false,
      isOverlayOpen: false,
    });
  });

  it('should replace existing state with new app', () => {
    const actual = reducer(initialExistingState, receive(apps[Apps.Channels]));

    expect(actual.selectedApp).toEqual(apps[Apps.Channels]);
  });

  it('should replace existing state with new status', () => {
    const actual = reducer(initialExistingState, setOverlay(true));

    expect(actual.hasOverlay).toEqual(true);
  });

  it('should replace existing state with new Overlay status', () => {
    const actual = reducer(initialExistingState, setOverlayOpen(true));

    expect(actual.isOverlayOpen).toEqual(true);
  });
});
