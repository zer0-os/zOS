import { EventType, GuestAccess, Preset, Visibility } from 'matrix-js-sdk';
import { MatrixClient } from './matrix-client';
import { setAsDM } from './matrix/utils';
import { uploadImage as _uploadImage } from '../../store/channels-list/api';
import { when } from 'jest-when';
import { config } from '../../config';

jest.mock('./matrix/utils', () => ({ setAsDM: jest.fn().mockResolvedValue(undefined) }));

const mockUploadImage = jest.fn();
jest.mock('../../store/channels-list/api', () => {
  return { uploadImage: (...args) => mockUploadImage(...args) };
});

const stubRoom = (attrs = {}) => ({
  roomId: 'some-id',
  getAvatarUrl: () => '',
  getMembers: () => [],
  getDMInviter: () => undefined,
  loadMembersIfNeeded: () => undefined,
  getLiveTimeline: () => stubTimeline(),
  getMyMembership: () => 'join',
  getEvents: () => stubTimeline(),
  ...attrs,
});

function stubTimeline() {
  return {
    getState: () => ({
      getStateEvents: () => null,
    }),
    getEvents: () => [],
  };
}

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
  login: async () => ({}),
  initCrypto: async () => null,
  startClient: jest.fn(async () => undefined),
  stopClient: jest.fn(),
  on: jest.fn((topic, callback) => {
    if (topic === 'sync') callback('PREPARED');
  }),
  getRooms: jest.fn(),
  getAccountData: jest.fn(),
  getUser: jest.fn(),
  setGlobalErrorOnUnknownDevices: () => undefined,
  ...sdkClient,
});

const subject = (props = {}, sessionStorage = {}) => {
  const allProps: any = {
    createClient: (_opts: any) => getSdkClient(),
    ...props,
  };

  const mockSessionStorage: any = {
    get: () => ({ deviceId: '', accessToken: '', userId: '' }),
    set: (_session) => undefined,
    clear: () => undefined,
    ...sessionStorage,
  };

  return new MatrixClient(allProps, mockSessionStorage);
};

function resolveWith<T>(valueToResolve: T) {
  let theResolve;
  const promise = new Promise((resolve) => {
    theResolve = async () => {
      resolve(valueToResolve);
      await new Promise((resolve) => setImmediate(resolve));
      await promise;
    };
  });

  return { resolve: theResolve, mock: () => promise };
}

describe('matrix client', () => {
  describe('disconnect', () => {
    it('stops client on disconnect', async () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);
      const matrixSession = {
        deviceId: 'abc123',
        accessToken: 'token-4321',
        userId: '@bob:zos-matrix',
      };

      const client = subject({ createClient }, { get: () => matrixSession });

      // initializes underlying matrix client
      await client.connect(null, 'token');

      client.disconnect();

      expect(sdkClient.stopClient).toHaveBeenCalledOnce();
    });

    it('clears session storage on disconnect', async () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);
      const matrixSession = {
        deviceId: 'abc123',
        accessToken: 'token-4321',
        userId: '@bob:zos-matrix',
      };

      const clearSession = jest.fn();

      const client = subject({ createClient }, { clear: clearSession, get: () => matrixSession });

      // initializes underlying matrix client
      await client.connect(null, 'token');

      expect(clearSession).not.toHaveBeenCalled();

      client.disconnect();

      expect(clearSession).toHaveBeenCalledOnce();
    });
  });

  describe('createclient', () => {
    it('creates SDK client with existing session on connect', async () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);
      const matrixSession = {
        deviceId: 'abc123',
        accessToken: 'token-4321',
        userId: '@bob:zos-matrix',
      };

      const client = subject({ createClient }, { get: () => matrixSession });

      client.connect(null, 'token');

      await new Promise((resolve) => setImmediate(resolve));

      expect(createClient).toHaveBeenCalledWith({
        baseUrl: config.matrix.homeServerUrl,
        ...matrixSession,
      });
    });

    it('logs in and creates SDK client with new session if none exists', async () => {
      const matrixSession = {
        deviceId: 'abc123',
        accessToken: 'token-4321',
        userId: '@bob:zos-matrix',
      };

      const { resolve, mock } = resolveWith({
        device_id: matrixSession.deviceId,
        user_id: matrixSession.userId,
        access_token: matrixSession.accessToken,
      });

      const createClient = jest.fn(() => getSdkClient({ login: mock }));

      const client = subject({ createClient }, { get: () => null });

      client.connect(null, 'token');

      await resolve();

      expect(createClient).toHaveBeenNthCalledWith(2, {
        baseUrl: config.matrix.homeServerUrl,
        ...matrixSession,
      });
    });

    it('saves session if none exists', async () => {
      const matrixSession = {
        deviceId: 'abc123',
        accessToken: 'token-4321',
        userId: '@bob:zos-matrix',
      };

      const setSession = jest.fn();

      const { resolve, mock } = resolveWith({
        device_id: matrixSession.deviceId,
        user_id: matrixSession.userId,
        access_token: matrixSession.accessToken,
      });

      const createClient = jest.fn(() => getSdkClient({ login: mock }));

      const client = subject({ createClient }, { get: () => null, set: setSession });

      client.connect(null, 'token');

      await resolve();

      expect(setSession).toHaveBeenCalledWith(matrixSession);
    });

    it('starts client on connect', async () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);

      const client = subject({ createClient });

      await client.connect(null, 'token');

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

      await client.connect(null, 'token');

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

      await client.connect(null, 'token');

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

      client.connect(null, 'token');

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
      const rooms = [
        stubRoom({ roomId: 'channel-id' }),
        stubRoom({ roomId: 'dm-id' }),
        stubRoom({ roomId: 'dm-id-without-account-data', getDMInviter: () => 'somebody' }),
      ];

      const getRooms = jest.fn(() => rooms);
      const getAccountData = getMockAccountData({ id: 'dm-id' });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRooms, getAccountData })),
      });

      await client.connect(null, 'token');
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

      await client.connect(null, 'token');
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

      await client.connect(null, 'token');
      const channels = await client.getChannels('network-id');

      expect(channels).toHaveLength(2);
    });
  });

  describe('getConversations', () => {
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
      await client.connect(null, 'token');
      return client;
    };

    it('returns only direct rooms as conversations', async () => {
      const rooms = [stubRoom({ roomId: 'channel-id' }), stubRoom({ roomId: 'dm-id' })];
      const getRooms = jest.fn(() => rooms);
      const getAccountData = getMockAccountData({ id: 'dm-id' });
      const client = await subject({ getRooms, getAccountData });

      const conversations = await client.getConversations();

      expect(conversations).toHaveLength(1);
      expect(conversations[0].id).toEqual('dm-id');
    });

    it('returns rooms that do not have account data yet but do have a DM inviter', async () => {
      const rooms = [stubRoom({ roomId: 'channel-id' }), stubRoom({ roomId: 'dm-id', getDMInviter: () => 'somebody' })];
      const getRooms = jest.fn(() => rooms);
      const client = await subject({ getRooms });

      const conversations = await client.getConversations();

      expect(conversations).toHaveLength(1);
      expect(conversations[0].id).toEqual('dm-id');
    });

    it('returns empty array if no direct rooms exist', async () => {
      const getRooms = jest.fn(() => []);
      const getAccountData = getMockAccountData();
      const client = await subject({ getRooms, getAccountData });

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

      await client.connect(null, 'token');

      await client.getConversations();

      expect(getAccountData).toHaveBeenCalledWith(EventType.Direct);
    });

    it('waits for connection if matrix client is connecting to get account data', async () => {
      const sdkClient = getSdkClient();
      const createClient = jest.fn(() => sdkClient);

      const client = subject({ createClient });
      client.connect(null, 'token');

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

      await client.connect(null, 'token');

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
      await client.connect(null, 'token');
      return client;
    };

    it('disallows guest access', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createConversation([{ userId: 'id', matrixId: '@somebody.else' }], null, null, null);

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_state: expect.arrayContaining([
            { type: 'm.room.guest_access', state_key: '', content: { guest_access: GuestAccess.Forbidden } },
          ]),
        })
      );
    });

    it('creates encrypted room', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createConversation([{ userId: 'id', matrixId: '@somebody.else' }], null, null, null);

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_state: expect.arrayContaining([
            { type: 'm.room.encryption', state_key: '', content: { algorithm: 'm.megolm.v1.aes-sha2' } },
          ]),
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

    it('sets the conversation as a Matrix direct message', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'test-room' });
      const users = [{ userId: 'id-1', matrixId: '@first.user' }];
      const client = await subject({ createRoom });

      await client.createConversation(users, null, null, null);

      expect(setAsDM).toHaveBeenCalledWith(expect.anything(), 'test-room', '@first.user');
    });

    it('sets the conversation name', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createConversation([{ userId: 'id', matrixId: '@somebody.else' }], 'room-name', null, null);

      expect(createRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'room-name' }));
    });

    it('uploads the image', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      when(mockUploadImage).calledWith(expect.anything()).mockResolvedValue({ url: 'upload-url' });
      const client = await subject({ createRoom });

      await client.createConversation(
        [{ userId: 'id', matrixId: '@somebody.else' }],
        null,
        { name: 'test file' } as File,
        null
      );

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_state: expect.arrayContaining([
            { type: EventType.RoomAvatar, state_key: '', content: { url: 'upload-url' } },
          ]),
        })
      );
    });
  });

  describe('sendMessagesByChannelId', () => {
    it('sends a message successfully', async () => {
      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU',
        })
      );
      const fetchRoomEvent = jest.fn(() =>
        Promise.resolve({
          type: 'm.room.message',
          room_id: '!wqnBBSmtCokmfmPlbK:zero-synapse-development.zer0.io',
          sender: '@ratik21:zero-synapse-development.zer0.io',
          content: {
            body: 'test',
            msgtype: 'm.text',
          },
          event_id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU',
          user_id: '@ratik21:zero-synapse-development.zer0.io',
        })
      );

      const getSenderData = jest.fn(() =>
        Promise.resolve({
          displayName: 'Joe Bloggs',
        })
      );

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ sendMessage, fetchRoomEvent, getUser: getSenderData })),
      });

      await client.connect(null, 'token');

      const result = await client.sendMessagesByChannelId('channel-id', 'message', []);
      expect(result).toMatchObject({
        id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU',
        message: 'test',
        parentMessageId: null,
        parentMessageText: '',
      });
    });

    it('sends a reply message successfully', async () => {
      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: '$cz6gG4_AGHTZGiPiPDCxaOZAGqGhANGPnB058ZSrE9c',
        })
      );

      const fetchRoomEvent = jest.fn(() =>
        Promise.resolve({
          type: 'm.room.message',
          content: {
            body: 'reply',
            msgtype: 'm.text',
            'm.relates_to': {
              'm.in_reply_to': {
                event_id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU',
              },
            },
          },
          event_id: '$cz6gG4_AGHTZGiPiPDCxaOZAGqGhANGPnB058ZSrE9c',
          user_id: '@ratik21:zero-synapse-development.zer0.io',
        })
      );

      const getSenderData = jest.fn(() =>
        Promise.resolve({
          displayName: 'Joe Bloggs',
        })
      );

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ sendMessage, fetchRoomEvent, getUser: getSenderData })),
      });

      await client.connect(null, 'token');

      const result = await client.sendMessagesByChannelId('channel-id', 'message', []);

      expect(result).toMatchObject({
        id: '$cz6gG4_AGHTZGiPiPDCxaOZAGqGhANGPnB058ZSrE9c',
        message: 'reply',
        parentMessageId: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU',
      });
    });
  });

  describe('deleteMessageByRoomId', () => {
    it('deletes a message by room ID and message ID', async () => {
      const messageId = '123456';
      const channelId = '!abcdefg';
      const redactEvent = jest.fn().mockResolvedValue({});

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ redactEvent })),
      });

      await client.connect(null, 'token');
      await client.deleteMessageByRoomId(channelId, messageId);

      expect(redactEvent).toHaveBeenCalledWith(channelId, messageId);
    });
  });

  describe('getMessagesByChannelId', () => {
    it('filters out redacted messages', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const createMessagesRequest = jest.fn().mockResolvedValue({
        chunk: [
          {
            type: 'm.room.message',
            content: { body: 'message 1', msgtype: 'm.text' },
            event_id: 'message-id-1',
            unsigned: { redacted_because: {} }, // Indicates the message has been redacted.
          },
          {
            type: 'm.room.message',
            content: { body: 'message 2', msgtype: 'm.text' },
            event_id: 'message-id-2',
          },
        ],
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ createMessagesRequest, getUser })),
      });

      await client.connect(null, 'token');
      const { messages: fetchedMessages } = await client.getMessagesByChannelId('channel-id');

      expect(fetchedMessages).toHaveLength(1);
      expect(fetchedMessages[0].message).toEqual('message 2');
    });

    it('fetches messages successfully', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const createMessagesRequest = jest.fn().mockResolvedValue({
        chunk: [
          {
            type: 'm.room.message',
            content: { body: 'message 1', msgtype: 'm.text' },
            event_id: 'message-id-1',
          },
          {
            type: 'm.room.message',
            content: { body: 'message 2', msgtype: 'm.text' },
            event_id: 'message-id-2',
          },
          {
            type: 'm.room.message',
            content: { body: 'message 3', msgtype: 'm.text' },
            event_id: 'message-id-3',
          },
        ],
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ createMessagesRequest, getUser })),
      });

      await client.connect(null, 'token');
      const { messages: fetchedMessages } = await client.getMessagesByChannelId('channel-id');

      expect(fetchedMessages).toHaveLength(3);
    });

    it('returns an empty array if no messages are found', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const createMessagesRequest = jest.fn().mockResolvedValue({ chunk: [] });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ createMessagesRequest, getUser })),
      });

      await client.connect(null, 'token');
      const { messages: fetchedMessages } = await client.getMessagesByChannelId('channel-id');

      expect(fetchedMessages).toHaveLength(0);
    });
  });
});
