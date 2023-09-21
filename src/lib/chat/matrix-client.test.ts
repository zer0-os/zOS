import { EventType, GuestAccess, Preset, Visibility } from 'matrix-js-sdk';
import { MatrixClient } from './matrix-client';
import { when } from 'jest-when';
import { setAsDM } from './matrix/utils';

jest.mock('./matrix/utils', () => ({ setAsDM: jest.fn().mockResolvedValue(undefined) }));

const stubRoom = (attrs = {}) => ({
  roomId: 'some-id',
  getAvatarUrl: () => '',
  getMembers: () => [],
  ...attrs,
});

const getMockAccountData = (data = {}) => {
  return jest.fn((eventType) => {
    if (eventType === EventType.Direct) {
      return {
        event: { content: data },
        getContent: () => data,
      };
    }
    return {
      getContent: () => ({}),
    };
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
      const rooms = [stubRoom({ roomId: 'room-id' })];
      const getAccountData = getMockAccountData();

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
      const rooms = [stubRoom({ roomId: 'room-id' })];
      const getAccountData = getMockAccountData();
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
  });

  describe('getChannels', () => {
    it('returns only non-direct rooms as channels', async () => {
      const rooms = [stubRoom({ roomId: 'channel-id' }), stubRoom({ roomId: 'dm-id' })];

      const getRooms = jest.fn(() => rooms);
      const getAccountData = getMockAccountData({ id: 'dm-id' });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms, getAccountData })),
      });

      await client.connect('username', 'token');
      const channels = await client.getChannels('network-id');

      expect(channels).toHaveLength(1);
      expect(channels[0].id).toEqual('channel-id');
    });

    it('returns empty array if no rooms exist', async () => {
      const getRooms = jest.fn(() => []);
      const getAccountData = getMockAccountData();

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms, getAccountData })),
      });

      await client.connect('username', 'token');
      const channels = await client.getChannels('network-id');

      expect(channels).toHaveLength(0);
    });

    it('returns all rooms as channels if no direct room data exists', async () => {
      const rooms = [stubRoom({ roomId: 'channel-id' }), stubRoom({ roomId: 'dm-id' })];
      const getRooms = jest.fn(() => rooms);
      const getAccountData = getMockAccountData();

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms, getAccountData })),
      });

      await client.connect('username', 'token');
      const channels = await client.getChannels('network-id');

      expect(channels).toHaveLength(2);
    });
  });

  describe('getConversations', () => {
    it('returns only direct rooms as conversations', async () => {
      const rooms = [stubRoom({ roomId: 'channel-id' }), stubRoom({ roomId: 'dm-id' })];

      const getRooms = jest.fn(() => rooms);
      const getAccountData = getMockAccountData({ id: 'dm-id' });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms, getAccountData })),
      });

      await client.connect('username', 'token');
      const conversations = await client.getConversations();

      expect(conversations).toHaveLength(1);
      expect(conversations[0].id).toEqual('dm-id');
    });

    it('returns empty array if no direct rooms exist', async () => {
      const getRooms = jest.fn(() => []);
      const getAccountData = getMockAccountData();

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms, getAccountData })),
      });

      await client.connect('username', 'token');
      const conversations = await client.getConversations();

      expect(conversations).toHaveLength(0);
    });
  });

  describe('getAccountData', () => {
    it('get account data', async () => {
      const getAccountData = getMockAccountData({
        '@mockuser1': ['!abcdefg'],
        '@mockuser2:': ['!hijklmn', '!opqrstuv'],
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getAccountData })),
      });

      await client.connect('username', 'token');

      await client.getConversations();

      expect(getAccountData).toHaveBeenCalledWith(EventType.Direct);
    });

    it('waits for connection if matrix client is connecting to get account data', async () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);

      const client = subject({ createClient });
      client.connect('username', 'token');

      const accountDataFetch = client.getAccountData(EventType.Direct);
      expect(sdkClient.getAccountData).not.toHaveBeenCalled();

      await new Promise((resolve) => setImmediate(resolve));

      await accountDataFetch;

      expect(sdkClient.getAccountData).toHaveBeenCalledWith(EventType.Direct);
    });

    it('fetches and returns correct account data when type is "m.direct"', async () => {
      const getAccountData = getMockAccountData({
        '@mockuser1': ['!abcdefg'],
        '@mockuser2:': ['!hijklmn', '!opqrstuv'],
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getAccountData })),
      });

      await client.connect('username', 'token');

      const result = await client.getAccountData(EventType.Direct);
      expect(result).toMatchObject({
        event: {
          content: {
            '@mockuser1': ['!abcdefg'],
            '@mockuser2:': ['!hijklmn', '!opqrstuv'],
          },
        },
      });
    });
  });

  describe('createConversation', () => {
    const subject = async (stubs = {}) => {
      const allStubs = {
        createRoom: jest.fn().mockResolvedValue({ room_id: 'stub-id' }),
        getRoom: jest.fn().mockReturnValue(stubRoom({})),
        ...stubs,
      };
      const allProps: any = {
        createClient: (_opts: any) => getSdkClient(allStubs),
      };

      const client = new MatrixClient(allProps);
      await client.connect('@somebody', 'token');
      return client;
    };

    it('disallows guest access', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createConversation([{ userId: 'id', matrixId: '@somebody.else' }], null, null, null);

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_state: [
            { type: 'm.room.guest_access', state_key: '', content: { guest_access: GuestAccess.Forbidden } },
          ],
        })
      );
    });

    it('sets default conversation settings', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createConversation([{ userId: 'id', matrixId: '@somebody.else' }], null, null, null);

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          preset: Preset.TrustedPrivateChat,
          visibility: Visibility.Private,
          is_direct: true,
        })
      );
    });

    it('specifies the invited users', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const users = [
        { userId: 'id-1', matrixId: '@first.user' },
        { userId: 'id-2', matrixId: '@second.user' },
      ];
      const client = await subject({ createRoom });

      await client.createConversation(users, null, null, null);

      expect(createRoom).toHaveBeenCalledWith(expect.objectContaining({ invite: ['@first.user', '@second.user'] }));
    });

    it('returns the created conversation', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'a-new-room' });
      const getRoom = jest.fn();
      when(getRoom)
        .calledWith('a-new-room')
        .mockReturnValue(stubRoom({ roomId: 'a-new-room' }));
      const users = [{ userId: 'id-1', matrixId: '@first.user' }];
      const client = await subject({ createRoom, getRoom });

      const conversation = await client.createConversation(users, null, null, null);

      expect(conversation.id).toEqual('a-new-room');
    });

    it('sets the conversation as a Matrix direct message', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'test-room' });
      const users = [{ userId: 'id-1', matrixId: '@first.user' }];
      const client = await subject({ createRoom });

      await client.createConversation(users, null, null, null);

      expect(setAsDM).toHaveBeenCalledWith(expect.anything(), 'test-room', '@first.user');
    });
  });
});
