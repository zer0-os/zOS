import { EventType, GuestAccess, Preset, Visibility } from 'matrix-js-sdk';
import { MatrixClient } from './matrix-client';
import { setAsDM } from './matrix/utils';
import { uploadImage as _uploadImage } from '../../store/channels-list/api';
import { when } from 'jest-when';
import { config } from '../../config';
import { PowerLevels } from './types';

jest.mock('./matrix/utils', () => ({ setAsDM: jest.fn().mockResolvedValue(undefined) }));

const mockUploadImage = jest.fn();
jest.mock('../../store/channels-list/api', () => {
  return { uploadImage: (...args) => mockUploadImage(...args) };
});

const mockEncryptFile = jest.fn();
jest.mock('./matrix/media', () => {
  return { encryptFile: (...args) => mockEncryptFile(...args) };
});

const mockUploadAttachment = jest.fn();
jest.mock('../../store/messages/api', () => {
  return { uploadAttachment: (...args) => mockUploadAttachment(...args) };
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
  setGlobalErrorOnUnknownDevices: () => undefined,
  fetchRoomEvent: jest.fn(),
  paginateEventTimeline: () => true,
  isRoomEncrypted: () => true,
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

jest.mock('../../lib/feature-flags', () => ({
  featureFlags: { verboseLogging: false },
}));

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

    it('set the appropriate defaul power_levels in group conversation', async () => {
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
            invite: PowerLevels.Owner,
            kick: PowerLevels.Owner,
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
    it('logs warning if room is not encrypted and returns ', async () => {
      const roomId = '!testRoomId';
      const optimisticId = 'optimistic-id';
      const rootMessageId = 'root-message-id';

      const isRoomEncrypted = jest.fn(() => false);

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ isRoomEncrypted })),
      });

      await client.connect(null, 'token');
      client.uploadFileMessage(roomId, {} as File, rootMessageId, optimisticId);

      expect(mockEncryptFile).not.toHaveBeenCalled();
    });

    it('sends a file message successfully', async () => {
      // const originalMessageId = 'orig-message-id';
      const roomId = '!testRoomId';
      const optimisticId = 'optimistic-id';
      const rootMessageId = 'root-message-id';
      const media = {
        name: 'test-file',
        size: 1000,
        type: 'image/png',
      };

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

      when(mockUploadAttachment).calledWith(expect.anything()).mockResolvedValue({
        name: 'test-file',
        key: 'attachments/../test.jpg',
        url: 'attachments/../test.jpg',
        type: 'file',
      });

      const sendMessage = jest.fn(() =>
        Promise.resolve({
          event_id: 'new-message-id',
        })
      );

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ sendMessage })),
      });

      await client.connect(null, 'token');
      const result = await client.uploadFileMessage(roomId, media as File, rootMessageId, optimisticId);

      expect(sendMessage).toBeCalledWith(
        roomId,
        expect.objectContaining({
          body: null,
          msgtype: 'm.image',
          file: {
            url: 'attachments/../test.jpg',
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

      expect(sendReadReceipt).toHaveBeenCalledWith(latestEvent);
      expect(setRoomReadMarkers).toHaveBeenCalledWith(roomId, latestEventId);
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

  describe('addRoomToFavorites', () => {
    it('sets room tag with "m.favorite"', async () => {
      const roomId = '!testRoomId';
      const setRoomTag = jest.fn().mockResolvedValue({});

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ setRoomTag })),
      });

      await client.connect(null, 'token');
      await client.addRoomToFavorites(roomId);

      expect(setRoomTag).toHaveBeenCalledWith(roomId, 'm.favorite');
    });
  });

  describe('removeRoomFromFavorites', () => {
    it('deletes "m.favorite" tag from room', async () => {
      const roomId = '!testRoomId';
      const deleteRoomTag = jest.fn().mockResolvedValue({});

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ deleteRoomTag })),
      });

      await client.connect(null, 'token');
      await client.removeRoomFromFavorites(roomId);

      expect(deleteRoomTag).toHaveBeenCalledWith(roomId, 'm.favorite');
    });
  });

  describe('isRoomFavorited', () => {
    it('returns true if "m.favorite" tag is present for room', async () => {
      const roomId = '!testRoomId';
      const getRoomTags = jest.fn().mockResolvedValue({
        tags: {
          'm.favorite': {},
        },
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRoomTags })),
      });

      await client.connect(null, 'token');
      const isFavorite = await client.isRoomFavorited(roomId);

      expect(getRoomTags).toHaveBeenCalledWith(roomId);
      expect(isFavorite).toBe(true);
    });

    it('returns false if "m.favorite" tag is not present for room', async () => {
      const roomId = '!testRoomId';
      const getRoomTags = jest.fn().mockResolvedValue({
        tags: {},
      });

      const client = subject({
        createClient: jest.fn(() => getSdkClient({ getRoomTags })),
      });

      await client.connect(null, 'token');
      const isFavorite = await client.isRoomFavorited(roomId);

      expect(getRoomTags).toHaveBeenCalledWith(roomId);
      expect(isFavorite).toBe(false);
    });
  });
});
