import { receive, reducer, ThemeState } from '.';

import { ViewModes } from '../../shared-components/theme-engine';

describe('theme reducer', () => {
  const initialExistingState: ThemeState = {
    value: { viewMode: ViewModes.Light },
  };

  it('should default to dark mode', () => {
    const { viewMode } = reducer(undefined, { type: 'unknown' }).value;

    expect(viewMode).toBe(ViewModes.Dark);
  });

  it('should replace existing state with new mode', () => {
    const actual = reducer(initialExistingState, receive(ViewModes.Dark));

    expect(actual.value).toMatchObject({ viewMode: ViewModes.Dark });
  });
});
