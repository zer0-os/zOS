import { vi, Mock } from 'vitest';

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';

import { watchAccount } from '@wagmi/core';

import { Container, Properties } from './connect';
import { ConnectionStatus } from '..';

vi.mock('@wagmi/core', () => ({
  watchAccount: vi.fn(),
}));

const defaultProps: Properties = {
  setAddress: vi.fn(),
  setChain: vi.fn(),
  setConnectionStatus: vi.fn(),
};

const render = (props: Partial<Properties>) => {
  return renderWithProviders(<Container {...defaultProps} {...props} />, {});
};

describe(Container, () => {
  it('should render children', () => {
    render({ children: 'foobar' });

    expect(screen.getByText('foobar')).toBeTruthy();
  });

  describe('watch account', () => {
    let mockWatchAccount;

    beforeEach(() => {
      mockWatchAccount = vi.fn();
      (watchAccount as unknown as Mock).mockImplementation((_config, { onChange }) => {
        mockWatchAccount.mockImplementation((account) => onChange(account));
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should call watchAccount on mount', () => {
      render({});
      expect(watchAccount).toHaveBeenCalled();
    });

    it('should call setChain with account.chainId', () => {
      render({});
      const account = { chainId: 1, isConnected: true };
      mockWatchAccount(account);
      expect(defaultProps.setChain).toHaveBeenCalledWith(1);
      expect(defaultProps.setChain).toHaveBeenCalledTimes(1);
    });

    it('should call setConnectionStatus with Disconnected if account is not connected', () => {
      render({});
      const account = { chainId: 1, isConnected: false };
      mockWatchAccount(account);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.Disconnected);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledTimes(1);
    });

    it('should call setConnectionStatus with Connected if account is connected', () => {
      render({});
      const account = { chainId: 1, isConnected: true };
      mockWatchAccount(account);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.Connected);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledTimes(1);
    });
  });
});
