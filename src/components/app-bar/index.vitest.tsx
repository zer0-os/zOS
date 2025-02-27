import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppBar, Properties } from '.';

vi.mock('react-router-dom', () => ({
  Link: ({ children, onClick, ...props }: any) => (
    <a onClick={onClick} {...props}>
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
    let container: HTMLElement;

    it('should add no-hover class when AppLink is clicked', () => {
      const { getByText, container: renderedContainer } = renderComponent({});
      container = renderedContainer.querySelector('.app-bar__container') as HTMLElement;

      const link = getByText('Home');
      fireEvent.click(link);

      expect(container.classList.contains('no-hover')).toBe(true);
    });

    it('should remove no-hover class when mouse leaves container', () => {
      const { getByText, container: renderedContainer } = renderComponent({});
      container = renderedContainer.querySelector('.app-bar__container') as HTMLElement;

      const link = getByText('Home');
      fireEvent.click(link);

      expect(container.classList.contains('no-hover')).toBe(true);

      fireEvent.mouseLeave(container);

      expect(container.classList.contains('no-hover')).toBe(false);
    });

    it('should keep no-hover class when mouse moves within container after click', () => {
      const { getByText, container: renderedContainer } = renderComponent({});
      container = renderedContainer.querySelector('.app-bar__container') as HTMLElement;

      const link = getByText('Home');
      fireEvent.click(link);

      expect(container.classList.contains('no-hover')).toBe(true);

      fireEvent.mouseMove(container);

      expect(container.classList.contains('no-hover')).toBe(true);
    });

    it('should allow hover again after mouse leaves and re-enters', () => {
      const { getByText, container: renderedContainer } = renderComponent({});
      container = renderedContainer.querySelector('.app-bar__container') as HTMLElement;

      const link = getByText('Home');
      fireEvent.click(link);

      fireEvent.mouseLeave(container);

      expect(container.classList.contains('no-hover')).toBe(false);

      fireEvent.mouseEnter(container);

      expect(container.classList.contains('no-hover')).toBe(false);
    });
  });
});
