import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from './app-router';
import { vi } from 'vitest';
import { renderWithProviders } from '../test-utils';

beforeEach(() => {
  vi.resetModules();
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

const renderComponent = (route: string | undefined = '/') => {
  renderWithProviders(
    <MemoryRouter initialEntries={[route]}>
      <AppRouter />
    </MemoryRouter>
  );
};

describe(AppRouter, () => {
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
