import { reducer, update, LayoutState } from '.';

describe('layout reducer', () => {
  const initialExistingState: LayoutState = {
    value: {
      isContextPanelOpen: false,
      hasContextPanel: false,
    },
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      value: {
        isContextPanelOpen: false,
        hasContextPanel: false,
      },
    });
  });

  it('should update isContextPanelOpen', () => {
    const actual = reducer(initialExistingState, update({ isContextPanelOpen: true }));

    expect(actual.value).toMatchObject({
      isContextPanelOpen: true,
      hasContextPanel: false,
    });
  });

  it('should update hasContextPanel', () => {
    const actual = reducer(initialExistingState, update({ hasContextPanel: true }));

    expect(actual.value).toMatchObject({
      isContextPanelOpen: false,
      hasContextPanel: true,
    });
  });
});
