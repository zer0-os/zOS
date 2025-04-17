import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouteMatch } from 'react-router-dom';
import { ProfileApp } from './';

vi.mock('react-router-dom', () => ({
  useRouteMatch: vi.fn(),
}));

vi.mock('./panels/UserPanel', () => ({
  UserPanel: () => <div data-testid='user-panel' />,
}));

vi.mock('./panels/Switcher', () => ({
  Switcher: () => <div data-testid='switcher' />,
}));

vi.mock('../feed/components/post-view-container', () => ({
  PostView: ({ postId }: { postId: string }) => <div data-testid='post-view'>{postId}</div>,
}));

describe('ProfileApp', () => {
  const mockUseRouteMatch = useRouteMatch as unknown as ReturnType<typeof vi.fn>;

  it('should render Switcher and UserPanel when not viewing a post', () => {
    mockUseRouteMatch.mockReturnValue({
      params: { zid: 'user123' },
      path: '/profile/user123',
    });

    render(<ProfileApp />);

    expect(screen.getByTestId('switcher')).toBeInTheDocument();
    expect(screen.getByTestId('user-panel')).toBeInTheDocument();
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
  });
});
