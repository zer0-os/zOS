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
  describe('by default', () => {
    var container: HTMLElement;

    beforeEach(() => {
      container = renderWithProviders(<App />).container;
    });

    it('should wrap app with ZUIProvider', () => {
      expect(screen.getByTestId('zui-provider')).toBe(container.firstChild);
      expect(container.childNodes).toHaveLength(1);
    });

    it('should render main element with default class names', () => {
      expect(container.querySelector('div.main').classList).toContain('messenger-full-screen');
    });
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
      expect(screen.queryByTestId('app-bar')).not.toBeTruthy();
    });

    it('should not render DialogManager', () => {
      expect(screen.queryByTestId('dialog-manager')).not.toBeTruthy();
    });

    it('should not render AppRouter', () => {
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
      expect(screen.getByTestId('app-bar')).toBeTruthy();
    });

    it('should render DialogManager', () => {
      expect(screen.getByTestId('dialog-manager')).toBeTruthy();
    });

    it('should render AppRouter', () => {
      expect(screen.getByTestId('app-router')).toBeTruthy();
    });
  });
});
