import { MatrixClient } from './matrix-client';

const getRoom = (props: any = {}) => ({
  id: 'the-id',
  getAvatarUrl: () => '',
  ...props,
});

const getSdkClient = (sdkClient = {}) => ({
  startClient: jest.fn(async () => undefined),
  on: jest.fn((topic, callback) => {
    if (topic === 'sync') callback('PREPARED');
  }),
  getRooms: jest.fn(),
  ...sdkClient,
});

const subject = (props = {}, config = {}) => {
  const allProps: any = {
    createClient: (_opts: any) => getSdkClient(),
    ...props,
  };

  const allConfig = {
    userId: undefined,
    accessToken: undefined,
    ...config,
  };

  return new MatrixClient(allProps, allConfig);
};

describe('matrix client', () => {
  describe('createclient', () => {
    it('creates SDK client on connect', () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);

      const client = subject({ createClient });

      client.connect('username', 'token');

      expect(createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'username',
          accessToken: 'token',
        })
      );
    });

    it('uses default credentials if they are provided', () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);

      const userId = 'the-default-user-id';
      const accessToken = 'the-default-access-token';
      const client = subject({ createClient }, { userId, accessToken });

      client.connect('username', 'token');

      expect(createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          accessToken,
        })
      );
    });

    it('starts client on connect', () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);

      const client = subject({ createClient });

      client.connect('username', 'token');

      expect(sdkClient.startClient).toHaveBeenCalledOnce();
    });

    it('waits for sync', async () => {
      const on = jest.fn((topic, callback) => {
        if (topic === 'sync') {
          callback('PREPARED');
        }
      });

      const sdkClient = getSdkClient({ on });
      const createClient = jest.fn(() => sdkClient);

      const client = subject({ createClient });

      await client.connect('username', 'token');

      expect(on).toHaveBeenNthCalledWith(1, 'sync', expect.any(Function));
    });

    it('gets rooms', async () => {
      const rooms = [getRoom({ roomId: 'room-id' })];

      const getRooms = jest.fn(() => {
        return rooms;
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms })),
      });

      await client.connect('username', 'token');

      client.getChannels('network-id');

      expect(getRooms).toHaveBeenCalledOnce();
    });

    it('waits for sync to get rooms', async () => {
      const rooms = [getRoom({ roomId: 'room-id' })];
      let syncCallback: any;

      const on = (topic, callback) => {
        if (topic === 'sync') syncCallback = callback;
      };

      const getRooms = jest.fn(() => {
        return rooms;
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ on, getRooms })),
      });

      client.connect('username', 'token');

      const channelFetch = client.getChannels('network-id');

      await new Promise((resolve) => setImmediate(resolve));

      expect(getRooms).not.toHaveBeenCalled();

      syncCallback('PREPARED');

      await channelFetch;

      expect(getRooms).toHaveBeenCalledOnce();
    });
  });
});
