import { vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ProfileCard } from '.';
import * as useProfileCardModule from './lib/useProfileCard';
import { renderWithProviders } from '../../test-utils';

// Mock the useProfileCard hook
vi.mock('./lib/useProfileCard', () => ({
  useProfileCard: vi.fn(),
}));

const renderComponent = () => {
  return renderWithProviders(<ProfileCard userId='123' />);
};

describe('ProfileCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when profile successfully loaded with all data', () => {
    const mockOnClickAvatar = vi.fn();
    const mockOnClickFollow = vi.fn();
    const mockOnClickChat = vi.fn();

    beforeEach(() => {
      vi.mocked(useProfileCardModule.useProfileCard).mockReturnValue({
        isLoading: false,
        handle: 'mock-handle',
        subhandle: 'mock-subhandle',
        followerCount: '100',
        followingCount: '100',
        isFollowing: false,
        isOwnProfile: false,
        onClickAvatar: mockOnClickAvatar,
        onClickFollow: mockOnClickFollow,
        onClickChat: mockOnClickChat,
        isLoadingFollowing: false,
        isMutating: false,
      });

      renderComponent();
    });

    it('should render handle', () => {
      expect(screen.getByText('mock-handle')).toBeInTheDocument();
    });

    it('should render subhandle', () => {
      expect(screen.getByText('mock-subhandle')).toBeInTheDocument();
    });

    it('should render follower count', () => {
      expect(screen.getByTestId('follower-count')).toHaveTextContent('100 Followers');
    });

    it('should render following count', () => {
      expect(screen.getByTestId('following-count')).toHaveTextContent('100 Following');
    });

    it('should be able to click Follow button', () => {
      const followButton = screen.getByLabelText('Follow user');
      fireEvent.click(followButton);
      expect(mockOnClickFollow).toHaveBeenCalled();
    });

    it('should call onClickAvatar when avatar is clicked', () => {
      fireEvent.click(screen.getByTestId('profile-avatar'));
      expect(mockOnClickAvatar).toHaveBeenCalled();
    });

    it('should be able to click Chat button', () => {
      const chatButton = screen.getByLabelText('Open conversation with user');
      fireEvent.click(chatButton);
      expect(mockOnClickChat).toHaveBeenCalled();
    });
  });

  describe('when viewing own profile', () => {
    beforeEach(() => {
      vi.mocked(useProfileCardModule.useProfileCard).mockReturnValue({
        isLoading: false,
        handle: 'mock-handle',
        subhandle: 'mock-subhandle',
        followerCount: '100',
        followingCount: '100',
        isFollowing: false,
        isOwnProfile: true,
        onClickAvatar: vi.fn(),
        onClickFollow: vi.fn(),
        onClickChat: vi.fn(),
        isLoadingFollowing: false,
        isMutating: false,
      });

      renderComponent();
    });

    it('should not show follow/unfollow button', () => {
      expect(screen.queryByLabelText('Follow user')).toBeNull();
      expect(screen.queryByLabelText('Unfollow user')).toBeNull();
    });
  });

  describe('when following a profile', () => {
    beforeEach(() => {
      vi.mocked(useProfileCardModule.useProfileCard).mockReturnValue({
        isLoading: false,
        handle: 'mock-handle',
        subhandle: 'mock-subhandle',
        followerCount: '100',
        followingCount: '100',
        isFollowing: true,
        isOwnProfile: false,
        onClickAvatar: vi.fn(),
        onClickFollow: vi.fn(),
        onClickChat: vi.fn(),
        isLoadingFollowing: false,
        isMutating: false,
      });

      renderComponent();
    });

    it('should show unfollow button', () => {
      expect(screen.getByLabelText('Unfollow user')).toBeInTheDocument();
    });
  });
});
