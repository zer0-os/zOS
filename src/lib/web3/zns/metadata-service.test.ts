import { MetadataService } from './metadata-service';

describe('MetadataService', () => {
  const subject = (clientOverrides = {}) => {
    const httpClient = {
      get: () => ({ body: null }),
      ...clientOverrides,
    };

    return new MetadataService(httpClient);
  }

  it('gets url', async () => {
    const get = jest.fn(() => ({ body: null }));

    const service = subject({ get });

    await service.load('http://example.com/what');

    expect(get).toBeCalledWith('http://example.com/what');
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
});
