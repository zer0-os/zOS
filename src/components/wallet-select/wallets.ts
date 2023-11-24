import metamaskIcon from './assets/metamask.svg';
import coinbaseIcon from './assets/coinbase-wallet.svg';
import fortmaticIcon from './assets/fortmatic.svg';
import portisIcon from './assets/portis.svg';
import walletConnectIcon from './assets/wallet-connect.svg';

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
    imageSource: metamaskIcon,
  },
  [WalletType.WalletConnect]: {
    type: WalletType.WalletConnect,
    name: 'Wallet Connect',
    imageSource: walletConnectIcon,
  },
  [WalletType.Coinbase]: {
    type: WalletType.Coinbase,
    name: 'Coinbase Wallet',
    imageSource: coinbaseIcon,
  },
  [WalletType.Fortmatic]: {
    type: WalletType.Fortmatic,
    name: 'Fortmatic',
    imageSource: fortmaticIcon,
  },
  [WalletType.Portis]: {
    type: WalletType.Portis,
    name: 'Portis',
    imageSource: portisIcon,
  },
};

export { wallets };
