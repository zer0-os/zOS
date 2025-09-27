import { vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppBar, Properties } from '.';
import { renderWithProviders } from '../../test-utils';

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
  IconCoins1: () => <div data-testid='icon-coins' />,
  IconCoinsStacked2: () => <div data-testid='icon-coins-stacked' />,
  IconWallet: () => <div data-testid='icon-wallet' />,
  IconTrophy1: () => <div data-testid='icon-trophy' />,
  IconAura: () => <div data-testid='icon-aura' />,
  IconCoinsSwap1: () => <div data-testid='icon-coins-swap' />,
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

const DEFAULT_PROPS: Properties = {
  activeApp: undefined,
  hasUnreadNotifications: false,
  hasUnreadHighlights: false,
  lastActiveMessengerConversationId: undefined,
  zAppIsFullscreen: false,
  hasActiveWallet: false,
};

const renderComponent = (props: Partial<Properties>) => {
  return renderWithProviders(
    <MemoryRouter>
      <AppBar {...{ ...DEFAULT_PROPS, ...props }} />
    </MemoryRouter>
  );
};

describe(AppBar, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorldPanelItem.mockClear();
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

    it('should set the Leaderboard icon as active when activeApp is "leaderboard"', () => {
      renderComponent({ activeApp: 'leaderboard' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Leaderboard', isActive: true })
      );
    });

    it('should not set the Leaderboard icon as active when activeApp is something else', () => {
      renderComponent({ activeApp: 'foo' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Leaderboard', isActive: false })
      );
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

  describe('Logo Navigation', () => {
    it('should navigate to home when clicking the logo', () => {
      const { getByTestId } = renderComponent({});
      const logoLink = getByTestId('icon-logo-zero').closest('a');

      expect(logoLink).toHaveAttribute('to', '/home');
    });
  });

  describe('Leaderboard Navigation', () => {
    it('should render the leaderboard icon', () => {
      const { getByText } = renderComponent({});
      const leaderboardElement = getByText('Leaderboard');

      expect(leaderboardElement).toBeInTheDocument();
    });

    it('should navigate to leaderboard when clicking the leaderboard icon', () => {
      const { getByText } = renderComponent({});
      const leaderboardElement = getByText('Leaderboard').closest('a');

      expect(leaderboardElement).toHaveAttribute('to', '/leaderboard');
    });
  });
});
