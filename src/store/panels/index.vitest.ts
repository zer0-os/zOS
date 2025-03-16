import { describe, it, expect } from 'vitest';
import { reducer, initialState, togglePanel, setPanelState, openPanel, closePanel } from './index';
import { Panel } from './constants';

describe('panels reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('default panel values', () => {
    it('should default FEED_CHAT to true', () => {
      expect(initialState.openStates[Panel.FEED_CHAT]).toBe(true);
    });

    it('should default MEMBERS to false', () => {
      expect(initialState.openStates[Panel.MEMBERS]).toBe(false);
    });
  });

  it('should handle togglePanel', () => {
    const panel = Panel.MEMBERS;

    let state = reducer(initialState, togglePanel(panel));
    expect(state.openStates[panel]).toBe(true);

    state = reducer(state, togglePanel(panel));
    expect(state.openStates[panel]).toBe(false);

    state = reducer(state, togglePanel(panel));
    expect(state.openStates[panel]).toBe(true);
  });

  it('should handle setPanelState', () => {
    const panel = Panel.MEMBERS;

    let state = reducer(initialState, setPanelState({ panel, isOpen: true }));
    expect(state.openStates[panel]).toBe(true);

    state = reducer(state, setPanelState({ panel, isOpen: false }));
    expect(state.openStates[panel]).toBe(false);

    state = reducer(state, setPanelState({ panel, isOpen: true }));
    expect(state.openStates[panel]).toBe(true);
  });

  it('should handle openPanel', () => {
    const panel = Panel.MEMBERS;

    let state = reducer(initialState, openPanel(panel));
    expect(state.openStates[panel]).toBe(true);

    state = reducer(state, openPanel(panel));
    expect(state.openStates[panel]).toBe(true);

    state = reducer(state, closePanel(panel));
    state = reducer(state, openPanel(panel));
    expect(state.openStates[panel]).toBe(true);
  });

  it('should handle closePanel', () => {
    const panel = Panel.FEED_CHAT;

    let state = reducer(initialState, closePanel(panel));
    expect(state.openStates[panel]).toBe(false);

    state = reducer(state, closePanel(panel));
    expect(state.openStates[panel]).toBe(false);

    state = reducer(state, openPanel(panel));
    state = reducer(state, closePanel(panel));
    expect(state.openStates[panel]).toBe(false);
  });

  it('should handle multiple panels independently', () => {
    const panel1 = Panel.FEED_CHAT;
    const panel2 = Panel.MEMBERS;

    let state = initialState;

    state = reducer(state, closePanel(panel1));
    expect(state.openStates[panel1]).toBe(false);
    expect(state.openStates[panel2]).toBe(false);

    state = reducer(state, openPanel(panel2));
    expect(state.openStates[panel1]).toBe(false);
    expect(state.openStates[panel2]).toBe(true);

    state = reducer(state, openPanel(panel1));
    expect(state.openStates[panel1]).toBe(true);
    expect(state.openStates[panel2]).toBe(true);

    state = reducer(state, togglePanel(panel2));
    expect(state.openStates[panel1]).toBe(true);
    expect(state.openStates[panel2]).toBe(false);
  });
});
