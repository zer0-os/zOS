import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollPosition } from './useScrollPosition';

// Mock window.scrollTo with a proper implementation
vi.spyOn(window, 'scrollTo').mockImplementation((x, y) => {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true });
});

vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
  cb(0);
  return 0;
});

describe('useScrollPosition', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    vi.clearAllMocks();
  });

  it('should store scroll position when postId is provided', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

    const { result } = renderHook(() => useScrollPosition('post-123'));

    expect(result.current.getScrollPosition()).toBe(100);
    expect(result.current.getClickedPostId()).toBe('post-123');
  });

  it('should restore scroll position when postId becomes undefined', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

    const { rerender } = renderHook(({ postId }) => useScrollPosition(postId), {
      initialProps: { postId: 'post-123' },
    });

    const mockElement = document.createElement('div');
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 50,
      bottom: 150,
    });
    mockElement.scrollIntoView = vi.fn();
    vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);

    rerender({ postId: undefined });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 100);
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'center',
    });
  });

  it('should handle case when post element is not found', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

    const { rerender } = renderHook(({ postId }) => useScrollPosition(postId), {
      initialProps: { postId: 'post-123' },
    });

    vi.spyOn(document, 'querySelector').mockReturnValue(null);

    rerender({ postId: undefined });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 100);
  });

  it('should not restore scroll position if no postId was previously stored', () => {
    const { rerender } = renderHook(({ postId }) => useScrollPosition(postId), {
      initialProps: { postId: undefined },
    });

    rerender({ postId: 'post-123' });

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
