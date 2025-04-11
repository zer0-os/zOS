import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as panelsReducer } from '../../store/panels';

import { AppBar, Properties } from '.';

vi.mock('react-router-dom', () => ({
  Link: ({ children, onClick, to, ...props }: any) => (
    <a onClick={onClick} to={to} {...props}>
      {children}
    </a>
  ),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./current-user', () => ({
  CurrentUser: () => <div data-testid='current-user' />,
}));

vi.mock('@zero-tech/zui/icons', () => ({
  IconBell: () => <div data-testid='icon-bell' />,
  IconFourDots: () => <div data-testid='icon-four-dots' />,
  IconHome: () => <div data-testid='icon-home' />,
  IconLogoZero: () => <div data-testid='icon-logo-zero' />,
  IconMessage01: () => <div data-testid='icon-message' />,
  IconSlantLines: () => <div data-testid='icon-slant-lines' />,
  IconWorld: () => <div data-testid='icon-world' />,
  IconUser: () => <div data-testid='icon-user' />,
}));

vi.mock('./more-apps-modal', () => ({
  MoreAppsModal: () => <div data-testid='more-apps-modal' />,
}));

const mockWorldPanelItem = vi.fn();

vi.mock('./world-panel-item', () => ({
  WorldPanelItem: (props: any) => {
    mockWorldPanelItem(props);
    return <div data-testid='world-panel-item' />;
  },
}));

const createStore = () => {
  return configureStore({
    reducer: {
      panels: panelsReducer,
    },
  });
};

const DEFAULT_PROPS: Properties = {
  activeApp: undefined,
  hasUnreadNotifications: false,
  hasUnreadHighlights: false,
  lastActiveMessengerConversationId: undefined,
  zAppIsFullscreen: false,
};

const renderComponent = (props: Partial<Properties>) => {
  const store = createStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AppBar {...{ ...DEFAULT_PROPS, ...props }} />
      </MemoryRouter>
    </Provider>
  );
};

describe(AppBar, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Active App State', () => {
    it('should set the Messenger icon as active when activeApp is "conversation"', () => {
      renderComponent({ activeApp: 'conversation' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Chat', isActive: true }));
    });

    it('should not set the Messenger icon as active when activeApp is something else', () => {
      renderComponent({ activeApp: 'foo' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Chat', isActive: false }));
    });

    it('should set the Profile icon as active when activeApp is "profile"', () => {
      renderComponent({ activeApp: 'profile' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Profile', isActive: true }));
    });

    it('should not set the Profile icon as active when activeApp is something else', () => {
      renderComponent({ activeApp: 'foo' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Profile', isActive: false }));
    });
  });

  describe('Unhover Functionality', () => {
    it('should add the no-hover class when an AppLink is clicked', () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);

      expect(panel.classList.contains('no-hover')).toBe(true);
    });

    it('should remove the no-hover class when the mouse leaves the container', async () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);
      expect(panel.classList.contains('no-hover')).toBe(true);

      // Wait for the requestAnimationFrame to execute
      await new Promise((resolve) => requestAnimationFrame(resolve));

      fireEvent.mouseLeave(panel);
      expect(panel.classList.contains('no-hover')).toBe(false);
    });

    it('should maintain the no-hover class when the mouse moves within the container after clicking', () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);
      expect(panel.classList.contains('no-hover')).toBe(true);

      fireEvent.mouseMove(panel);
      expect(panel.classList.contains('no-hover')).toBe(true);
    });

    it('should allow hovering again after the mouse leaves and re-enters the container', async () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);

      // Wait for the requestAnimationFrame to execute
      await new Promise((resolve) => requestAnimationFrame(resolve));

      fireEvent.mouseLeave(panel);
      expect(panel.classList.contains('no-hover')).toBe(false);

      fireEvent.mouseEnter(panel);
      expect(panel.classList.contains('no-hover')).toBe(false);
    });
  });
});
