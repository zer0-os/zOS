import { MetadataService } from './metadata-service';

describe('MetadataService', () => {
  const subject = (clientOverrides = {}, configOverrides = {}) => {
    const httpClient = {
      get: () => ({ body: null }),
      ...clientOverrides,
    };

    const config = {
      ipfsBaseUrl: '',
      ...configOverrides,
    };

    return new MetadataService(httpClient, config as any);
  }

  it('gets url', async () => {
    const get = jest.fn(() => ({ body: null }));

    const service = subject({ get });

    await service.load('http://example.com/what');

    expect(get).toBeCalledWith('http://example.com/what');
  });

  it('normalizes ipfs url', async () => {
    const get = jest.fn(() => ({ body: null }));

    const service = subject({ get }, { ipfsBaseUrl: 'http://example.com/ipfs' });

    await service.load('ipfs://thehash');

    expect(get).toBeCalledWith('http://example.com/ipfs/thehash');
  });

  it('normalizes ipfs url if config has trailing slash', async () => {
    const get = jest.fn(() => ({ body: null }));

    const service = subject({ get }, { ipfsBaseUrl: 'http://example.com/ipfs/' });

    await service.load('ipfs://thehash');

    expect(get).toBeCalledWith('http://example.com/ipfs/thehash');
  });

  it('returns metadata from endpoint', async () => {
    const body = {
      title: 'the-title',
      description: 'the-description',
      image: 'http://example.com/my-face.jpg',
    };

    const service = subject({ get: async () => ({ body }) });

    const metadata = await service.load('http://example.com/what');

    expect(metadata).toStrictEqual(body);
  });

  it('normalizes the title', async () => {
    const body = {
      name: 'the-name-no-the-title-what',
    };

    const service = subject({ get: async () => ({ body }) });

    const { title } = await service.load('http://example.com/what');

    expect(title).toStrictEqual('the-name-no-the-title-what');
  });

  it('title is null when undefined', async () => {
    const body = {
      description: 'the-description',
      image: 'http://example.com/my-face.jpg',
    };

    const service = subject({ get: async () => ({ body }) });

    const { title } = await service.load('http://example.com/what');

    expect(title).toBeNull();
  });

  it('description is null when undefined', async () => {
    const body = {
      title: 'the-title',
      image: 'http://example.com/my-face.jpg',
    };

    const service = subject({ get: async () => ({ body }) });

    const { description } = await service.load('http://example.com/what');

    expect(description).toBeNull();
  });

  it('image is null when undefined', async () => {
    const body = {
      title: 'the-title',
      description: 'what',
    };

    const service = subject({ get: async () => ({ body }) });

    const { image } = await service.load('http://example.com/what');

    expect(image).toBeNull();
  });

  it('image_full becomes image if image is empty string', async () => {
    const body = {
      title: 'the-title',
      description: 'what',
      image: '',
      image_full: 'http://example.com/my-face.jpg',
    };

    const service = subject({ get: async () => ({ body }) });

    const { image } = await service.load('http://example.com/what');

    expect(image).toBe('http://example.com/my-face.jpg');
  });

  it('image_full does not replace image', async () => {
    const body = {
      title: 'the-title',
      description: 'what',
      image: 'http://example.com/my-face.jpg',
      image_full: 'http://example.com/my-full-face.jpg',
    };

    const service = subject({ get: async () => ({ body }) });

    const { image } = await service.load('http://example.com/what');

    expect(image).toBe('http://example.com/my-face.jpg');
  });

  it('metadata is null when body is not defined', async () => {
    const service = subject({ get: async () => ({}) });

    const metadata = await service.load('http://example.com/what');

    expect(metadata).toBeNull();
  });

  it('metadata is null when request throws', async () => {
    const service = subject({
      get: async () => {
        throw new Error('metadata not found');
      },
    });

    const metadata = await service.load('http://example.com/what');

    expect(metadata).toBeNull();
  });

  it('normalizes ipfs url for image', async () => {
    const body = {
      title: 'the-title',
      image: 'ipfs://thehash',
    };

    const service = subject({ get: async () => ({ body }) }, { ipfsBaseUrl: 'http://example.com/ipfs' });

    const { image } = await service.load('http://example.com/what');

    expect(image).toBe('http://example.com/ipfs/thehash');
  });

  it('normalizes ipfs url for image when config has trailing slash', async () => {
    const body = {
      title: 'the-title',
      image: 'ipfs://thehash',
    };

    const service = subject({ get: async () => ({ body }) }, { ipfsBaseUrl: 'http://example.com/ipfs/' });

    const { image } = await service.load('http://example.com/what');

    expect(image).toBe('http://example.com/ipfs/thehash');
  });
});
