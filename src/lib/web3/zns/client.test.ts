import { ZnsClient } from './client';

describe('ZnsClient', () => {
  const subject = (overrides = {}, config = { rootDomainId: '' }) => {
    const provider = {
      getSubdomainsById: () => [],
      ...overrides,
    };

    return new ZnsClient(provider, config);
  }

  it('calls getSubdomainsById for id', async () => {
    const id = '0x01';
    const getSubdomainsById = jest.fn(_ => []);
    const client = subject({ getSubdomainsById });

    await client.getFeed(id);

    expect(getSubdomainsById).toBeCalledWith(id)
  });

  it('calls getSubdomainsById for root id if no id provided', async () => {
    const rootDomainId = '0x03';
    const getSubdomainsById = jest.fn(_ => []);
    const client = subject({ getSubdomainsById }, { rootDomainId });

    await client.getFeed();

    expect(getSubdomainsById).toBeCalledWith(rootDomainId)
  });

  it('returns domains as feed items', async () => {
    const getSubdomainsById = async () => [
      { id: 'first-id', name: 'the.first.domain.name' },
      { id: 'second-id', name: 'the.second.domain.name' },
      { id: 'third-id', name: 'the.third.domain.name' },
    ];

    const client = subject({ getSubdomainsById });

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
