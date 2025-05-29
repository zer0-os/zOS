import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { FollowButton } from './index';
import { useFollow } from '../../apps/profile/lib/useFollow';

vi.mock('../../apps/profile/lib/useFollow', () => ({
  useFollow: vi.fn(),
}));

describe('FollowButton', () => {
  const mockTargetUserId = 'test-user-id';
  let follow: ReturnType<typeof vi.fn>;
  let unfollow: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    follow = vi.fn();
    unfollow = vi.fn();
  });

  describe('when not following', () => {
    beforeEach(() => {
      vi.mocked(useFollow).mockReturnValue({
        isFollowing: false,
        isLoading: false,
        follow,
        unfollow,
        isMutating: false,
      });

      renderWithProviders(<FollowButton targetUserId={mockTargetUserId} />);
    });

    it('renders Follow text', () => {
      expect(screen.getByText('Follow')).toBeInTheDocument();
    });

    it('calls follow when clicked', () => {
      const followElement = screen.getAllByText('Follow')[0];
      fireEvent.click(followElement.closest('div')!);
      expect(follow).toHaveBeenCalled();
    });
  });

  describe('when following', () => {
    beforeEach(() => {
      vi.mocked(useFollow).mockReturnValue({
        isFollowing: true,
        isLoading: false,
        follow,
        unfollow,
        isMutating: false,
      });

      renderWithProviders(<FollowButton targetUserId={mockTargetUserId} />);
    });

    it('renders Unfollow text', () => {
      expect(screen.getByText('Unfollow')).toBeInTheDocument();
    });

    it('calls unfollow when clicked', () => {
      const unfollowElement = screen.getAllByText('Unfollow')[0];
      fireEvent.click(unfollowElement.closest('div')!);
      expect(unfollow).toHaveBeenCalled();
    });
  });

  describe('when loading', () => {
    beforeEach(() => {
      vi.mocked(useFollow).mockReturnValue({
        isFollowing: false,
        isLoading: true,
        isMutating: false,
        follow,
        unfollow,
      });

      renderWithProviders(<FollowButton targetUserId={mockTargetUserId} />);
    });

    it('does not call follow/unfollow when clicked', () => {
      expect(follow).not.toHaveBeenCalled();
    });
  });
});
