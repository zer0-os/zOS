import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter, HIDE_SIDEKICK_PATHS } from './app-router';
import { vi } from 'vitest';
import { renderWithProviders } from '../test-utils';

beforeEach(() => {
  vi.resetModules();
  vi.mock('../components/sidekick/components/current-user-details', () => ({
    CurrentUserDetails: () => <div data-testid='current-user-details' />,
  }));
  vi.mock('../components/sidekick/components/container', () => ({
    Container: () => <div data-testid='sidekick-container' />,
  }));
  vi.mock('../lib/feature-flags', () => ({
    featureFlags: { enableNotificationsApp: true, enableFeedApp: true },
  }));
});

vi.mock('./messenger', () => ({
  MessengerApp: () => {
    return <div data-testid='messenger-app' />;
  },
}));

vi.mock('./notifications', () => ({
  NotificationsApp: () => {
    return <div data-testid='notifications-app' />;
  },
}));

vi.mock('./feed', () => ({
  FeedApp: () => {
    return <div data-testid='feed-app' />;
  },
}));

vi.mock('./profile', () => ({
  ProfileApp: () => {
    return <div data-testid='profile-app' />;
  },
}));

vi.mock('./home', () => ({
  HomeApp: () => {
    return <div data-testid='home-app' />;
  },
}));

const renderComponent = (route: string | undefined = '/') => {
  renderWithProviders(
    <MemoryRouter initialEntries={[route]}>
      <AppRouter />
    </MemoryRouter>
  );
};

describe(AppRouter, () => {
  it('should have correct paths in HIDE_SIDEKICK_PATHS', () => {
    expect(HIDE_SIDEKICK_PATHS).toEqual([
      '/home',
      '/profile',
      '/staking',
      '/wallet',
    ]);
  });

  it('should render MessengerMain component when route is /', () => {
    renderComponent('/');
    expect(screen.getByTestId('messenger-app')).toBeTruthy();
  });

  it('should render MessengerMain component when route is /conversation/:conversationId', () => {
    renderComponent('/conversation/123');
    expect(screen.getByTestId('messenger-app')).toBeTruthy();
  });

  it('should redirect to / when route is invalid', () => {
    renderComponent('/foo-bar');
    expect(screen.getByTestId('messenger-app')).toBeTruthy();
  });

  it('should render NotificationsApp component when route is /notifications', () => {
    renderComponent('/notifications');
    expect(screen.getByTestId('notifications-app')).toBeTruthy();
  });

  it('should render FeedApp component when route is /feed', () => {
    renderComponent('/feed');
    expect(screen.getByTestId('feed-app')).toBeTruthy();
  });
});
