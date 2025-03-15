import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { usePanelState } from './hooks';
import { reducer, initialState as panelsInitialState } from './index';
import { Panel } from './constants';

const createWrapper = (initialPanelsState = panelsInitialState) => {
  const store = configureStore({
    reducer: { panels: reducer },
    preloadedState: { panels: initialPanelsState },
  });

  return ({ children }) => <Provider store={store}>{children}</Provider>;
};

describe('usePanelState', () => {
  const panelId = Panel.MEMBERS;

  it('should return initial state and functions', () => {
    const { result } = renderHook(() => usePanelState(panelId), {
      wrapper: createWrapper(),
    });

    expect(result.current.isOpen).toBe(false);
    expect(typeof result.current.toggle).toBe('function');
    expect(typeof result.current.open).toBe('function');
    expect(typeof result.current.close).toBe('function');
    expect(typeof result.current.setIsOpen).toBe('function');
  });

  it('should respect preloaded state', () => {
    const { result } = renderHook(() => usePanelState(panelId), {
      wrapper: createWrapper({
        openStates: {
          [Panel.FEED_CHAT]: false,
          [Panel.MEMBERS]: true,
        },
      }),
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should toggle panel state', () => {
    const { result } = renderHook(() => usePanelState(panelId), {
      wrapper: createWrapper(),
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should open and close panel', () => {
    const { result } = renderHook(() => usePanelState(panelId), {
      wrapper: createWrapper(),
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should set panel state explicitly', () => {
    const { result } = renderHook(() => usePanelState(panelId), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });
});
