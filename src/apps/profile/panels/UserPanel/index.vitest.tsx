import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils';
import { UserPanel } from './index';
import { useUserPanel } from './useUserPanel';

vi.mock('./useUserPanel', () => ({
  useUserPanel: vi.fn(),
}));

vi.mock('../../../../components/profile-card/hover', () => ({
  ProfileCardHover: vi.fn(({ userId, children }) => (
    <div data-testid='mock-profile-card-hover' data-user-id={userId}>
      {children}
    </div>
  )),
}));

vi.mock('react-router-dom', () => ({
  useRouteMatch: () => ({ params: { id: 'test-id' } }),
}));

vi.mock('../../../../components/matrix-avatar', () => ({
  MatrixAvatar: vi.fn(({ imageURL, size }) => (
    <div data-testid='mock-matrix-avatar' data-image-url={imageURL} data-size={size} />
  )),
}));

vi.mock('../../../../components/follow-button', () => ({
  FollowButton: vi.fn(({ targetUserId, className }) => (
    <div data-testid='mock-follow-button' data-user-id={targetUserId} className={className}>
      Follow Button
    </div>
  )),
}));

vi.mock('../../../../components/follow-counts', () => ({
  FollowCounts: vi.fn(({ followingCount, followersCount, className }) => (
    <div data-testid='mock-follow-counts' className={className}>
      <span data-testid='following-count'>{followingCount}</span>
      <span data-testid='followers-count'>{followersCount}</span>
    </div>
  )),
}));

vi.mock('@zero-tech/zui/components', () => ({
  IconZeroProVerified: vi.fn(({ size }) => <div data-testid='mock-icon-zero-pro-verified' data-size={size} />),
}));

vi.mock('@zero-tech/zui/components', () => ({
  IconButton: vi.fn(({ onClick, Icon, 'data-testid': testId, ...props }) => (
    <button onClick={onClick} data-testid={testId} {...props}>
      <Icon />
    </button>
  )),
}));

describe('UserPanel', () => {
  describe('when user has all profile data', () => {
    const handleStartConversation = vi.fn();

    beforeEach(() => {
      vi.mocked(useUserPanel).mockReturnValue({
        handle: 'testuser',
        profileImageUrl: 'https://example.com/avatar.jpg',
        zid: '123456',
        isLoading: false,
        userId: 'test-user-id',
        isCurrentUser: false,
        followersCount: 100,
        followingCount: 50,
        handleStartConversation,
        isZeroProSubscriber: true,
      });

      renderWithProviders(<UserPanel />);
    });

    it('renders user handle', () => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('renders user ZID', () => {
      expect(screen.getByText('0://123456')).toBeInTheDocument();
    });

    it('passes correct props to MatrixAvatar', () => {
      const avatar = screen.getByTestId('mock-matrix-avatar');
      expect(avatar).toHaveAttribute('data-image-url', 'https://example.com/avatar.jpg');
      expect(avatar).toHaveAttribute('data-size', 'regular');
    });

    it('renders follow counts', () => {
      const followCounts = screen.getByTestId('mock-follow-counts');
      expect(followCounts).toBeInTheDocument();
      expect(screen.getByTestId('following-count')).toHaveTextContent('50');
      expect(screen.getByTestId('followers-count')).toHaveTextContent('100');
    });

    it('renders follow button for other users', () => {
      const followButton = screen.getByTestId('mock-follow-button');
      expect(followButton).toBeInTheDocument();
      expect(followButton).toHaveAttribute('data-user-id', 'test-user-id');
    });

    it('renders message button for other users', () => {
      const messageButton = screen.getByTestId('message-button');
      expect(messageButton).toBeInTheDocument();
    });

    it('calls handleStartConversation when message button is clicked', () => {
      const messageButton = screen.getByTestId('message-button');
      messageButton.click();
      expect(handleStartConversation).toHaveBeenCalledTimes(1);
    });
  });

  describe('when viewing own profile', () => {
    beforeEach(() => {
      vi.mocked(useUserPanel).mockReturnValue({
        handle: 'testuser',
        profileImageUrl: 'https://example.com/avatar.jpg',
        zid: '123456',
        isLoading: false,
        userId: 'test-user-id',
        isCurrentUser: true,
        followersCount: 100,
        followingCount: 50,
        handleStartConversation: vi.fn(),
        isZeroProSubscriber: true,
      });

      renderWithProviders(<UserPanel />);
    });

    it('does not render follow button', () => {
      expect(screen.queryByTestId('mock-follow-button')).not.toBeInTheDocument();
    });

    it('does not render message button', () => {
      expect(screen.queryByTestId('message-button')).not.toBeInTheDocument();
    });

    it('still renders follow counts', () => {
      const followCounts = screen.getByTestId('mock-follow-counts');
      expect(followCounts).toBeInTheDocument();
    });
  });

  describe('when loading', () => {
    beforeEach(() => {
      vi.mocked(useUserPanel).mockReturnValue({
        handle: 'testuser',
        profileImageUrl: 'https://example.com/avatar.jpg',
        zid: '123456',
        isLoading: true,
        userId: 'test-user-id',
        isCurrentUser: false,
        followersCount: 100,
        followingCount: 50,
        handleStartConversation: vi.fn(),
        isZeroProSubscriber: true,
      });

      renderWithProviders(<UserPanel />);
    });

    it('does not render follow button or counts while loading', () => {
      expect(screen.queryByTestId('mock-follow-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mock-follow-counts')).not.toBeInTheDocument();
    });

    it('does not render message button while loading', () => {
      expect(screen.queryByTestId('message-button')).not.toBeInTheDocument();
    });
  });

  it('does not render ZID if user does not have one', () => {
    vi.mocked(useUserPanel).mockReturnValue({
      handle: 'testuser',
      profileImageUrl: 'https://example.com/avatar.jpg',
      zid: undefined,
      isLoading: false,
      userId: 'test-user-id',
      isCurrentUser: false,
      followersCount: 100,
      followingCount: 50,
      handleStartConversation: vi.fn(),
      isZeroProSubscriber: true,
    });

    renderWithProviders(<UserPanel />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.queryByText('0://')).not.toBeInTheDocument();
  });
});
