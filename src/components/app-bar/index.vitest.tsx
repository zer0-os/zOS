import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppBar, Properties } from '.';

vi.mock('react-router-dom', () => ({
  Link: ({ children, onClick, to, ...props }: any) => (
    <a onClick={onClick} to={to} {...props}>
      {children}
    </a>
  ),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@zero-tech/zui/icons', () => ({
  IconHome: 'IconHome',
  IconSlashes: 'IconSlashes',
  IconDotsGrid: 'IconDotsGrid',
  IconGlobe3: 'IconGlobe3',
  IconMessageSquare2: 'IconMessageSquare2',
  IconList: 'IconList',
  IconBell1: 'IconBell1',
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
};

const renderComponent = (props: Partial<Properties>) => {
  return render(
    <MemoryRouter>
      <AppBar {...{ ...DEFAULT_PROPS, ...props }} />
    </MemoryRouter>
  );
};

describe(AppBar, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Active App State', () => {
    it('should set the Messenger icon as active when activeApp is "conversation"', () => {
      renderComponent({ activeApp: 'conversation' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Messenger', isActive: true }));
    });

    it('should not set the Messenger icon as active when activeApp is something else', () => {
      renderComponent({ activeApp: 'foo' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Messenger', isActive: false }));
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
