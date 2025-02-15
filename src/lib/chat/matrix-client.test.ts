import { EventType, GuestAccess, Preset, ReceiptType, Visibility } from 'matrix-js-sdk';
import { MatrixClient } from './matrix-client';
import { setAsDM } from './matrix/utils';
import { uploadImage as _uploadImage } from '../../store/channels-list/api';
import { when } from 'jest-when';
import { config } from '../../config';
import { PowerLevels } from './types';
import { MatrixConstants, ReactionKeys, ReadReceiptPreferenceType } from './matrix/types';
import { DefaultRoomLabels } from '../../store/channels';

jest.mock('./matrix/utils', () => ({ setAsDM: jest.fn().mockResolvedValue(undefined) }));

const mockEncryptFile = jest.fn();
const mockGetImageDimensions = jest.fn();
const mockGenerateBlurhash = jest.fn();
jest.mock('./matrix/media', () => {
  const originalModule = jest.requireActual('./matrix/media');

  return {
    ...originalModule,
    encryptFile: (...args) => mockEncryptFile(...args),
    getImageDimensions: (...args) => mockGetImageDimensions(...args),
    generateBlurhash: (...args) => mockGenerateBlurhash(...args),
  };
});

const stubRoom = (attrs = {}) => ({
  roomId: 'some-id',
  getAvatarUrl: () => '',
  getMembers: () => [],
  getCreator: () => '',
  getDMInviter: () => undefined,
  loadMembersIfNeeded: () => undefined,
  decryptAllEvents: () => undefined,
  getLiveTimeline: () => stubTimeline(),
  getMyMembership: () => 'join',
  getEvents: () => stubTimeline(),
  getUnreadNotificationCount: () => 0,
  on: () => undefined,
  off: () => undefined,
  hasEncryptionStateEvent: jest.fn(() => false),
  ...attrs,
});

function stubTimeline(stubs = {}) {
  return {
    getState: () => ({
      getStateEvents: () => null,
    }),
    getEvents: () => [],
    ...stubs,
  };
}

const getSdkClient = (sdkClient = {}) => ({
  login: async () => ({}),
  initCrypto: async () => null,
  startClient: jest.fn(async () => undefined),
  logout: jest.fn(),
  removeAllListeners: jest.fn(),
  clearStores: jest.fn(),
  on: jest.fn((topic, callback) => {
    if (topic === 'sync') callback('PREPARED');
  }),
  off: jest.fn(),
  getRooms: jest.fn(),
  getRoom: jest.fn().mockReturnValue(stubRoom()),
  getUser: jest.fn(),
  getAccountData: jest.fn(),
  setGlobalErrorOnUnknownDevices: () => undefined,
  fetchRoomEvent: jest.fn(),
  paginateEventTimeline: () => true,
  invite: jest.fn().mockResolvedValue({}),
  setRoomTag: jest.fn().mockResolvedValue({}),
  deleteRoomTag: jest.fn().mockResolvedValue({}),
  getRoomTags: jest.fn().mockResolvedValue({}),
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
    it('stops client completely on disconnect', async () => {
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

      await client.disconnect();

      expect(sdkClient.logout).toHaveBeenCalledOnce();
      expect(sdkClient.removeAllListeners).toHaveBeenCalledOnce();
      expect(sdkClient.clearStores).toHaveBeenCalledOnce();
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

      clearSession.mockClear();
      await client.disconnect();

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

      client.connect('@bob:zos-matrix', 'token');

      await new Promise((resolve) => setImmediate(resolve));

      expect(createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: config.matrix.homeServerUrl,
          ...matrixSession,
        })
      );
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

      expect(createClient).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          baseUrl: config.matrix.homeServerUrl,
          ...matrixSession,
        })
      );
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

    it('returns all rooms as conversations', async () => {
      const rooms = [
        stubRoom({ roomId: 'channel-id' }),
        stubRoom({ roomId: 'dm-id', getCreator: () => 'creator-user-id' }),
      ];
      const getRooms = jest.fn(() => rooms);
      const client = await subject({ getRooms });

      const conversations = await client.getConversations();

      expect(conversations).toHaveLength(2);
      expect(conversations[0].id).toEqual('channel-id');
      expect(conversations[1].id).toEqual('dm-id');
      expect(conversations[1].adminMatrixIds).toEqual(['creator-user-id']);
    });

    it('returns empty array if no direct rooms exist', async () => {
      const getRooms = jest.fn(() => []);
      const client = await subject({ getRooms });

      const conversations = await client.getConversations();

      expect(conversations).toHaveLength(0);
    });
  });

  describe('createConversation', () => {
    const subject = async (stubs = {}, sessionStorage = { userId: 'stub-user-id' }) => {
      const allStubs = {
        createRoom: jest.fn().mockResolvedValue({ room_id: 'stub-id' }),
        getRoom: jest.fn().mockReturnValue(stubRoom({})),
        ...stubs,
      };
      const allProps: any = {
        createClient: (_opts: any) => getSdkClient(allStubs),
      };

      const client = new MatrixClient(allProps, { get: () => sessionStorage, clear: () => {} } as any);
      await client.connect(sessionStorage.userId || 'stub-user-id', 'token');
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

    it('set the appropriate default power_levels in group conversation', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom }, { userId: '@this.user' });

      await client.createConversation(
        [
          { userId: 'id-1', matrixId: '@first.user' },
          { userId: 'id-2', matrixId: '@second.user' },
        ],
        null,
        null,
        null
      );

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          power_level_content_override: {
            users: {
              '@this.user': 100, // the user who created the room
            },
            invite: PowerLevels.Moderator,
            kick: PowerLevels.Moderator,
            redact: PowerLevels.Owner,
            ban: PowerLevels.Owner,
            users_default: PowerLevels.Viewer,
          },
        })
      );
    });

    it('invites the users after createRoom', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const invite = jest.fn().mockResolvedValue({});
      const users = [
        { userId: 'id-1', matrixId: '@first.user' },
        { userId: 'id-2', matrixId: '@second.user' },
      ];
      const client = await subject({ createRoom, invite });

      await client.createConversation(users, null, null, null);

      expect(createRoom).toHaveBeenCalledWith(expect.objectContaining({ invite: [] }));
      expect(invite).toHaveBeenCalledWith('new-room-id', '@first.user');
      expect(invite).toHaveBeenCalledWith('new-room-id', '@second.user');
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
      const uploadContent = jest.fn().mockResolvedValue({ content_uri: 'upload-url' });
      const mxcUrlToHttp = jest.fn().mockReturnValue('upload-url');
      const client = await subject({ createRoom, uploadContent, mxcUrlToHttp });

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

  describe('createUnencryptedConversation', () => {
    const subject = async (stubs = {}, sessionStorage = { userId: 'stub-user-id' }) => {
      const allStubs = {
        createRoom: jest.fn().mockResolvedValue({ room_id: 'stub-id' }),
        getRoom: jest.fn().mockReturnValue(stubRoom({})),
        ...stubs,
      };
      const allProps: any = {
        createClient: (_opts: any) => getSdkClient(allStubs),
      };

      const client = new MatrixClient(allProps, { get: () => sessionStorage, clear: () => {} } as any);
      await client.connect(sessionStorage.userId || 'stub-user-id', 'token');
      return client;
    };

    it('disallows guest access', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createUnencryptedConversation([{ userId: 'id', matrixId: '@somebody.else' }], null, null, null);

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_state: expect.arrayContaining([
            { type: 'm.room.guest_access', state_key: '', content: { guest_access: 'forbidden' } },
          ]),
        })
      );
    });

    it('sets default channel settings (unencrypted)', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createUnencryptedConversation([{ userId: 'id', matrixId: '@somebody.else' }], null, null, null);

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          preset: Preset.PrivateChat,
          visibility: Visibility.Private,
          is_direct: true,
        })
      );
    });

    it('sets the appropriate default power_levels in group channel', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom }, { userId: '@this.user' });

      await client.createUnencryptedConversation(
        [
          { userId: 'id-1', matrixId: '@first.user' },
          { userId: 'id-2', matrixId: '@second.user' },
        ],
        null,
        null,
        null
      );

      expect(createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          power_level_content_override: {
            users: {
              '@this.user': 100, // the user who created the room
            },
            invite: PowerLevels.Moderator,
            kick: PowerLevels.Moderator,
            redact: PowerLevels.Owner,
            ban: PowerLevels.Owner,
            users_default: PowerLevels.Viewer,
          },
        })
      );
    });

    it('invites the users after createRoom', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const invite = jest.fn().mockResolvedValue({});
      const users = [
        { userId: 'id-1', matrixId: '@first.user' },
        { userId: 'id-2', matrixId: '@second.user' },
      ];
      const client = await subject({ createRoom, invite });

      await client.createUnencryptedConversation(users, null, null, null);

      expect(createRoom).toHaveBeenCalledWith(expect.objectContaining({ invite: [] }));
      expect(invite).toHaveBeenCalledWith('new-room-id', '@first.user');
      expect(invite).toHaveBeenCalledWith('new-room-id', '@second.user');
    });

    it('sets the conversation as a Matrix direct message', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'test-room' });
      const users = [{ userId: 'id-1', matrixId: '@first.user' }];
      const client = await subject({ createRoom });

      await client.createUnencryptedConversation(users, null, null, null);

      expect(setAsDM).toHaveBeenCalledWith(expect.anything(), 'test-room', '@first.user');
    });

    it('sets the channel name', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const client = await subject({ createRoom });

      await client.createUnencryptedConversation(
        [{ userId: 'id', matrixId: '@somebody.else' }],
        'channel-name',
        null,
        null
      );

      expect(createRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'channel-name' }));
    });

    it('uploads the image', async () => {
      const createRoom = jest.fn().mockResolvedValue({ room_id: 'new-room-id' });
      const uploadContent = jest.fn().mockResolvedValue({ content_uri: 'upload-url' });
      const mxcUrlToHttp = jest.fn().mockReturnValue('upload-url');

      const client = await subject({ createRoom, uploadContent, mxcUrlToHttp });

      await client.createUnencryptedConversation(
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

  describe('addMembersToRoom', () => {
    it('successfully invites users to a room', async () => {
      const invite = jest.fn().mockResolvedValue({});
      const client = subject({ createClient: jest.fn(() => getSdkClient({ invite })) });

      await client.connect(null, 'token');

      const roomId = 'room123';
      const users = [
        { matrixId: '@user1:server' },
        { matrixId: '@user2:server' },
      ];

      await client.addMembersToRoom(roomId, users);

      for (const user of users) {
        expect(invite).toHaveBeenCalledWith(roomId, user.matrixId);
      }
    });
  });

  describe('sendMessagesByChannelId', () => {
    it('sends a message successfully', async () => {
      const sendMessage = jest.fn().mockResolvedValue({ event_id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU' });

      const client = subject({ createClient: jest.fn(() => getSdkClient({ sendMessage })) });

      await client.connect(null, 'token');

      const result = await client.sendMessagesByChannelId('channel-id', 'message', []);
      expect(result).toMatchObject({ id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU' });
    });

    it('sends a reply message successfully', async () => {
      const sendMessage = jest.fn().mockResolvedValue({ event_id: '$cz6gG4_AGHTZGiPiPDCxaOZAGqGhANGPnB058ZSrE9c' });
      const client = subject({ createClient: jest.fn(() => getSdkClient({ sendMessage })) });

      await client.connect(null, 'token');

      const result = await client.sendMessagesByChannelId('channel-id', 'message', []);

      expect(result).toMatchObject({ id: '$cz6gG4_AGHTZGiPiPDCxaOZAGqGhANGPnB058ZSrE9c' });
    });
  });

  describe('sendPostsByChannelId', () => {
    it('sends a post message successfully', async () => {
      const sendEvent = jest.fn().mockResolvedValue({ event_id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU' });
      const client = subject({ createClient: jest.fn(() => getSdkClient({ sendEvent })) });

      await client.connect(null, 'token');

      const result = await client.sendPostsByChannelId('channel-id', 'post-message');

      expect(result).toMatchObject({ id: '$80dh3P6kQKgA0IIrdkw5AW0vSXXcRMT2PPIGVg9nEvU' });
    });
  });

  describe('sendMeowReactionEvent', () => {
    it('sends a meow reaction event successfully', async () => {
      const fixedTimestamp = 1727441803628;
      jest.spyOn(Date, 'now').mockReturnValue(fixedTimestamp);

      const sendEvent = jest.fn().mockResolvedValue({});
      const client = subject({ createClient: jest.fn(() => getSdkClient({ sendEvent })) });

      await client.connect(null, 'token');
      await client.sendMeowReactionEvent('channel-id', 'post-message-id', 'post-owner-id', 10);

      expect(sendEvent).toHaveBeenCalledWith('channel-id', MatrixConstants.REACTION, {
        'm.relates_to': {
          rel_type: MatrixConstants.ANNOTATION,
          event_id: 'post-message-id',
          key: `${ReactionKeys.MEOW}_${fixedTimestamp}`,
        },
        amount: 10,
        postOwnerId: 'post-owner-id',
      });

      jest.restoreAllMocks();
    });
  });

  describe('sendEmojiReactionEvent', () => {
    it('sends a emoji reaction event successfully', async () => {
      const fixedTimestamp = 1727441803628;
      jest.spyOn(Date, 'now').mockReturnValue(fixedTimestamp);

      const sendEvent = jest.fn().mockResolvedValue({});
      const client = subject({ createClient: jest.fn(() => getSdkClient({ sendEvent })) });

      await client.connect(null, 'token');
      await client.sendEmojiReactionEvent('channel-id', 'message-id', '😂');

      expect(sendEvent).toHaveBeenCalledWith('channel-id', MatrixConstants.REACTION, {
        'm.relates_to': {
          rel_type: MatrixConstants.ANNOTATION,
          event_id: 'message-id',
          key: '😂',
        },
      });

      jest.restoreAllMocks();
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
      const getEvents = jest.fn().mockReturnValue([
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 1', msgtype: 'm.text' },
            event_id: 'message-id-1',
            unsigned: { redacted_because: {} }, // Indicates the message has been redacted.
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 2', msgtype: 'm.text' },
            event_id: 'message-id-2',
          }),
        },
      ]);
      const getRoom = jest.fn().mockReturnValue(stubRoom({ getLiveTimeline: () => stubTimeline({ getEvents }) }));

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getUser, getRoom })) });

      await client.connect(null, 'token');
      const { messages: fetchedMessages } = await client.getMessagesByChannelId('channel-id');

      expect(fetchedMessages).toHaveLength(1);
      expect(fetchedMessages[0].message).toEqual('message 2');
    });

    it('filters out post messages', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const getEvents = jest.fn().mockReturnValue([
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 1', msgtype: 'm.text' },
            event_id: 'message-id-1',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.post',
            content: { body: 'post message 1', msgtype: 'm.text' },
            event_id: 'post-message-id-1',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 2', msgtype: 'm.text' },
            event_id: 'message-id-2',
          }),
        },
      ]);
      const getRoom = jest.fn().mockReturnValue(stubRoom({ getLiveTimeline: () => stubTimeline({ getEvents }) }));

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getUser, getRoom })) });

      await client.connect(null, 'token');
      const { messages: fetchedMessages } = await client.getMessagesByChannelId('channel-id');

      expect(fetchedMessages).toHaveLength(2);
      expect(fetchedMessages[0].message).toEqual('message 1');
      expect(fetchedMessages[1].message).toEqual('message 2');
    });

    it('fetches messages successfully', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const getEvents = jest.fn().mockReturnValue([
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 1', msgtype: 'm.text' },
            event_id: 'message-id-1',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 2', msgtype: 'm.text' },
            event_id: 'message-id-2',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 3', msgtype: 'm.text' },
            event_id: 'message-id-3',
          }),
        },
      ]);
      const getRoom = jest.fn().mockReturnValue(stubRoom({ getLiveTimeline: () => stubTimeline({ getEvents }) }));

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getUser, getRoom })) });

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

  describe('getPostMessagesByChannelId', () => {
    it('fetches post messages successfully', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const getEvents = jest.fn().mockReturnValue([
        {
          getEffectiveEvent: () => ({
            type: 'm.room.post',
            content: { body: 'post message 1', msgtype: 'm.text' },
            event_id: 'post-message-id-1',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.post',
            content: { body: 'post message 2', msgtype: 'm.text' },
            event_id: 'post-message-id-2',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.post',
            content: { body: 'post message 3', msgtype: 'm.text' },
            event_id: 'post-message-id-3',
          }),
        },
      ]);
      const getRoom = jest.fn().mockReturnValue(stubRoom({ getLiveTimeline: () => stubTimeline({ getEvents }) }));

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getUser, getRoom })) });

      await client.connect(null, 'token');
      const { postMessages: fetchedPostMessages } = await client.getPostMessagesByChannelId('channel-id');

      expect(fetchedPostMessages).toHaveLength(3);
    });

    it('filters out regular chat messages', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const getEvents = jest.fn().mockReturnValue([
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 1', msgtype: 'm.text' },
            event_id: 'message-id-1',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.post',
            content: { body: 'post message 1', msgtype: 'm.text' },
            event_id: 'post-message-id-1',
          }),
        },
        {
          getEffectiveEvent: () => ({
            type: 'm.room.message',
            content: { body: 'message 2', msgtype: 'm.text' },
            event_id: 'message-id-2',
          }),
        },
      ]);
      const getRoom = jest.fn().mockReturnValue(stubRoom({ getLiveTimeline: () => stubTimeline({ getEvents }) }));

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getUser, getRoom })) });

      await client.connect(null, 'token');
      const { postMessages: fetchedPostMessages } = await client.getPostMessagesByChannelId('channel-id');

      expect(fetchedPostMessages).toHaveLength(1);
      expect(fetchedPostMessages[0].message).toEqual('post message 1');
    });

    it('returns an empty array if no messages are found', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const createPostMessagesRequest = jest.fn().mockResolvedValue({ chunk: [] });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ createPostMessagesRequest, getUser })),
      });

      await client.connect(null, 'token');
      const { postMessages: fetchedMessages } = await client.getPostMessagesByChannelId('channel-id');

      expect(fetchedMessages).toHaveLength(0);
    });
  });

  describe('editMessage', () => {
    it('edits a message successfully', async () => {
      const originalMessageId = 'orig-message-id';
      const roomId = '!testRoomId';
      const editedMessage = 'edited message content';
      const updatedAtTimestamp = Date.now();

      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: 'edited-message-id',
        })
      );

      const fetchRoomEvent = jest.fn(() =>
        Promise.resolve({
          type: 'm.room.message',
          content: {
            body: editedMessage,
            msgtype: 'm.text',
            'm.relates_to': {
              rel_type: 'm.replace',
              event_id: originalMessageId,
            },
          },
          event_id: 'edited-message-id',
          user_id: '@testUser:zero-synapse-development.zer0.io',
          origin_server_ts: updatedAtTimestamp,
        })
      );

      const getSenderData = jest.fn(() =>
        Promise.resolve({
          displayName: 'Test User',
        })
      );

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ sendMessage, fetchRoomEvent, getUser: getSenderData })),
      });

      await client.connect(null, 'token');
      const result = await client.editMessage(roomId, originalMessageId, editedMessage, []);

      expect(result).toMatchObject({
        id: 'edited-message-id',
        message: editedMessage,
        updatedAt: updatedAtTimestamp,
      });
    });
  });

  describe('uploadFileMessage', () => {
    it('does not encrypt and sends a file message successfully in a non-encrypted room', async () => {
      const roomId = '!testRoomId';
      const optimisticId = 'optimistic-id';
      const rootMessageId = 'root-message-id';
      const media = {
        name: 'test-file',
        size: 1000,
        type: 'image/png',
      };

      when(mockGetImageDimensions).calledWith(expect.anything()).mockResolvedValue({ width: 800, height: 600 });
      when(mockGenerateBlurhash).calledWith(expect.anything()).mockResolvedValue('blurhash-string');

      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: 'new-message-id',
        })
      );

      const uploadContent = jest.fn().mockResolvedValue({ content_uri: 'upload-url' });
      const mxcUrlToHttp = jest.fn().mockReturnValue('upload-url');

      const client = subject({
        createClient: jest.fn(() =>
          getSdkClient({
            getRoom: jest.fn().mockReturnValue(stubRoom({ hasEncryptionStateEvent: jest.fn(() => false) })),
            sendMessage,
            uploadContent,
            mxcUrlToHttp,
          })
        ),
      });

      await client.connect(null, 'token');
      const result = await client.uploadFileMessage(roomId, media as File, rootMessageId, optimisticId);

      expect(sendMessage).toBeCalledWith(
        roomId,
        expect.objectContaining({
          body: '',
          msgtype: 'm.image',
          url: 'upload-url',
          info: {
            mimetype: 'image/png',
            size: 1000,
            name: 'test-file',
            optimisticId: 'optimistic-id',
            rootMessageId: 'root-message-id',
            width: 800,
            height: 600,
            w: 800,
            h: 600,
            'xyz.amorgan.blurhash': 'blurhash-string',
            thumbnail_url: null,
            thumbnail_info: null,
          },
          optimisticId: 'optimistic-id',
        })
      );

      expect(result).toMatchObject({
        id: 'new-message-id',
        optimisticId: optimisticId,
      });
    });

    it('encrypts and sends a file message successfully in an encrypted room', async () => {
      const roomId = '!testRoomId';
      const optimisticId = 'optimistic-id';
      const rootMessageId = 'root-message-id';
      const media = {
        name: 'test-file',
        size: 1000,
        type: 'image/png',
      };

      when(mockGetImageDimensions).calledWith(expect.anything()).mockResolvedValue({ width: 800, height: 600 });
      when(mockGenerateBlurhash).calledWith(expect.anything()).mockResolvedValue('blurhash-string');

      when(mockEncryptFile)
        .calledWith(expect.anything())
        .mockResolvedValue({
          file: { ...media },
          info: {
            hashes: { sha256: 'wfewfe' },
            iv: 'XH0bn67qTPsAAAAAAAAAAA',
            key: {},
            v: 'v2',
          },
        });

      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: 'new-message-id',
        })
      );

      const uploadContent = jest.fn().mockResolvedValue({ content_uri: 'upload-url' });

      const client = subject({
        createClient: jest.fn(() =>
          getSdkClient({
            getRoom: jest.fn().mockReturnValue(stubRoom({ hasEncryptionStateEvent: jest.fn(() => true) })),
            sendMessage,
            uploadContent,
          })
        ),
      });

      await client.connect(null, 'token');
      const result = await client.uploadFileMessage(roomId, media as File, rootMessageId, optimisticId);

      expect(sendMessage).toBeCalledWith(
        roomId,
        expect.objectContaining({
          body: '',
          msgtype: 'm.image',
          file: {
            url: 'upload-url',
            hashes: { sha256: 'wfewfe' },
            iv: 'XH0bn67qTPsAAAAAAAAAAA',
            key: {},
            v: 'v2',
          },
          info: {
            mimetype: 'image/png',
            size: 1000,
            name: 'test-file',
            optimisticId: 'optimistic-id',
            rootMessageId: 'root-message-id',
            width: 800,
            height: 600,
            w: 800,
            h: 600,
            'xyz.amorgan.blurhash': 'blurhash-string',
            thumbnail_url: null,
            thumbnail_info: null,
          },
          optimisticId: 'optimistic-id',
        })
      );

      expect(result).toMatchObject({
        id: 'new-message-id',
        optimisticId: optimisticId,
      });
    });

    it('sends a video message successfully in a non-encrypted room', async () => {
      const roomId = '!testRoomId';
      const optimisticId = 'optimistic-id';
      const rootMessageId = 'root-message-id';
      const media = { name: 'test-video.mp4', size: 1000, type: 'video/mp4' };

      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: 'new-message-id',
        })
      );

      const uploadContent = jest.fn().mockResolvedValue({ content_uri: 'upload-url' });
      const mxcUrlToHttp = jest.fn().mockReturnValue('upload-url');

      const client = subject({
        createClient: jest.fn(() =>
          getSdkClient({
            getRoom: jest.fn().mockReturnValue(stubRoom({ hasEncryptionStateEvent: jest.fn(() => false) })),
            sendMessage,
            uploadContent,
            mxcUrlToHttp,
          })
        ),
      });

      await client.connect(null, 'token');
      const result = await client.uploadFileMessage(roomId, media as File, rootMessageId, optimisticId);

      expect(sendMessage).toBeCalledWith(
        roomId,
        expect.objectContaining({
          body: '',
          msgtype: 'm.video',
          url: 'upload-url',
          info: {
            mimetype: 'video/mp4',
            size: 1000,
            name: 'test-video.mp4',
            optimisticId: 'optimistic-id',
            rootMessageId: 'root-message-id',
            thumbnail_url: null,
            thumbnail_info: null,
          },
          optimisticId: 'optimistic-id',
        })
      );

      expect(result).toMatchObject({
        id: 'new-message-id',
        optimisticId: optimisticId,
      });
    });
  });

  describe('uploadImageUrl', () => {
    it('sends an image URL message successfully in a non-encrypted room', async () => {
      const roomId = '!testRoomId';
      const url = 'http://example.com/image.gif';
      const width = 500;
      const height = 300;
      const size = 1500;
      const optimisticId = 'optimistic-id';
      const rootMessageId = 'root-message-id';

      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: 'new-message-id',
        })
      );

      const client = subject({
        createClient: jest.fn(() =>
          getSdkClient({
            getRoom: jest.fn().mockReturnValue(stubRoom({ hasEncryptionStateEvent: jest.fn(() => false) })),
            sendMessage,
          })
        ),
      });

      await client.connect(null, 'token');

      const result = await client.uploadImageUrl(roomId, url, width, height, size, rootMessageId, optimisticId);

      expect(sendMessage).toBeCalledWith(
        roomId,
        expect.objectContaining({
          body: '',
          msgtype: 'm.image',
          url: url,
          info: {
            mimetype: 'image/gif',
            w: width,
            h: height,
            size: size,
            optimisticId,
            rootMessageId,
          },
          optimisticId,
        })
      );

      expect(result).toMatchObject({
        id: 'new-message-id',
        optimisticId,
      });
    });

    it('sends an image URL message successfully in an encrypted room', async () => {
      const roomId = '!testRoomId';
      const url = 'http://example.com/image.gif';
      const width = 500;
      const height = 300;
      const size = 1500;
      const optimisticId = 'optimistic-id';
      const rootMessageId = 'root-message-id';

      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: 'new-message-id',
        })
      );

      const client = subject({
        createClient: jest.fn(() =>
          getSdkClient({
            getRoom: jest.fn().mockReturnValue(stubRoom({ hasEncryptionStateEvent: jest.fn(() => true) })),
            sendMessage,
          })
        ),
      });

      await client.connect(null, 'token');

      const result = await client.uploadImageUrl(roomId, url, width, height, size, rootMessageId, optimisticId);

      expect(sendMessage).toBeCalledWith(
        roomId,
        expect.objectContaining({
          body: null,
          msgtype: 'm.image',
          url: url,
          info: {
            mimetype: 'image/gif',
            w: width,
            h: height,
            size: size,
            optimisticId,
            rootMessageId,
          },
          optimisticId,
        })
      );

      expect(result).toMatchObject({
        id: 'new-message-id',
        optimisticId,
      });
    });
  });

  describe('uploadFile', () => {
    it('uploads a file successfully', async () => {
      const file: any = { name: 'some-file', type: 'text/plain' };

      const uploadContent = jest.fn(() =>
        Promise.resolve({
          content_uri: 'mxc://content-url',
        })
      );

      const client = subject({ createClient: jest.fn(() => getSdkClient({ uploadContent })) });

      await client.connect(null, 'token');
      const result = await client.uploadFile(file);

      expect(uploadContent).toHaveBeenCalledWith(file, {
        name: file.name,
        type: file.type,
        includeFilename: false,
      });

      expect(result).toBe('mxc://content-url');
    });
  });

  describe('downloadFile', () => {
    it('returns null if the fileUrl is null', async () => {
      const fileUrl = null;
      const client = subject({ createClient: jest.fn(() => getSdkClient({})) });
      await client.connect(null, 'token');
      const result = await client.downloadFile(fileUrl);

      expect(result).toBeNull();
    });

    it('returns the file url if it is not uploaded the homeserver', async () => {
      const fileUrl = 'http://aws-s3-bucket-1.com/file.txt';
      const client = subject({ createClient: jest.fn(() => getSdkClient({})) });
      await client.connect(null, 'token');
      const result = await client.downloadFile(fileUrl);

      expect(result).toBe(fileUrl);
    });
  });

  describe('setReadReceiptPreference', () => {
    it('sets read receipt preference successfully', async () => {
      const setAccountData = jest.fn().mockResolvedValue(undefined);

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ setAccountData })),
      });

      await client.connect(null, 'token');
      await client.setReadReceiptPreference(ReadReceiptPreferenceType.Public);

      expect(setAccountData).toHaveBeenCalledWith(MatrixConstants.READ_RECEIPT_PREFERENCE, {
        readReceipts: ReadReceiptPreferenceType.Public,
      });
    });
  });

  describe('getReadReceiptPreference', () => {
    it('gets read receipt preference successfully', async () => {
      const setAccountData = jest.fn().mockResolvedValue(undefined);

      const getAccountData = jest.fn().mockResolvedValue({
        event: { content: { readReceipts: ReadReceiptPreferenceType.Public } },
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ setAccountData, getAccountData })),
      });

      await client.connect(null, 'token');
      await client.setReadReceiptPreference(ReadReceiptPreferenceType.Public);

      const preference = await client.getReadReceiptPreference();
      expect(getAccountData).toHaveBeenCalledWith(MatrixConstants.READ_RECEIPT_PREFERENCE);
      expect(preference).toBe(ReadReceiptPreferenceType.Public);
    });

    it('returns default private preference on error', async () => {
      const getAccountData = jest.fn().mockRejectedValue({});

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getAccountData })),
      });

      await client.connect(null, 'token');

      // prevents error logging in output
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const preference = await client.getReadReceiptPreference();

      console.error = originalConsoleError;

      expect(getAccountData).toHaveBeenCalledWith(MatrixConstants.READ_RECEIPT_PREFERENCE);
      expect(preference).toBe(ReadReceiptPreferenceType.Private);
    });

    it('returns default private preference if not set', async () => {
      const getAccountData = jest.fn().mockResolvedValue({
        event: { content: {} },
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getAccountData })),
      });

      await client.connect(null, 'token');
      const preference = await client.getReadReceiptPreference();

      expect(getAccountData).toHaveBeenCalledWith(MatrixConstants.READ_RECEIPT_PREFERENCE);
      expect(preference).toBe(ReadReceiptPreferenceType.Private);
    });
  });

  describe('getMessageReadReceipts', () => {
    it('returns read receipts successfully for a specific message', async () => {
      const getUser = jest.fn().mockReturnValue({ displayName: 'Mock User' });
      const getEvents = jest.fn().mockReturnValue([
        {
          getId: jest.fn().mockReturnValue('event1'),
          getTs: jest.fn().mockReturnValue(1620000000000),
        },
        {
          getId: jest.fn().mockReturnValue('event2'),
          getTs: jest.fn().mockReturnValue(1620000001000),
        },
      ]);

      const eventReceiptsMap = new Map([
        ['event1', [{ userId: 'user1', type: 'm.read', data: { ts: 1620000000000 } }]],
        ['event2', [{ userId: 'user2', type: 'm.read', data: { ts: 1620000001000 } }]],
      ]);

      const getReceiptsForEvent = jest.fn((event) => eventReceiptsMap.get(event.getId()));

      const findEventById = jest.fn(() => ({
        getTs: jest.fn().mockReturnValue(1620000000000),
      }));

      const getRoom = jest.fn().mockReturnValue(
        stubRoom({
          getLiveTimeline: () => stubTimeline({ getEvents }),
          getReceiptsForEvent,
          findEventById,
        })
      );

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getUser, getRoom })) });

      await client.connect(null, 'token');
      const receipts = await client.getMessageReadReceipts('roomId', 'event2');

      expect(findEventById).toHaveBeenCalledWith('event2');
      expect(receipts).toEqual([
        { userId: 'user1', eventId: 'event1', ts: 1620000000000 },
        { userId: 'user2', eventId: 'event2', ts: 1620000001000 },
      ]);
    });

    it('returns an empty array if the room is not found', async () => {
      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRoom: jest.fn().mockReturnValue(null) })),
      });

      await client.connect(null, 'token');
      const receipts = await client.getMessageReadReceipts('roomId', 'event2');

      expect(receipts).toEqual([]);
    });

    it('returns an empty array if the event is not found', async () => {
      const getRoom = jest.fn().mockReturnValue(
        stubRoom({
          findEventById: jest.fn().mockReturnValue(null),
        })
      );

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom })) });

      await client.connect(null, 'token');
      const receipts = await client.getMessageReadReceipts('roomId', 'event2');

      expect(getRoom().findEventById).toHaveBeenCalledWith('event2');
      expect(receipts).toEqual([]);
    });
  });

  describe('markRoomAsRead', () => {
    it('marks room as read successfully', async () => {
      const roomId = '!testRoomId';
      const latestEventId = 'latest-event-id';
      const latestEvent = {
        event: { event_id: latestEventId },
      };

      const sendReadReceipt = jest.fn().mockResolvedValue(undefined);
      const setRoomReadMarkers = jest.fn().mockResolvedValue(undefined);
      const getLiveTimelineEvents = jest.fn().mockReturnValue([latestEvent]);
      const getRoom = jest.fn().mockReturnValue(
        stubRoom({
          getLiveTimeline: jest.fn().mockReturnValue(stubTimeline({ getEvents: getLiveTimelineEvents })),
        })
      );

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ sendReadReceipt, setRoomReadMarkers, getRoom })),
      });

      await client.connect(null, 'token');
      await client.markRoomAsRead(roomId);

      expect(sendReadReceipt).toHaveBeenCalledWith(latestEvent, ReceiptType.ReadPrivate);
      expect(setRoomReadMarkers).toHaveBeenCalledWith(roomId, latestEventId);
    });
  });

  describe('processSendReadReceipt', () => {
    let client;
    let room;
    let latestEvent;
    let sendReadReceipt;
    let getRoom;
    let getLiveTimelineEvents;

    beforeEach(async () => {
      const latestEventId = 'latest-event-id';

      latestEvent = {
        event: {
          event_id: latestEventId,
          content: {},
        },
      };

      sendReadReceipt = jest.fn().mockResolvedValue(undefined);
      getLiveTimelineEvents = jest.fn().mockReturnValue([latestEvent]);
      room = stubRoom({
        getLiveTimeline: jest.fn().mockReturnValue(stubTimeline({ getEvents: getLiveTimelineEvents })),
        findEventById: jest.fn(),
      });

      getRoom = jest.fn().mockReturnValue(room);

      client = subject({
        createClient: jest.fn(() => getSdkClient({ sendReadReceipt, getRoom })),
      });

      await client.connect(null, 'token');
    });

    it('sends read receipt for non-edited event', async () => {
      await client.processSendReadReceipt(room, latestEvent, ReceiptType.ReadPrivate);

      expect(sendReadReceipt).toHaveBeenCalledWith(latestEvent, ReceiptType.ReadPrivate);
    });

    it('sends read receipt for original event if latest event is an edit', async () => {
      const originalEventId = 'original-event-id';
      const originalEvent = { event_id: originalEventId };
      latestEvent.event.content['m.relates_to'] = {
        rel_type: 'm.replace',
        event_id: originalEventId,
      };
      room.findEventById.mockReturnValue(originalEvent);

      await client.processSendReadReceipt(room, latestEvent, ReceiptType.ReadPrivate);

      expect(room.findEventById).toHaveBeenCalledWith(originalEventId);
      expect(sendReadReceipt).toHaveBeenCalledWith(originalEvent, ReceiptType.ReadPrivate);
    });

    it('sends read receipt for latest event if original event is not found', async () => {
      latestEvent.event.content['m.relates_to'] = {
        rel_type: 'm.replace',
        event_id: 'non-existent-event-id',
      };
      room.findEventById.mockReturnValue(null);

      await client.processSendReadReceipt(room, latestEvent, ReceiptType.ReadPrivate);

      expect(sendReadReceipt).toHaveBeenCalledWith(latestEvent, ReceiptType.ReadPrivate);
    });
  });

  describe('getAliasForRoomId', () => {
    it('returns alias for room ID', async () => {
      const aliases = { aliases: ['#test-room:zos-dev.zero.io'] };
      const getLocalAliases = jest.fn().mockResolvedValue(aliases);

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getLocalAliases })),
      });

      await client.connect(null, 'token');
      const result = await client.getAliasForRoomId('!heExvpcoNDAMAPMsRd:zos-dev.zero.io');

      expect(result).toEqual('test-room');
    });

    it('returns undefined if room has no aliases', async () => {
      const getLocalAliases = jest.fn().mockResolvedValue({ aliases: [] });
      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getLocalAliases })),
      });

      await client.connect(null, 'token');
      const result = await client.getAliasForRoomId('!heExvpcoNDAMAPMsRd:zos-dev.zero.io');

      expect(result).toBeUndefined();
    });

    it('returns undefined if forbidden to access room (M_FORBIDDEN)', async () => {
      const getLocalAliases = jest.fn().mockRejectedValue({ errcode: 'M_FORBIDDEN' });
      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getLocalAliases })),
      });

      await client.connect(null, 'token');
      const result = await client.getAliasForRoomId('!heExvpcoNDAMAPMsRd:zos-dev.zero.io');

      expect(result).toBeUndefined();
    });

    it('returns undefined if room is unknown (M_UNKNOWN)', async () => {
      const getLocalAliases = jest.fn().mockRejectedValue({ errcode: 'M_UNKNOWN' });
      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getLocalAliases })),
      });

      await client.connect(null, 'token');
      const result = await client.getAliasForRoomId('!heExvpcoNDAMAPMsRd:zos-dev.zero.io');

      expect(result).toBeUndefined();
    });
  });

  describe('getRoomIdForAlias', () => {
    it('returns room ID for alias', async () => {
      const roomId = '!heExvpcoNDAMAPMsRd:zos-dev.zero.io';
      const getRoomIdForAlias = jest.fn().mockResolvedValue({ room_id: roomId });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRoomIdForAlias })),
      });

      await client.connect(null, 'token');
      const result = await client.getRoomIdForAlias('#test-room:zos-dev.zero.io');

      expect(result).toEqual(roomId);
    });

    it('returns undefined if room alias is not found (M_NOT_FOUND)', async () => {
      const getRoomIdForAlias = jest.fn().mockRejectedValue({ errcode: 'M_NOT_FOUND' });
      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRoomIdForAlias })),
      });

      await client.connect(null, 'token');
      const result = await client.getRoomIdForAlias('#test-room:zos-dev.zero.io');

      expect(result).toBeUndefined();
    });
  });

  describe('addRoomToLabel', () => {
    it('sets room tag with the specified label', async () => {
      const setRoomTag = jest.fn().mockResolvedValue({});

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ setRoomTag })),
      });

      await client.connect(null, 'token');
      await client.addRoomToLabel('channel-id', DefaultRoomLabels.WORK);

      expect(setRoomTag).toHaveBeenCalledWith('channel-id', DefaultRoomLabels.WORK);
    });
  });

  describe('removeRoomFromLabel', () => {
    it('deletes the specified label tag from room', async () => {
      const deleteRoomTag = jest.fn().mockResolvedValue({});

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ deleteRoomTag })),
      });

      await client.connect(null, 'token');
      await client.removeRoomFromLabel('channel-id', DefaultRoomLabels.WORK);

      expect(deleteRoomTag).toHaveBeenCalledWith('channel-id', DefaultRoomLabels.WORK);
    });
  });

  describe('getRoomTags', () => {
    it('returns correct tags for all rooms', async () => {
      const conversations = [
        { id: 'room1', labels: [] },
        { id: 'room2', labels: [] },
      ];

      const getRoomTags = jest
        .fn()
        .mockResolvedValueOnce({ tags: { 'm.favorite': {}, 'm.mute': {}, 'm.work': {}, 'm.family': {} } })
        .mockResolvedValueOnce({ tags: {} });

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoomTags })) });

      await client.connect(null, 'token');
      await client.getRoomTags(conversations);

      expect(getRoomTags).toHaveBeenCalledWith('room1');
      expect(getRoomTags).toHaveBeenCalledWith('room2');
      expect(conversations).toEqual([
        {
          id: 'room1',
          labels: [
            'm.favorite',
            'm.mute',
            'm.work',
            'm.family',
          ],
        },
        { id: 'room2', labels: [] },
      ]);
    });
  });

  describe('getPostMessageReactions', () => {
    it('returns the correct reactions for a room', async () => {
      const mockGetRoom = jest.fn().mockReturnValue({
        getLiveTimeline: jest.fn().mockReturnValue({
          getEvents: jest.fn().mockReturnValue([
            {
              getType: () => MatrixConstants.REACTION,
              getContent: () => ({
                [MatrixConstants.RELATES_TO]: {
                  event_id: 'message-1',
                  key: ReactionKeys.MEOW,
                },
                amount: 5,
              }),
            },

            {
              getType: () => 'm.room.message',
              getContent: () => ({
                body: 'This is a regular message',
              }),
            },
          ]),
        }),
      });

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

      await client.connect(null, 'token');
      const reactions = await client.getPostMessageReactions('room-id');

      expect(mockGetRoom).toHaveBeenCalledWith('room-id');
      expect(reactions).toEqual([
        {
          eventId: 'message-1',
          key: ReactionKeys.MEOW,
          amount: 5,
        },
      ]);
    });

    it('returns an empty array if the room is not found', async () => {
      const mockGetRoom = jest.fn().mockReturnValue(null);

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

      await client.connect(null, 'token');
      const reactions = await client.getPostMessageReactions('room-id');

      expect(mockGetRoom).toHaveBeenCalledWith('room-id');
      expect(reactions).toEqual([]);
    });

    it('returns an empty array if there are no reaction events', async () => {
      const mockGetRoom = jest.fn().mockReturnValue({
        getLiveTimeline: jest.fn().mockReturnValue({
          getEvents: jest.fn().mockReturnValue([
            {
              getType: () => 'm.room.message', // No reaction events
              getContent: () => ({
                body: 'This is a regular message',
              }),
            },
          ]),
        }),
      });

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

      await client.connect(null, 'token');
      const reactions = await client.getPostMessageReactions('room-id');

      expect(mockGetRoom).toHaveBeenCalledWith('room-id');
      expect(reactions).toEqual([]);
    });
  });

  it('filters out invalid reaction events', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const mockGetRoom = jest.fn().mockReturnValue({
      getLiveTimeline: jest.fn().mockReturnValue({
        getEvents: jest.fn().mockReturnValue([
          {
            getType: () => MatrixConstants.REACTION,
            getContent: () => ({
              // Missing the required RELATES_TO properties
            }),
          },
          {
            getType: () => MatrixConstants.REACTION,
            getContent: () => ({
              [MatrixConstants.RELATES_TO]: {
                key: ReactionKeys.MEOW, // Missing event_id
              },
              amount: 5,
            }),
          },
          {
            getType: () => MatrixConstants.REACTION,
            getContent: () => ({
              [MatrixConstants.RELATES_TO]: {
                event_id: 'message-2',
                key: ReactionKeys.MEOW,
              },
              amount: 3,
            }),
          },
        ]),
      }),
    });

    const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

    await client.connect(null, 'token');
    const reactions = await client.getPostMessageReactions('room-id');

    expect(mockGetRoom).toHaveBeenCalledWith('room-id');
    expect(reactions).toEqual([
      {
        eventId: 'message-2',
        key: ReactionKeys.MEOW,
        amount: 3,
      },
    ]);

    // Restore console.warn after the test
    consoleWarnSpy.mockRestore();
  });

  describe('getMessageEmojiReactions', () => {
    it('returns the correct reactions for a room', async () => {
      const mockGetRoom = jest.fn().mockReturnValue({
        getLiveTimeline: jest.fn().mockReturnValue({
          getEvents: jest.fn().mockReturnValue([
            {
              getType: () => MatrixConstants.REACTION,
              getContent: () => ({
                [MatrixConstants.RELATES_TO]: {
                  event_id: 'message-1',
                  key: '😂',
                },
              }),
            },

            {
              getType: () => 'm.room.message',
              getContent: () => ({
                body: 'This is a regular message',
              }),
            },
          ]),
        }),
      });

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

      await client.connect(null, 'token');
      const reactions = await client.getMessageEmojiReactions('room-id');

      expect(mockGetRoom).toHaveBeenCalledWith('room-id');
      expect(reactions).toEqual([
        {
          eventId: 'message-1',
          key: '😂',
        },
      ]);
    });

    it('returns an empty array if the room is not found', async () => {
      const mockGetRoom = jest.fn().mockReturnValue(null);

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

      await client.connect(null, 'token');
      const reactions = await client.getMessageEmojiReactions('room-id');

      expect(mockGetRoom).toHaveBeenCalledWith('room-id');
      expect(reactions).toEqual([]);
    });

    it('returns an empty array if there are no reaction events', async () => {
      const mockGetRoom = jest.fn().mockReturnValue({
        getLiveTimeline: jest.fn().mockReturnValue({
          getEvents: jest.fn().mockReturnValue([
            {
              getType: () => 'm.room.message', // No reaction events
              getContent: () => ({
                body: 'This is a regular message',
              }),
            },
          ]),
        }),
      });

      const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

      await client.connect(null, 'token');
      const reactions = await client.getMessageEmojiReactions('room-id');

      expect(mockGetRoom).toHaveBeenCalledWith('room-id');
      expect(reactions).toEqual([]);
    });
  });

  it('filters out invalid reaction events', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const mockGetRoom = jest.fn().mockReturnValue({
      getLiveTimeline: jest.fn().mockReturnValue({
        getEvents: jest.fn().mockReturnValue([
          {
            getType: () => MatrixConstants.REACTION,
            getContent: () => ({
              // Missing the required RELATES_TO properties
            }),
          },
          {
            getType: () => MatrixConstants.REACTION,
            getContent: () => ({
              [MatrixConstants.RELATES_TO]: {
                key: '😂', // Missing event_id
              },
            }),
          },
          {
            getType: () => MatrixConstants.REACTION,
            getContent: () => ({
              [MatrixConstants.RELATES_TO]: {
                event_id: 'message-2',
                key: '😂',
              },
            }),
          },
        ]),
      }),
    });

    const client = subject({ createClient: jest.fn(() => getSdkClient({ getRoom: mockGetRoom })) });

    await client.connect(null, 'token');
    const reactions = await client.getMessageEmojiReactions('room-id');

    expect(mockGetRoom).toHaveBeenCalledWith('room-id');
    expect(reactions).toEqual([
      {
        eventId: 'message-2',
        key: '😂',
      },
    ]);

    // Restore console.warn after the test
    consoleWarnSpy.mockRestore();
  });
});
