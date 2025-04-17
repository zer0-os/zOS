import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePostRoute } from './usePostRoute';
import { useHistory, useRouteMatch } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useHistory: vi.fn(),
  useRouteMatch: vi.fn(),
}));

describe('usePostRoute', () => {
  const mockPush = vi.fn();
  const mockUseHistory = useHistory as unknown as ReturnType<typeof vi.fn>;
  const mockUseRouteMatch = useRouteMatch as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHistory.mockReturnValue({ push: mockPush });
  });

  it('should navigate to conversation post when in conversation context', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { conversationId: 'conv123' },
      path: '/conversation/conv123',
    });

    const { result } = renderHook(() => usePostRoute('post123'));
    result.current.navigateToPost();

    expect(mockPush).toHaveBeenCalledWith('/conversation/conv123/post123');
  });

  it('should navigate to home post when in home context', () => {
    mockUseRouteMatch.mockReturnValue({
      params: {},
      path: '/home',
    });

    const { result } = renderHook(() => usePostRoute('post123'));
    result.current.navigateToPost();

    expect(mockPush).toHaveBeenCalledWith('/home/post123');
  });

  it('should navigate to profile post when in profile context', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123' },
      path: '/profile/user123',
    });

    const { result } = renderHook(() => usePostRoute('post123'));
    result.current.navigateToPost();

    expect(mockPush).toHaveBeenCalledWith('/profile/user123/post123');
  });

  it('should use channelZid over routeZid in profile context', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123' },
      path: '/profile/user123',
    });

    const { result } = renderHook(() => usePostRoute('post123', 'channel123'));
    result.current.navigateToPost();

    expect(mockPush).toHaveBeenCalledWith('/profile/channel123/post123');
  });

  it('should navigate to feed post when in feed context', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'channel123' },
      path: '/feed/channel123',
    });

    const { result } = renderHook(() => usePostRoute('post123'));
    result.current.navigateToPost();

    expect(mockPush).toHaveBeenCalledWith('/feed/channel123/post123');
  });

  it('should use channelZid over routeZid in feed context', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123' },
      path: '/feed/user123',
    });

    const { result } = renderHook(() => usePostRoute('post123', 'channel123'));
    result.current.navigateToPost();

    expect(mockPush).toHaveBeenCalledWith('/feed/channel123/post123');
  });
});
