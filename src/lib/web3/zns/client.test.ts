import { ZnsClient } from './client';

describe('ZnsClient', () => {
  const subject = (overrides = {}) => {
    const provider = {
      getAllDomains: () => [],
      ...overrides,
    };

    return new ZnsClient(provider);
  }

  it('returns domains as feed items', async () => {
    const getAllDomains = async () => [
      { id: 'first-id', name: 'the.first.domain.name' },
      { id: 'second-id', name: 'the.second.domain.name' },
      { id: 'third-id', name: 'the.third.domain.name' },
    ];

    const client = subject({ getAllDomains });

    const feedItems = [{
      id: 'first-id',
      title: 'the.first.domain.name',
      description: 'the.first.domain.name',
    }, {
      id: 'second-id',
      title: 'the.second.domain.name',
      description: 'the.second.domain.name',
    }, {
      id: 'third-id',
      title: 'the.third.domain.name',
      description: 'the.third.domain.name',
    }];

    expect(await client.getFeed()).toStrictEqual(feedItems);
  });
});
