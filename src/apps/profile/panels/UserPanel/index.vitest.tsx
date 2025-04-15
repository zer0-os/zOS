import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils';
import { UserPanel } from './index';
import { useUserPanel } from './useUserPanel';

vi.mock('./useUserPanel', () => ({
  useUserPanel: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useRouteMatch: () => ({ params: { id: 'test-id' } }),
}));

vi.mock('../../../../components/matrix-avatar', () => ({
  MatrixAvatar: vi.fn(({ imageURL, size }) => (
    <div data-testid='mock-matrix-avatar' data-image-url={imageURL} data-size={size} />
  )),
}));

describe('UserPanel', () => {
  describe('when user has all profile data', () => {
    beforeEach(() => {
      vi.mocked(useUserPanel).mockReturnValue({
        handle: 'testuser',
        profileImageUrl: 'https://example.com/avatar.jpg',
        zid: '123456',
        isLoading: false,
      });

      renderWithProviders(<UserPanel />);
    });

    it('renders user handle', () => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('renders user ZID', () => {
      expect(screen.getByText('0://123456')).toBeInTheDocument();
    });

    it('passes correct props to MatrixAvatar', () => {
      const avatar = screen.getByTestId('mock-matrix-avatar');
      expect(avatar).toHaveAttribute('data-image-url', 'https://example.com/avatar.jpg');
      expect(avatar).toHaveAttribute('data-size', 'regular');
    });
  });

  it('does not render ZID if user does not have one', () => {
    vi.mocked(useUserPanel).mockReturnValue({
      handle: 'testuser',
      profileImageUrl: 'https://example.com/avatar.jpg',
      zid: undefined,
      isLoading: false,
    });

    renderWithProviders(<UserPanel />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.queryByText('0://')).not.toBeInTheDocument();
  });
});
