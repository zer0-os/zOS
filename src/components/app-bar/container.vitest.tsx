import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AppBar } from './container';
import { renderWithProviders } from '../../test-utils';

const mockAppBar = vi.fn();

vi.mock('./', () => ({
  AppBar: (props: any) => {
    mockAppBar(props);
    return <div data-testid='app-bar' />;
  },
}));

const renderComponent = (route: string | undefined = '/') => {
  renderWithProviders(
    <MemoryRouter initialEntries={[route]}>
      <AppBar />
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
