import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { Connectors } from '.';

import { config } from '../../config';

const chainId = Number(config.supportedChainId);

export const get = (connectorType: Connectors) => {
  switch (connectorType) {
    case Connectors.Metamask:
      return new InjectedConnector({
        supportedChainIds: [chainId],
      });
    case Connectors.WalletConnect:
      return new WalletConnectConnector({
        infuraId: config.infuraId,
        supportedChainIds: [chainId],
      });
    case Connectors.Coinbase:
      return new WalletLinkConnector({
        url: config.INFURA_URL,
        appName: 'zOS',
      });
    case Connectors.Fortmatic:
      return new FortmaticConnector({
        chainId: chainId,
        apiKey: config.fortmaticApiKey,
      });
    case Connectors.Portis:
      return new PortisConnector({
        dAppId: config.portisDAppId,
        networks: [chainId],
      });
    default:
      return new NetworkConnector({
        urls: { [chainId]: config.INFURA_URL },
      });
  }
};
