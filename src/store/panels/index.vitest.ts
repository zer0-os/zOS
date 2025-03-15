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

    // Toggle from false to true
    let state = reducer(initialState, togglePanel(panel));
    expect(state.openStates[panel]).toBe(true);

    // Toggle from true to false
    state = reducer(state, togglePanel(panel));
    expect(state.openStates[panel]).toBe(false);

    // Toggle from false to true
    state = reducer(state, togglePanel(panel));
    expect(state.openStates[panel]).toBe(true);
  });

  it('should handle setPanelState', () => {
    const panel = Panel.MEMBERS;

    // Set to true
    let state = reducer(initialState, setPanelState({ panel, isOpen: true }));
    expect(state.openStates[panel]).toBe(true);

    // Set to false
    state = reducer(state, setPanelState({ panel, isOpen: false }));
    expect(state.openStates[panel]).toBe(false);

    // Set back to true
    state = reducer(state, setPanelState({ panel, isOpen: true }));
    expect(state.openStates[panel]).toBe(true);
  });

  it('should handle openPanel', () => {
    const panel = Panel.MEMBERS;

    // Open from initial state (false)
    let state = reducer(initialState, openPanel(panel));
    expect(state.openStates[panel]).toBe(true);

    // Open when already open
    state = reducer(state, openPanel(panel));
    expect(state.openStates[panel]).toBe(true);

    // Open after closing
    state = reducer(state, closePanel(panel));
    state = reducer(state, openPanel(panel));
    expect(state.openStates[panel]).toBe(true);
  });

  it('should handle closePanel', () => {
    const panel = Panel.FEED_CHAT;

    // Close from initial state (true)
    let state = reducer(initialState, closePanel(panel));
    expect(state.openStates[panel]).toBe(false);

    // Close when already closed
    state = reducer(state, closePanel(panel));
    expect(state.openStates[panel]).toBe(false);

    // Close after opening
    state = reducer(state, openPanel(panel));
    state = reducer(state, closePanel(panel));
    expect(state.openStates[panel]).toBe(false);
  });

  it('should handle multiple panels independently', () => {
    const panel1 = Panel.FEED_CHAT;
    const panel2 = Panel.MEMBERS;

    let state = initialState;

    // Close panel 1 (initially true)
    state = reducer(state, closePanel(panel1));
    expect(state.openStates[panel1]).toBe(false);
    expect(state.openStates[panel2]).toBe(false);

    // Open panel 2
    state = reducer(state, openPanel(panel2));
    expect(state.openStates[panel1]).toBe(false);
    expect(state.openStates[panel2]).toBe(true);

    // Open panel 1
    state = reducer(state, openPanel(panel1));
    expect(state.openStates[panel1]).toBe(true);
    expect(state.openStates[panel2]).toBe(true);

    // Toggle panel 2
    state = reducer(state, togglePanel(panel2));
    expect(state.openStates[panel1]).toBe(true);
    expect(state.openStates[panel2]).toBe(false);
  });
});
