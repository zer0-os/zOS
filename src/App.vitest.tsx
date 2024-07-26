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

vi.mock('./components/app-bar', () => ({
  AppBar: () => {
    return <div data-testid='app-bar' />;
  },
}));

vi.mock('./components/dialog-manager/container', () => ({
  DialogManager: () => {
    return <div data-testid='dialog-manager' />;
  },
}));

describe(App, () => {
  it('should wrap app with ZUIProvider', () => {
    const { container } = renderWithProviders(<App />);

    const zuiProvider = screen.getByTestId('zui-provider');

    expect(zuiProvider).toBeTruthy();
    expect(zuiProvider).toBe(container.firstChild);
    expect(container.childNodes).toHaveLength(1);
  });

  it('should render main element with default class names', () => {
    const { container } = renderWithProviders(<App />);

    const main = container.querySelector('div.main');

    expect(main).toBeTruthy();
    expect(main.classList).toContain('messenger-full-screen');
  });

  describe('when user is not authenticated', () => {
    var container: HTMLElement;

    beforeEach(() => {
      container = renderWithProviders(<App />, {
        preloadedState: {
          // @ts-ignore
          authentication: {
            user: null,
          },
        },
      }).container;
    });

    it('should not add sidekick-panel-open class to main div', () => {
      expect(container.querySelector('div.main')?.classList).not.toContain('sidekick-panel-open');
    });

    it('should not add background class to main div', () => {
      expect(container.querySelector('div.main')?.classList).not.toContain('background');
    });

    it('should render AppBar', () => {
      renderWithProviders(<App />);

      const appBar = screen.queryByTestId('app-bar');
      expect(appBar).not.toBeTruthy();
    });

    it('should not render DialogManager', () => {
      renderWithProviders(<App />);

      const dialogManager = screen.queryByTestId('dialog-manager');
      expect(dialogManager).not.toBeTruthy();
    });

    it('should not render AppRouter', () => {
      renderWithProviders(<App />);

      expect(screen.queryByTestId('app-router')).not.toBeTruthy();
    });
  });

  describe('when user is authenticated', () => {
    var container: HTMLElement;

    beforeEach(() => {
      container = renderWithProviders(<App />, {
        preloadedState: {
          // @ts-ignore
          authentication: {
            user: {
              // @ts-ignore
              data: {},
            },
          },
        },
      }).container;
    });

    it('should add sidekick-panel-open class to main div', () => {
      expect(container.querySelector('div.main')?.classList).toContain('sidekick-panel-open');
    });

    it('should add background class to main div', () => {
      expect(container.querySelector('div.main')?.classList).toContain('background');
    });

    it('should render AppBar', () => {
      renderWithProviders(<App />);

      const appBar = screen.getByTestId('app-bar');
      expect(appBar).toBeTruthy();
    });

    it('should render DialogManager', () => {
      renderWithProviders(<App />);

      const dialogManager = screen.getByTestId('dialog-manager');
      expect(dialogManager).toBeTruthy();
    });

    it('should render AppRouter', () => {
      renderWithProviders(<App />);

      expect(screen.getByTestId('app-router')).toBeTruthy();
    });
  });
});
