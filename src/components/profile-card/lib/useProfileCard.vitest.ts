import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileCard } from './useProfileCard';
import { useProfile } from '../../../apps/profile/lib/useProfile';
import { useFollow } from '../../../apps/profile/lib/useFollow';
import { useOpenProfile } from '../../../apps/profile/lib/useOpenProfile';
import { useSelector, useDispatch } from 'react-redux';

vi.mock('../../../apps/profile/lib/useProfile', () => ({
  useProfile: vi.fn(),
}));

vi.mock('../../../apps/profile/lib/useFollow', () => ({
  useFollow: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('../../../apps/profile/lib/useOpenProfile', () => ({
  useOpenProfile: vi.fn(),
}));

describe('useProfileCard', () => {
  const mockUserId = 'test-user-id';
  const mockCurrentUserId = 'current-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    (useSelector as any).mockReturnValue({ id: mockCurrentUserId });
    (useDispatch as any).mockReturnValue(vi.fn());
    (useFollow as any).mockReturnValue({
      follow: vi.fn(),
      unfollow: vi.fn(),
      isFollowing: false,
    });
    (useOpenProfile as any).mockReturnValue({
      onOpenProfile: vi.fn(),
    });
  });

  it('should forward handle from useProfile', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { handle: 'Test User' },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));

    expect(result.current).toEqual(
      expect.objectContaining({
        handle: 'Test User',
      })
    );
  });

  it('should use primaryZid as subhandle when available', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { primaryZid: 'test-zid' },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));

    expect(result.current).toEqual(
      expect.objectContaining({
        subhandle: '0://test-zid',
      })
    );
  });

  it('should use publicAddress as subhandle when primaryZid is not available', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { publicAddress: '0x123' },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));

    expect(result.current).toEqual(
      expect.objectContaining({
        subhandle: '0x123',
      })
    );
  });

  it('should format follower count with millify', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { followersCount: 1000000 },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));

    expect(result.current).toEqual(
      expect.objectContaining({
        followerCount: '1M',
      })
    );
  });

  it('should format following count with millify', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { followingCount: 1500000 },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));

    expect(result.current).toEqual(
      expect.objectContaining({
        followingCount: '1.5M',
      })
    );
  });

  it('should correctly identify own profile', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { userId: mockCurrentUserId },
    });

    const { result } = renderHook(() => useProfileCard(mockCurrentUserId));

    expect(result.current.isOwnProfile).toBe(true);
  });

  it('should correctly identify other profiles', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { userId: 'other-user-id' },
    });

    const { result } = renderHook(() => useProfileCard('other-user-id'));

    expect(result.current.isOwnProfile).toBe(false);
  });

  it('should handle follow action', () => {
    const mockFollow = vi.fn();
    (useFollow as any).mockReturnValue({
      follow: mockFollow,
      unfollow: vi.fn(),
      isFollowing: false,
    });

    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { userId: 'other-user-id' },
    });

    const { result } = renderHook(() => useProfileCard('other-user-id'));
    result.current.onClickFollow();

    expect(mockFollow).toHaveBeenCalled();
  });

  it('should handle unfollow action', () => {
    const mockUnfollow = vi.fn();
    (useFollow as any).mockReturnValue({
      follow: vi.fn(),
      unfollow: mockUnfollow,
      isFollowing: true,
    });

    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { userId: 'other-user-id' },
    });

    const { result } = renderHook(() => useProfileCard('other-user-id'));
    result.current.onClickFollow();

    expect(mockUnfollow).toHaveBeenCalled();
  });

  it('should not trigger follow/unfollow when userId is not available', () => {
    const mockFollow = vi.fn();
    (useFollow as any).mockReturnValue({
      follow: mockFollow,
      unfollow: vi.fn(),
      isFollowing: false,
    });

    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { userId: undefined },
    });

    const { result } = renderHook(() => useProfileCard('other-user-id'));
    result.current.onClickFollow();

    expect(mockFollow).not.toHaveBeenCalled();
  });

  it('should handle avatar click with primaryZid', () => {
    const mockOnOpenProfile = vi.fn();
    (useOpenProfile as any).mockReturnValue({
      onOpenProfile: mockOnOpenProfile,
    });

    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { primaryZid: 'test-zid' },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));
    result.current.onClickAvatar();

    expect(mockOnOpenProfile).toHaveBeenCalledWith('test-zid');
  });

  it('should handle avatar click with publicAddress when primaryZid is not available', () => {
    const mockOnOpenProfile = vi.fn();
    (useOpenProfile as any).mockReturnValue({
      onOpenProfile: mockOnOpenProfile,
    });

    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { publicAddress: '0x123' },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));
    result.current.onClickAvatar();

    expect(mockOnOpenProfile).toHaveBeenCalledWith('0x123');
  });

  it('should forward profile image from useProfile', () => {
    (useProfile as any).mockReturnValue({
      isLoading: false,
      data: { profileImage: 'https://example.com/avatar.jpg' },
    });

    const { result } = renderHook(() => useProfileCard(mockUserId));

    expect(result.current).toEqual(
      expect.objectContaining({
        profileImage: 'https://example.com/avatar.jpg',
      })
    );
  });
});
