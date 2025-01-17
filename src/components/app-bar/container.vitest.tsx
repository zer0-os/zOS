import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AppBar } from './container';

const mockAppBar = vi.fn();

vi.mock('./', () => ({
  AppBar: (props: any) => {
    mockAppBar(props);
    return <div data-testid='app-bar' />;
  },
}));

const renderComponent = (route: string | undefined = '/') => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <AppBar hasUnreadNotifications={false} hasUnreadHighlights={false} />
    </MemoryRouter>
  );
};

describe(AppBar, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass app route to AppBar', () => {
    renderComponent('/foo');
    expect(mockAppBar).toHaveBeenCalledWith(expect.objectContaining({ activeApp: 'foo' }));
  });

  it('should not pass internal app route to AppBar', () => {
    renderComponent('/foo/bar/baz');
    expect(mockAppBar).toHaveBeenCalledWith(expect.objectContaining({ activeApp: 'foo' }));
  });

  it('should pass undefined if route match is undefined', () => {
    renderComponent();
    expect(mockAppBar).toHaveBeenCalledWith(expect.objectContaining({ activeApp: '' }));
  });
});
