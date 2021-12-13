import { ZnsClient } from './client';

describe('ZnsClient', () => {
  const subject = (overrides = {}, config = {}) => {
    const allConfig = {
      rootDomainId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      ...config,
    };

    const provider = {
      getSubdomainsById: () => [],
      ...overrides,
    };

    return new ZnsClient(provider, allConfig);
  }

  it('resolves id for single root domain', () => {
    const client = subject();

    const expectedId = '0x5f594b54ed4a23525fcffd681a5a5cf0daf33105d9a2e9ab0ceeae4cc54dceea';

    expect(client.resolveIdFromName('tacos')).toStrictEqual(expectedId);
  });

  it('resolves root domain id if no id for empty string', () => {
    const client = subject({}, { rootDomainId: '0xb0b' });

    expect(client.resolveIdFromName('')).toStrictEqual('0xb0b');
  });

  it('resolves root domain id if no id for null', () => {
    const client = subject({}, { rootDomainId: '0xb0b' });

    expect(client.resolveIdFromName(null)).toStrictEqual('0xb0b');
  });

  it('resolves root domain id if no id for undefined', () => {
    const client = subject({}, { rootDomainId: '0xb0b' });

    expect(client.resolveIdFromName(undefined)).toStrictEqual('0xb0b');
  });

  it('resolves id for nested domain', () => {
    const client = subject();

    const expectedId = '0x28ce88e8ee1f700302155194a494101fd5d8163520cd08ba52a932a983391394';

    expect(client.resolveIdFromName('tacos.are.the.best.fruit')).toStrictEqual(expectedId);
  });

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
