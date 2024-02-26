import { config } from '../../config';

export enum WalletType {
  Metamask = 'metamask',
  Coinbase = 'coinbase',
}

export interface Wallet {
  type: WalletType;
  name: string;
  imageSource: string;
}

const wallets: { [walletType: string]: Wallet } = {
  [WalletType.Metamask]: {
    type: WalletType.Metamask,
    name: 'Metamask',
    imageSource: 'metamask.svg',
  },
  [WalletType.Coinbase]: {
    type: WalletType.Coinbase,
    name: 'Coinbase Wallet',
    imageSource: 'coinbase-wallet.svg',
  },
};

for (const wallet in wallets) {
  wallets[wallet].imageSource = [
    config.imageAssetsPath,
    wallets[wallet].imageSource,
  ].join('/');
}

export { wallets };
