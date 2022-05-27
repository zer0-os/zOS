import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { NetworkConnector } from '@web3-react/network-connector';

import { config } from '../../config';

const chainId = Number(config.supportedChainId);

export const injected = new InjectedConnector({
  supportedChainIds: [chainId],
});

export const walletConnect = new WalletConnectConnector({
  infuraId: config.infuraId,
  supportedChainIds: [chainId],
});

export const walletLink = new WalletLinkConnector({
  url: config.INFURA_URL,
  appName: 'zOS',
});

export const fortmatic = new FortmaticConnector({
  chainId: chainId,
  apiKey: config.fortmaticApiKey,
});

export const portis = new PortisConnector({
  dAppId: config.portisDAppId,
  networks: [chainId],
});

export const network = new NetworkConnector({
  urls: { [chainId]: config.INFURA_URL },
});