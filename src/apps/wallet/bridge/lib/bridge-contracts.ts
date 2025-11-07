import { CHAIN_ID_ETHEREUM, CHAIN_ID_SEPOLIA, CHAIN_ID_ZCHAIN, CHAIN_ID_ZEPHYR } from './constants';

export const BRIDGE_CONTRACTS: Record<number, `0x${string}`> = {
  // Ethereum mainnet uses the same bridge contract as Z-Chain (L2 contract on L1)
  [CHAIN_ID_ETHEREUM]: '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe',
  // Sepolia uses the same bridge contract as Zephyr (L2 contract on L1)
  [CHAIN_ID_SEPOLIA]: '0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582',
  [CHAIN_ID_ZCHAIN]: '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe',
  [CHAIN_ID_ZEPHYR]: '0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582',
};

export const BRIDGE_ABI = [
  {
    inputs: [
      { name: 'destinationNetwork', type: 'uint32' },
      { name: 'destinationAddress', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'forceUpdateGlobalExitRoot', type: 'bool' },
      { name: 'permitData', type: 'bytes' },
    ],
    name: 'bridgeAsset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const BRIDGE_NETWORK_IDS: Record<number, number> = {
  [CHAIN_ID_ETHEREUM]: 0,
  [CHAIN_ID_SEPOLIA]: 0,
  [CHAIN_ID_ZCHAIN]: 14,
  [CHAIN_ID_ZEPHYR]: 25,
};

export function getBridgeContractAddress(chainId: number): `0x${string}` | undefined {
  return BRIDGE_CONTRACTS[chainId];
}

export function getBridgeNetworkId(chainId: number): number | undefined {
  return BRIDGE_NETWORK_IDS[chainId];
}
