import { config } from '../../config';
import { WalletClient } from 'viem';

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  NetworkNotSupported = 'NetworkNotSupported',
}

export enum Connectors {
  None = 'none',
  Infura = 'infura',
  Metamask = 'metamask',
  Coinbase = 'coinbase',
}

export enum Chains {
  MainNet = 1,
  Morden = 2,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  Sepolia = 11155111,
  Local = 5777,
}

export async function personalSignToken(walletClient: WalletClient, currentAddress: string): Promise<`0x${string}`> {
  return await walletClient.signMessage({
    // @ts-ignore
    account: currentAddress,
    message: config.web3AuthenticationMessage,
  });
}
