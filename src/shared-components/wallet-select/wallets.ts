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
}

export const wallets: { [walletType: string]: Wallet } = {
  [WalletType.Metamask]: {
    type: WalletType.Metamask,
    name: 'Metamask',
  },
	[WalletType.WalletConnect]: {
		type: WalletType.WalletConnect,
		name: 'Wallet Connect',
	},
	[WalletType.Coinbase]: {
		type: WalletType.Coinbase,
		name: 'Coinbase Wallet',
	},
	[WalletType.Fortmatic]: {
		type: WalletType.Fortmatic,
		name: 'Fortmatic',
	},
	[WalletType.Portis]: {
		type: WalletType.Portis,
		name: 'Portis',
	},
};
