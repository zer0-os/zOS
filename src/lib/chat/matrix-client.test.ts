import { MatrixClient } from './matrix-client';

const getRoom = (props: any = {}) => ({
  id: 'the-id',
  getAvatarUrl: () => '',
  ...props,
});

const getMockAccountData = (data = {}) => {
  return jest.fn((eventType) => {
    if (eventType === 'm.direct') {
      return {
        event: {
          content: data,
        },
      };
    }
    return {};
  });
};

const getSdkClient = (sdkClient = {}) => ({
  startClient: jest.fn(async () => undefined),
  on: jest.fn((topic, callback) => {
    if (topic === 'sync') callback('PREPARED');
  }),
  getRooms: jest.fn(),
  getAccountData: jest.fn(),
  ...sdkClient,
});

const subject = (props = {}) => {
  const allProps: any = {
    createClient: (_opts: any) => getSdkClient(),
    ...props,
  };

  return new MatrixClient(allProps);
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
      const getAccountData = getMockAccountData({});

      const getRooms = jest.fn(() => {
        return rooms;
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms, getAccountData })),
      });

      await client.connect('username', 'token');

      await client.getChannels('network-id');

      expect(getRooms).toHaveBeenCalledOnce();
    });

    it('waits for sync to get rooms', async () => {
      const rooms = [getRoom({ roomId: 'room-id' })];
      const getAccountData = getMockAccountData({});
      let syncCallback: any;

      const on = (topic, callback) => {
        if (topic === 'sync') syncCallback = callback;
      };

      const getRooms = jest.fn(() => {
        return rooms;
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ on, getRooms, getAccountData })),
      });

      client.connect('username', 'token');

      const channelFetch = client.getChannels('network-id');

      await new Promise((resolve) => setImmediate(resolve));

      expect(getRooms).not.toHaveBeenCalled();

      syncCallback('PREPARED');

      await channelFetch;

      expect(getRooms).toHaveBeenCalledOnce();
    });

    it('get account data', async () => {
      const getAccountData = getMockAccountData({});

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getAccountData })),
      });

      await client.connect('username', 'token');

      await client.getConversations();

      expect(getAccountData).toHaveBeenCalledWith('m.direct');
    });
  });
});
