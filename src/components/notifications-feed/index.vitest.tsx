import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { NotificationsFeed } from '.';

const mockToggleGroup = vi.fn();

vi.mock('@zero-tech/zui/components/ToggleGroup', () => ({
  ToggleGroup: (props: any) => {
    mockToggleGroup(props);
    return <div data-testid='toggle-group-mock' />;
  },
}));

describe('NotificationsFeed', () => {
  it('should render header with correct title', () => {
    renderWithProviders(<NotificationsFeed />);
    const header = screen.getByText('Notifications');
    expect(header).toBeInTheDocument();
  });

  it('should render toggle group with correct tabs', () => {
    renderWithProviders(<NotificationsFeed />);
    expect(mockToggleGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { key: 'all', label: 'All' },
          { key: 'highlights', label: 'Highlights' },
          { key: 'muted', label: 'Muted' },
        ],
      })
    );
  });

  it('shows correct empty state message for All tab', () => {
    renderWithProviders(<NotificationsFeed />, {
      preloadedState: {
        // @ts-ignore
        chat: {
          isConversationsLoaded: true,
        },
      },
    });
    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });
});
