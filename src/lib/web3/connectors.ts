import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { Chains, Connectors } from '.';

import { config } from '../../config';

const chainId = Number(config.supportedChainId);

export const get = (connectorType: Connectors) => {
  switch (connectorType) {
    case Connectors.Metamask:
      return new InjectedConnector({
        supportedChainIds: [
          chainId,
          Chains.MainNet,
          Chains.Kovan,
          Chains.Rinkeby,
          Chains.Ropsten,
          Chains.Goerli,
          Chains.Sepolia,
        ],
      });
    case Connectors.Coinbase:
      return new WalletLinkConnector({
        url: config.INFURA_URL,
        appName: 'zOS',
      });
    default:
      return new NetworkConnector({
        urls: { [chainId]: config.INFURA_URL },
      });
  }
};
