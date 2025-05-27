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

    it('should show follow button when not own profile', () => {
      expect(screen.getByRole('button')).toHaveTextContent('Follow');
    });

    it('should call onClickFollow when follow button is clicked', () => {
      fireEvent.click(screen.getByRole('button'));
      expect(mockOnClickFollow).toHaveBeenCalled();
    });

    it('should call onClickAvatar when avatar is clicked', () => {
      fireEvent.click(screen.getByTestId('profile-avatar'));
      expect(mockOnClickAvatar).toHaveBeenCalled();
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
      });

      renderComponent();
    });

    it('should not show follow button', () => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
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
      });

      renderComponent();
    });

    it('should show unfollow button', () => {
      expect(screen.getByRole('button')).toHaveTextContent('Unfollow');
    });
  });
});
