import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppBar, Properties } from '.';

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
});
