import { reducer, setViewMode, ThemeState } from '.';

import { ViewModes } from '../../shared-components/theme-engine';

describe('theme reducer', () => {
  const initialExistingState: ThemeState = {
    value: { viewMode: ViewModes.Light },
  };

  it('should default to dark mode', () => {
    const { viewMode } = reducer(undefined, { type: 'unknown' }).value;

    expect(viewMode).toBe(ViewModes.Dark);
  });

  it('should replace existing state', () => {
    const actual = reducer(initialExistingState, setViewMode(ViewModes.Dark));

    expect(actual.value).toMatchObject({ viewMode: ViewModes.Dark });
  });
});
