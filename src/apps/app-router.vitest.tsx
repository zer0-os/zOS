import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from './app-router';
import { vi } from 'vitest';
import { renderWithProviders } from '../test-utils';

vi.mock('../messenger-main', () => ({
  MessengerMain: () => {
    return 'MessengerMain';
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
    expect(screen.getByText('MessengerMain')).toBeTruthy();
  });

  it('should render MessengerMain component when route is /conversation/:conversationId', () => {
    renderComponent('/conversation/123');
    expect(screen.getByText('MessengerMain')).toBeTruthy();
  });

  it('should redirect to / when route is invalid', () => {
    renderComponent('/foo-bar');
    expect(screen.getByText('MessengerMain')).toBeTruthy();
  });
});
