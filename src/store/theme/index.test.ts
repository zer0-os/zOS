import {
  reducer,
  setViewMode,
  ThemeState,
} from '.';

import { ViewModes } from '../../shared-components/theme-engine';

describe('theme reducer', () => {
  const initialExistingState: ThemeState = {
    value: { viewMode: ViewModes.Dark },
  };

  it('should default to light mode', () => {
    const { viewMode } = reducer(undefined, { type: 'unknown' }).value;

    expect(viewMode).toBe(ViewModes.Light);
  });

  it('should replace existing state', () => {
    const actual = reducer(initialExistingState, setViewMode(ViewModes.Light));

    expect(actual.value).toMatchObject({ viewMode: ViewModes.Light });
  });
});
