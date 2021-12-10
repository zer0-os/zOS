import { createInstance } from '@zero-tech/zns-sdk';
import { getForProvider } from './config';

export class ZnsClient {
  constructor(private provider: any) { }

  async getFeed() {
    return [{
      id: 'the-first-id',
      title: 'The First ZNS Feed Item',
      description: 'This is the description of the first item.',
    }, {
      id: 'the-second-id',
      title: 'The Second ZNS Feed Item',
      description: 'This is the description of the Second item.',
    }, {
      id: 'the-third-id',
      title: 'The Third ZNS Feed Item',
      description: 'This is the description of the Third item.',
    }, {
      id: 'the-fourth-id',
      title: 'The Fourth ZNS Feed Item',
      description: 'This is the description of the Fourth item.',
    }];
  }
}

export const client = {
  async get(web3Provider: any) {
    const config = await getForProvider(web3Provider);

    return new ZnsClient(createInstance(config));
  },
};
