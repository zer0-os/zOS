import { vi } from 'vitest';
import { App } from './App';
import { renderWithProviders } from './test-utils';
import { screen } from '@testing-library/react';

vi.mock('./apps/app-router', () => ({
  AppRouter: () => {
    return <div data-testid='app-router' />;
  },
}));

const renderComponent = () => {
  renderWithProviders(<App />);
};

describe(App, () => {
  it('should render AppRouter', () => {
    renderComponent();

    expect(screen.getByTestId('app-router')).toBeTruthy();
  });
});
