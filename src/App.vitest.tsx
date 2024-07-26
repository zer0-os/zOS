import { vi } from 'vitest';
import { App } from './App';
import { renderWithProviders } from './test-utils';
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

vi.mock('./apps/app-router', () => ({
  AppRouter: () => {
    return <div data-testid='app-router' />;
  },
}));

vi.mock('@zero-tech/zui/ZUIProvider', () => ({
  ZUIProvider: (props: PropsWithChildren) => {
    return <div data-testid='zui-provider' {...props} />;
  },
}));

const renderComponent = () => {
  return renderWithProviders(<App />);
};

describe(App, () => {
  it('should wrap app with ZUIProvider', () => {
    const { container } = renderComponent();

    const zuiProvider = screen.getByTestId('zui-provider');

    expect(zuiProvider).toBeTruthy();
    expect(zuiProvider).toBe(container.firstChild);
    expect(container.childNodes).toHaveLength(1);
  });

  it('should render AppRouter', () => {
    renderComponent();

    expect(screen.getByTestId('app-router')).toBeTruthy();
  });
});
