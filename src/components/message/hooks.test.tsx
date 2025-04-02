/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react-hooks';
import { useContextMenu } from './hooks/useContextMenu';

describe('useContextMenu', () => {
  it('should not trigger menu when text is selected', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useContextMenu({ onOpen }));

    // Mock window.getSelection to return selected text
    const mockSelection = {
      toString: () => 'selected text',
    };
    Object.defineProperty(window, 'getSelection', {
      value: () => mockSelection,
    });

    const event = {
      button: 2,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      pageX: 100,
      pageY: 200,
    };

    result.current.handler(event as any);

    expect(onOpen).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it('should trigger menu on right click with no text selected', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useContextMenu({ onOpen }));

    // Mock window.getSelection to return no selected text
    const mockSelection = {
      toString: () => '',
    };
    Object.defineProperty(window, 'getSelection', {
      value: () => mockSelection,
    });

    const event = {
      button: 2,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      pageX: 100,
      pageY: 200,
    };

    result.current.handler(event as any);

    expect(onOpen).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(result.current.position).toEqual({ x: 100, y: 200 });
  });

  it('should not trigger menu on left click', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useContextMenu({ onOpen }));

    // Mock window.getSelection to return no selected text
    const mockSelection = {
      toString: () => '',
    };
    Object.defineProperty(window, 'getSelection', {
      value: () => mockSelection,
    });

    const event = {
      button: 0, // Left click
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      pageX: 100,
      pageY: 200,
    };

    result.current.handler(event as any);

    expect(onOpen).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });
});
