import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { ProfileApp } from './';
import { useReturnFromProfileNavigation } from '../feed/lib/useReturnFromProfileNavigation';

vi.mock('react-router-dom', () => ({
  useRouteMatch: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock('../feed/lib/useReturnFromProfileNavigation', () => ({
  useReturnFromProfileNavigation: vi.fn(),
  RETURN_POST_ID_KEY: 'returnPostId',
  RETURN_PATH_KEY: 'returnPath',
}));

vi.mock('./panels/UserPanel', () => ({
  UserPanel: () => <div data-testid='user-panel' />,
}));

vi.mock('./panels/Switcher', () => ({
  Switcher: () => <div data-testid='switcher' />,
}));

vi.mock('./panels/AchievementsPanel', () => ({
  AchievementsPanel: () => <div data-testid='achievements-panel' />,
}));

vi.mock('../feed/components/post-view-container', () => ({
  PostView: ({ postId }: { postId: string }) => <div data-testid='post-view'>{postId}</div>,
}));

describe('ProfileApp', () => {
  const mockUseRouteMatch = useRouteMatch as unknown as ReturnType<typeof vi.fn>;
  const mockUseLocation = useLocation as unknown as ReturnType<typeof vi.fn>;
  const mockUseReturnFromProfileNavigation = useReturnFromProfileNavigation as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      search: '',
    });
    mockUseReturnFromProfileNavigation.mockReturnValue({
      storeReturnFromProfileData: vi.fn(),
    });
  });

  it('should render Switcher, UserPanel, and AchievementsPanel when not viewing a post', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123' },
      path: '/profile/user123',
    });

    render(<ProfileApp />);

    expect(screen.getByTestId('switcher')).toBeInTheDocument();
    expect(screen.getByTestId('user-panel')).toBeInTheDocument();
    expect(screen.getByTestId('achievements-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('post-view')).not.toBeInTheDocument();
  });

  it('should render PostView when viewing a post', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123', postId: 'post123' },
      path: '/profile/user123/post123',
    });

    render(<ProfileApp />);

    expect(screen.getByTestId('post-view')).toBeInTheDocument();
    expect(screen.getByTestId('post-view')).toHaveTextContent('post123');
    expect(screen.queryByTestId('switcher')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('achievements-panel')).not.toBeInTheDocument();
  });

  it('should store return data when returnPostId and returnPath are present', () => {
    const mockStoreReturnFromProfileData = vi.fn();
    mockUseReturnFromProfileNavigation.mockReturnValue({
      storeReturnFromProfileData: mockStoreReturnFromProfileData,
    });

    mockUseLocation.mockReturnValue({
      search: '?returnPostId=post123&returnPath=/feed/channel123',
    });

    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123' },
      path: '/profile/user123',
    });

    render(<ProfileApp />);

    expect(mockStoreReturnFromProfileData).toHaveBeenCalledWith('post123', '/feed/channel123');
  });

  it('should not store return data when returnPostId or returnPath is missing', () => {
    const mockStoreReturnFromProfileData = vi.fn();
    mockUseReturnFromProfileNavigation.mockReturnValue({
      storeReturnFromProfileData: mockStoreReturnFromProfileData,
    });

    mockUseLocation.mockReturnValue({
      search: '?returnPostId=post123', // Missing returnPath
    });

    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123' },
      path: '/profile/user123',
    });

    render(<ProfileApp />);

    expect(mockStoreReturnFromProfileData).not.toHaveBeenCalled();
  });
});
