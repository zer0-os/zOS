import { config } from '../../config';

export enum WalletType {
  Metamask = 'metamask',
  WalletConnect = 'wallet-connect',
  Coinbase = 'coinbase',
  Fortmatic = 'fortmatic',
  Portis = 'portis',
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
  [WalletType.WalletConnect]: {
    type: WalletType.WalletConnect,
    name: 'Wallet Connect',
    imageSource: 'wallet-connect.svg',
  },
  [WalletType.Coinbase]: {
    type: WalletType.Coinbase,
    name: 'Coinbase Wallet',
    imageSource: 'coinbase-wallet.svg',
  },
  [WalletType.Fortmatic]: {
    type: WalletType.Fortmatic,
    name: 'Fortmatic',
    imageSource: 'fortmatic.svg',
  },
  [WalletType.Portis]: {
    type: WalletType.Portis,
    name: 'Portis',
    imageSource: 'portis.svg',
  },
};

for (const wallet in wallets) {
  wallets[wallet].imageSource = [
    config.assetsPath,
    wallets[wallet].imageSource,
  ].join('/');
}

export { wallets };
