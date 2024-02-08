import Web3Utils from 'web3-utils';
import { config } from '../../config';

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

export async function personalSignToken(web3Provider, currentAddress): Promise<any> {
  const method = 'personal_sign';
  const from = Web3Utils.toHex(currentAddress.toLowerCase());
  const params = [
    config.web3AuthenticationMessage,
    from,
  ];

  return new Promise((resolve, reject) => {
    web3Provider.provider.sendAsync(
      {
        method,
        params,
        from,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response?.result);
      }
    );
  });
}
