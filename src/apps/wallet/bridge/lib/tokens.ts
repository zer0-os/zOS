import { ZERO_ADDRESS, CHAIN_ID_ETHEREUM, CHAIN_ID_ZCHAIN, CHAIN_ID_SEPOLIA, CHAIN_ID_ZEPHYR } from './utils';

export interface CuratedToken {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  isNative?: boolean;
}

export const CURATED_TOKENS: Partial<Record<number, CuratedToken[]>> = {
  [CHAIN_ID_ETHEREUM]: [
    {
      tokenAddress: ZERO_ADDRESS,
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18,
      isNative: true,
    },
    {
      tokenAddress: '0x2a3bFF78B79A009976EeA096a51A948a3dC00e34',
      symbol: 'WILD',
      name: 'Wilder',
      decimals: 18,
      logo: '/tokens/wild.png',
    },
    {
      tokenAddress: '0x0eC78ED49C2D27b315D462d43B5BAB94d2C79bf8',
      symbol: 'MEOW',
      name: 'MEOW',
      decimals: 18,
      logo: '/tokens/meow.png',
    },
  ],
  [CHAIN_ID_ZCHAIN]: [
    {
      tokenAddress: ZERO_ADDRESS,
      symbol: 'Z',
      name: 'Z',
      decimals: 18,
      isNative: true,
    },
    {
      tokenAddress: '0x376F41Bb278253457A0073e0ce93Ec457F09fc00',
      symbol: 'WILD',
      name: 'Wilder',
      decimals: 18,
      logo: '/tokens/wild.png',
    },
  ],
  [CHAIN_ID_SEPOLIA]: [
    {
      tokenAddress: ZERO_ADDRESS,
      symbol: 'SepoliaETH',
      name: 'SepoliaETH',
      decimals: 18,
      isNative: true,
    },
  ],
  [CHAIN_ID_ZEPHYR]: [
    {
      tokenAddress: ZERO_ADDRESS,
      symbol: 'Z',
      name: 'Z',
      decimals: 18,
      isNative: true,
    },
  ],
};
