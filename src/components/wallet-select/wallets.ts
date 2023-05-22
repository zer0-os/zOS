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
    imageSource: 'walletconnect.svg',
  },
  [WalletType.Coinbase]: {
    type: WalletType.Coinbase,
    name: 'Coinbase Wallet',
    imageSource: 'coinbasewallet.svg',
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
    'https://res.cloudinary.com/fact0ry-dev/image/upload/v1637005920/zero-assets/wallet-providers',
    wallets[wallet].imageSource,
  ].join('/');
}

export { wallets };
