import { createInstance } from '@zero-tech/zns-sdk';
import { getForProvider } from './config';

export class ZnsClient {
  constructor(private provider: any) { }

  async getFeed() {
    const domains = await this.provider.getAllDomains();

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
