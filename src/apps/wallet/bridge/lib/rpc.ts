import { Contract, providers, utils } from 'ethers';
import { getRpcUrl } from './utils';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];

export async function getProvider(chainId: number): Promise<providers.JsonRpcProvider> {
  const url = getRpcUrl(chainId);
  if (!url) {
    throw new Error(`Missing RPC URL for chain ${chainId}`);
  }

  return new providers.JsonRpcProvider(url, { chainId, name: 'RPC' } as any);
}

export async function fetchERC20Balance(
  chainId: number,
  tokenAddress: string,
  walletAddress: string
): Promise<{ symbol: string; decimals: number; balance: string }> {
  const provider = await getProvider(chainId);
  const erc20 = new Contract(tokenAddress, ERC20_ABI, provider);

  const [symbol, decimals, rawBalance] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
    erc20.balanceOf(walletAddress),
  ]);

  const balance = utils.formatUnits(rawBalance, decimals);

  return { symbol, decimals, balance };
}

export async function fetchNativeBalance(chainId: number, walletAddress: string): Promise<string> {
  const provider = await getProvider(chainId);
  const raw = await provider.getBalance(walletAddress);
  return utils.formatEther(raw);
}

export async function fetchTokenMetadata(
  chainId: number,
  tokenAddress: string
): Promise<{ name: string; symbol: string; decimals: number }> {
  const provider = await getProvider(chainId);
  const erc20 = new Contract(tokenAddress, ERC20_ABI, provider);

  const [name, symbol, decimals] = await Promise.all([
    erc20.name(),
    erc20.symbol(),
    erc20.decimals(),
  ]);

  return { name, symbol, decimals };
}
