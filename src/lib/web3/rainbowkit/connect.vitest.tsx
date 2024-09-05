import { vi, Mock } from 'vitest';

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';

import { watchAccount } from '@wagmi/core';

import { Container, Properties } from './connect';
import { ConnectionStatus } from '..';
import { config } from '../../../config';

vi.mock('@wagmi/core', () => ({
  watchAccount: vi.fn(),
}));

const defaultProps: Properties = {
  address: '',

  setAddress: vi.fn(),
  setChain: vi.fn(),
  setConnectionStatus: vi.fn(),
  updateConnector: vi.fn(),
};

const chainId = config.supportedChainId;

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
      const account = { chainId, isConnected: true };
      mockWatchAccount(account);
      expect(defaultProps.setChain).toHaveBeenCalledWith(chainId);
      expect(defaultProps.setChain).toHaveBeenCalledTimes(1);
    });

    it('should call setConnectionStatus with Disconnected if account is not connected', () => {
      render({});
      const account = { chainId, isConnected: false };
      mockWatchAccount(account);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.Disconnected);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledTimes(1);
    });

    it('should call setConnectionStatus with Connected if account is connected', () => {
      render({});
      const account = { chainId, isConnected: true };
      mockWatchAccount(account);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.Connected);
      expect(defaultProps.setConnectionStatus).toHaveBeenCalledTimes(1);
    });

    it('should call setAddress with account.address if address is empty', () => {
      render({ address: undefined });
      const account = { chainId, isConnected: true, address: '0x123' };
      mockWatchAccount(account);
      expect(defaultProps.setAddress).toHaveBeenCalledWith('0x123');
      expect(defaultProps.setAddress).toHaveBeenCalledTimes(1);
    });

    it('should call setAddress with account.address if account is changed', () => {
      render({ address: '0x456' });
      const account = { chainId, isConnected: true, address: '0x123' };
      mockWatchAccount(account);
      expect(defaultProps.setAddress).toHaveBeenCalledWith('0x123');
      expect(defaultProps.setAddress).toHaveBeenCalledTimes(1);
    });
  });
});
