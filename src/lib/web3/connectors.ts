import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { NetworkConnector } from '@web3-react/network-connector';

import { Chains } from './index';
import { config } from '../../config';

export const injected = new InjectedConnector({
  supportedChainIds: [Chains.Kovan],
});

export const walletConnect = new WalletConnectConnector({
  infuraId: config.infuraId,
  supportedChainIds: [Chains.Kovan],
});

export const walletLink = new WalletLinkConnector({
  url: config.INFURA_URL,
  appName: 'zOS',
});

export const fortmatic = new FortmaticConnector({
  chainId: Chains.Kovan,
  apiKey: config.fortmaticApiKey,
});

export const portis = new PortisConnector({
  dAppId: config.portisDAppId,
  networks: [Chains.Kovan],
});

export const network = new NetworkConnector({
  urls: { [Chains.Kovan]: config.INFURA_URL },
});
