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
