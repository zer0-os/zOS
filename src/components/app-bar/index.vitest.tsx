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

  describe('active app', () => {
    it('should make conversation icon active when active app is conversation', () => {
      renderComponent({ activeApp: 'conversation' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Messenger', isActive: true }));
    });

    it('should not make conversation icon active when active app is anything else', () => {
      renderComponent({ activeApp: 'foo' });
      expect(mockWorldPanelItem).toHaveBeenCalledWith(expect.objectContaining({ label: 'Messenger', isActive: false }));
    });
  });

  describe('unhover functionality', () => {
    it('should add no-hover class when AppLink is clicked', () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);

      expect(panel.classList.contains('no-hover')).toBe(true);
    });

    it('should remove no-hover class when mouse leaves container', () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);
      expect(panel.classList.contains('no-hover')).toBe(true);

      fireEvent.mouseLeave(panel);
      expect(panel.classList.contains('no-hover')).toBe(false);
    });

    it('should keep no-hover class when mouse moves within container after click', () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);
      expect(panel.classList.contains('no-hover')).toBe(true);

      fireEvent.mouseMove(panel);
      expect(panel.classList.contains('no-hover')).toBe(true);
    });

    it('should allow hover again after mouse leaves and re-enters', () => {
      const { getByText, getByTestId } = renderComponent({});

      const link = getByText('Home');
      const panel = getByTestId('legacy-panel');

      fireEvent.click(link);

      fireEvent.mouseLeave(panel);
      expect(panel.classList.contains('no-hover')).toBe(false);

      fireEvent.mouseEnter(panel);
      expect(panel.classList.contains('no-hover')).toBe(false);
    });
  });
});
