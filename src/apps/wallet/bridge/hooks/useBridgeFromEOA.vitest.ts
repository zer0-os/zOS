import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBridgeFromEOA } from './useBridgeFromEOA';
import { getEthersProviderFromWagmi } from '../lib/utils';

vi.mock('../lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../lib/utils')>('../lib/utils');
  return { ...actual, getEthersProviderFromWagmi: vi.fn() };
});

const params = {
  fromChainId: 1,
  toChainId: 9369,
  tokenAddress: '0x2a3bFF78B79A009976EeA096a51A948a3dC00e34',
  amount: '1',
  destinationAddress: '0x0000000000000000000000000000000000000002',
  decimals: 18,
  eoaAddress: '0x0000000000000000000000000000000000000001',
};

describe('useBridgeFromEOA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs the raw error before passing the normalized error to onError', async () => {
    const rawError = new Error('cannot estimate gas; transaction may fail or may require manual gas limit');
    vi.mocked(getEthersProviderFromWagmi).mockRejectedValue(rawError);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    const { result } = renderHook(() => useBridgeFromEOA({ onError }));

    await act(async () => {
      await expect(result.current.bridgeFromEOA(params)).rejects.toThrow(
        'Transaction failed. Please check your wallet and try again.'
      );
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to bridge from EOA:', rawError);
    expect(onError).toHaveBeenCalledWith(new Error('Transaction failed. Please check your wallet and try again.'));
    expect(result.current.isPending).toBe(false);
  });
});
