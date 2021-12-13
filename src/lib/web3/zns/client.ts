import { utils } from 'ethers';
import { createInstance } from '@zero-tech/zns-sdk';
import { getForProvider } from './config';
import { config as appConfig } from '../../../config';

interface ZnsClientConfig {
  rootDomainId: string;
}

export class ZnsClient {
  constructor(private provider: any, private config: ZnsClientConfig = appConfig) { }

  async getFeed(id = this.config.rootDomainId) {
    const domains = await this.provider.getSubdomainsById(id);

    return domains.map(this.mapDomainToFeedItem);
  }

  resolveIdFromName(domainName: string) {
    const rootId = this.config.rootDomainId;

    if (!domainName) return rootId;

    return domainName
      .split('.')
      .reduce((prev, curr) => this.hashPair(prev, utils.id(curr)), rootId);
  }

  private hashPair(first: string, second: string) {
    return utils.keccak256(
      utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32'],
        [utils.arrayify(first), utils.arrayify(second)],
      ),
    );
  }

  private mapDomainToFeedItem({ id, name }) {
    return {
      id,
      title: name,
      description: name,
    };
  }
}

export const client = {
  async get(web3Provider: any) {
    const config = await getForProvider(web3Provider);

    return new ZnsClient(createInstance(config));
  },
};
