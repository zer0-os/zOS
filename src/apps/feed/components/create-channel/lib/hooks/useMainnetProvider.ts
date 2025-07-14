import { useMemo } from 'react';
import { ethers } from 'ethers';
import { config } from '../../../../../../config';

export function useMainnetProvider() {
  return useMemo(() => new ethers.providers.JsonRpcProvider(config.INFURA_URLS[1]), []);
}
