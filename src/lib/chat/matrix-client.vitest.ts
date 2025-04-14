import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixClient } from './matrix-client';
import {
  ConnectionStatus,
  MatrixConstants,
  ReadReceiptPreferenceType,
  ReactionKeys,
  CustomEventType,
} from './matrix/types';
import { EventType, MsgType, ReceiptType } from 'matrix-js-sdk/lib/matrix';
import { PowerLevels } from './types';
import { RelationType } from 'matrix-js-sdk/lib/@types/event';

// Mock matrix-js-sdk
vi.mock('matrix-js-sdk/lib/matrix', async () => {
  const actual = await vi.importActual('matrix-js-sdk/lib/matrix');
  return {
    ...actual,
    createClient: vi.fn(),
  };
});

// Mock dependencies
vi.mock('./matrix/media', () => ({
  encryptFile: vi.fn().mockResolvedValue({
    file: { name: 'test-file', type: 'image/png', size: 1000 },
    info: {
      hashes: { sha256: 'sha256hash' },
      iv: 'iv-string',
      key: { k: 'key-data' },
      v: 'v2',
    },
  }),
  getImageDimensions: vi.fn().mockResolvedValue({ width: 800, height: 600 }),
  generateBlurhash: vi.fn().mockResolvedValue('blurhash-string'),
  isFileUploadedToMatrix: vi.fn((url) => url?.startsWith('mxc://')),
}));

vi.mock('../storage/media-cache', () => ({
  putFileToCache: vi.fn(),
  getFileFromCache: vi.fn().mockResolvedValue(null),
}));

vi.mock('./matrix/chat-message', () => ({
  mapEventToAdminMessage: vi.fn((event) => ({
    id: event.event_id || 'admin-message-id',
    senderId: event.user_id || event.sender || 'admin-sender',
    type: 'admin',
    timestamp: event.origin_server_ts || Date.now(),
    adminType: 'create_room',
  })),
  mapEventToPostMessage: vi.fn((event) => ({
    id: event.event_id || 'post-message-id',
    senderId: event.user_id || event.sender || 'post-sender',
    type: 'post',
    message: event.content?.body || 'Post message content',
    timestamp: event.origin_server_ts || Date.now(),
  })),
  mapMatrixMessage: vi.fn((event) => ({
    id: event.event_id || 'message-id',
    senderId: event.user_id || event.sender || 'message-sender',
    type: 'message',
    message: event.content?.body || 'Message content',
    timestamp: event.origin_server_ts || Date.now(),
  })),
  mapToLiveRoomEvent: vi.fn((event) => ({
    id: event.getId?.() || 'live-event-id',
    type: event.getType?.() || 'message',
    content: event.getContent?.() || {},
    roomId: event.getRoomId?.() || 'room-id',
  })),
}));

vi.mock('../api/rest', () => ({
  post: vi.fn().mockReturnValue({
    send: vi.fn().mockReturnValue({
      catch: vi.fn().mockReturnValue(Promise.resolve()),
      then: vi.fn().mockImplementation((cb) => Promise.resolve(cb({ body: [] }))),
    }),
  }),
}));

vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

// Helper functions to create test stubs
const createMockRoom = (overrides = {}) => ({
  roomId: 'test-room-id',
  name: 'Test Room',
  getMembers: vi.fn().mockReturnValue([]),
  getCreator: vi.fn().mockReturnValue('creator-user-id'),
  getLiveTimeline: vi.fn().mockReturnValue({
    getEvents: vi.fn().mockReturnValue([]),
    getState: vi.fn().mockReturnValue({
      getStateEvents: vi.fn().mockReturnValue(null),
    }),
  }),
  loadMembersIfNeeded: vi.fn().mockResolvedValue(undefined),
  decryptAllEvents: vi.fn().mockResolvedValue(undefined),
  getMyMembership: vi.fn().mockReturnValue('join'),
  findEventById: vi.fn(),
  getReceiptsForEvent: vi.fn().mockReturnValue([]),
  hasEncryptionStateEvent: vi.fn().mockReturnValue(false),
  getInvitedAndJoinedMemberCount: vi.fn().mockReturnValue(2),
  on: vi.fn(),
  ...overrides,
});

const createMockMatrixClient = (overrides = {}) => ({
  startClient: vi.fn().mockResolvedValue(undefined),
  initRustCrypto: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  removeAllListeners: vi.fn(),
  clearStores: vi.fn().mockResolvedValue(undefined),
  store: { destroy: vi.fn().mockResolvedValue(undefined) },
  getAccessToken: vi.fn().mockReturnValue('test-access-token'),
  getRoom: vi.fn().mockImplementation((roomId) => createMockRoom({ roomId })),
  getRooms: vi.fn().mockReturnValue([createMockRoom()]),
  getJoinedRooms: vi.fn().mockResolvedValue({ joined_rooms: ['test-room-id'] }),
  on: vi.fn((event, callback) => {
    if (event === 'sync') {
      callback('PREPARED');
    }
    return { removeListener: vi.fn() };
  }),
  getCrypto: vi.fn().mockReturnValue({
    globalBlacklistUnverifiedDevices: false,
    checkKeyBackupAndEnable: vi.fn().mockResolvedValue({
      backupInfo: { version: '1' },
      trustInfo: { trusted: true },
    }),
    userHasCrossSigningKeys: vi.fn().mockResolvedValue(true),
  }),
  createRoom: vi.fn().mockResolvedValue({ room_id: 'new-room-id' }),
  invite: vi.fn().mockResolvedValue({}),
  sendMessage: vi.fn().mockResolvedValue({ event_id: 'message-id' }),
  sendEvent: vi.fn().mockResolvedValue({ event_id: 'event-id' }),
  uploadContent: vi.fn().mockResolvedValue({ content_uri: 'mxc://test-url' }),
  mxcUrlToHttp: vi.fn((url) => `http://example.com/${url.split('/').pop()}`),
  paginateEventTimeline: vi.fn().mockResolvedValue(true),
  fetchRoomEvent: vi.fn().mockResolvedValue({
    event_id: 'fetched-event-id',
    content: { body: 'Fetched message' },
    origin_server_ts: Date.now(),
  }),
  sendStateEvent: vi.fn().mockResolvedValue({}),
  setRoomName: vi.fn().mockResolvedValue({}),
  setDisplayName: vi.fn().mockResolvedValue({}),
  setAvatarUrl: vi.fn().mockResolvedValue({}),
  getProfileInfo: vi.fn().mockResolvedValue({
    displayname: 'Test User',
    avatar_url: 'mxc://avatar-url',
  }),
  redactEvent: vi.fn().mockResolvedValue({}),
  getLocalAliases: vi.fn().mockResolvedValue({ aliases: ['#test-room:matrix.org'] }),
  getRoomIdForAlias: vi.fn().mockResolvedValue({ room_id: 'room-id-for-alias' }),
  setRoomTag: vi.fn().mockResolvedValue({}),
  deleteRoomTag: vi.fn().mockResolvedValue({}),
  sendTyping: vi.fn().mockResolvedValue({}),
  sendReadReceipt: vi.fn().mockResolvedValue({}),
  setRoomReadMarkers: vi.fn().mockResolvedValue({}),
  loginRequest: vi.fn().mockResolvedValue({
    user_id: '@test:matrix.org',
    device_id: 'test-device',
    access_token: 'test-access-token',
  }),
  ...overrides,
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock global fetch
global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn((blob) => `blob:${Math.random()}`);

describe('MatrixClient', () => {
  let matrixClient;
  let mockCreateClient;
  let mockSessionStorage;
  let mockMatrix;
  let events;

  beforeEach(() => {
    mockMatrix = createMockMatrixClient();
    mockCreateClient = vi.fn().mockReturnValue(mockMatrix);

    mockSessionStorage = {
      get: vi.fn().mockReturnValue({
        userId: '@test:matrix.org',
        deviceId: 'test-device',
        accessToken: 'test-access-token',
      }),
      set: vi.fn(),
      clear: vi.fn(),
    };

    events = {
      receiveNewMessage: vi.fn(),
      receiveDeleteMessage: vi.fn(),
      onMessageUpdated: vi.fn(),
      onUserJoinedChannel: vi.fn(),
      onUserLeft: vi.fn(),
      onRoomNameChanged: vi.fn(),
      onRoomAvatarChanged: vi.fn(),
      onRoomGroupTypeChanged: vi.fn(),
      receiveUnreadCount: vi.fn(),
      onOtherUserJoinedChannel: vi.fn(),
      onOtherUserLeftChannel: vi.fn(),
      receiveLiveRoomEvent: vi.fn(),
      roomMemberTyping: vi.fn(),
      roomMemberPowerLevelChanged: vi.fn(),
      readReceiptReceived: vi.fn(),
      roomLabelChange: vi.fn(),
      messageEmojiReactionChange: vi.fn(),
      receiveRoomData: vi.fn(),
    };

    matrixClient = new MatrixClient({ createClient: mockCreateClient }, mockSessionStorage);
    matrixClient.init(events);
  });

  describe('connect', () => {
    it('initializes client with stored credentials and connects', async () => {
      await matrixClient.connect('@test:matrix.org', 'test-access-token');

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: expect.any(String),
          userId: '@test:matrix.org',
          deviceId: 'test-device',
          accessToken: 'test-access-token',
        })
      );

      expect(mockMatrix.startClient).toHaveBeenCalled();
      expect(matrixClient.userId).toBe('@test:matrix.org');
    });

    it('handles connection errors properly', async () => {
      const error = new Error('Connection failed');
      mockMatrix.startClient.mockRejectedValueOnce(error);

      await expect(matrixClient.connect('@test:matrix.org', 'test-access-token')).rejects.toThrow(error);
      expect(matrixClient.connectionStatus).toBe(ConnectionStatus.Connecting);
    });

    it('creates new session if none exists', async () => {
      mockSessionStorage.get.mockReturnValueOnce(null);
      const loginResponse = {
        user_id: '@new-user:matrix.org',
        device_id: 'new-device',
        access_token: 'new-access-token',
      };

      const tempClient = { loginRequest: vi.fn().mockResolvedValueOnce(loginResponse) };
      mockCreateClient.mockReturnValueOnce(tempClient).mockReturnValueOnce(mockMatrix);

      await matrixClient.connect('@new-user:matrix.org', 'test-access-token');

      expect(mockSessionStorage.set).toHaveBeenCalledWith({
        userId: '@new-user:matrix.org',
        deviceId: 'new-device',
        accessToken: 'new-access-token',
      });
    });
  });

  describe('disconnect', () => {
    it('logs out and cleans up resources', async () => {
      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.disconnect();

      expect(mockMatrix.logout).toHaveBeenCalledWith(true);
      expect(mockMatrix.removeAllListeners).toHaveBeenCalled();
      expect(mockMatrix.clearStores).toHaveBeenCalled();
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });

  describe('message handling', () => {
    it('processes raw events to messages correctly', async () => {
      const events = [
        {
          type: EventType.RoomMessage,
          content: { body: 'Test message', msgtype: MsgType.Text },
          event_id: 'message-1',
          origin_server_ts: 1000,
          sender: '@user:example.org',
        },
        {
          type: EventType.RoomCreate,
          content: { creator: '@creator:example.org' },
          event_id: 'create-event',
          origin_server_ts: 2000,
          sender: '@creator:example.org',
        },
        {
          type: EventType.RoomMessage,
          content: {
            'm.relates_to': {
              rel_type: RelationType.Replace,
              event_id: 'original-message',
            },
            'm.new_content': {
              body: 'Edited message',
              msgtype: MsgType.Text,
            },
          },
          event_id: 'edit-event',
          origin_server_ts: 3000,
          sender: '@user:example.org',
        },
      ];

      const messages = await matrixClient.processRawEventsToMessages(events);

      // Should result in 2 messages (skipping the edit event)
      expect(messages.length).toBe(2);
    });

    it('applies edit events to existing messages', async () => {
      const originalEvent = {
        type: EventType.RoomMessage,
        content: { body: 'Original message', msgtype: MsgType.Text },
        event_id: 'original-message',
        origin_server_ts: 1000,
        sender: '@user:example.org',
      };

      const editEvent = {
        type: EventType.RoomMessage,
        content: {
          body: '* Edited message',
          msgtype: MsgType.Text,
          'm.relates_to': {
            rel_type: RelationType.Replace,
            event_id: 'original-message',
          },
          'm.new_content': {
            body: 'Edited message',
            msgtype: MsgType.Text,
          },
        },
        event_id: 'edit-event',
        origin_server_ts: 2000,
        sender: '@user:example.org',
      };

      const messages = await matrixClient.processRawEventsToMessages([originalEvent, editEvent]);

      // Should have applied the edit to the original message
      expect(messages.length).toBe(1);
      expect(messages[0].id).toBe('original-message');
      expect(messages[0].updatedAt).toBe(2000);
    });

    it('sends text messages successfully', async () => {
      const channelId = 'room-id';
      const message = 'Hello world';

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      const result = await matrixClient.sendMessagesByChannelId(channelId, message, [], null, null, 'optimistic-id');

      expect(mockMatrix.sendMessage).toHaveBeenCalledWith(
        channelId,
        expect.objectContaining({
          body: message,
          msgtype: MsgType.Text,
          optimisticId: 'optimistic-id',
        })
      );

      expect(result).toEqual({
        id: 'message-id',
        optimisticId: 'optimistic-id',
      });
    });

    it('sends a reply message correctly', async () => {
      const channelId = 'room-id';
      const message = 'Hello world';
      const parentMessage = {
        messageId: 'parent-id',
        text: 'Parent message',
        sender: 'Parent Sender',
      };

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.sendMessagesByChannelId(channelId, message, [], parentMessage, null, 'optimistic-id');

      expect(mockMatrix.sendMessage).toHaveBeenCalledWith(
        channelId,
        expect.objectContaining({
          body: expect.stringContaining(message),
          msgtype: MsgType.Text,
          optimisticId: 'optimistic-id',
          'm.relates_to': {
            'm.in_reply_to': {
              event_id: 'parent-id',
            },
          },
        })
      );
    });

    it('edits messages correctly', async () => {
      const roomId = 'room-id';
      const messageId = 'message-id';
      const newText = 'Edited message';

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.editMessage(roomId, messageId, newText, []);

      expect(mockMatrix.sendMessage).toHaveBeenCalledWith(
        roomId,
        expect.objectContaining({
          body: newText,
          msgtype: MsgType.Text,
          [MatrixConstants.NEW_CONTENT]: {
            msgtype: MsgType.Text,
            body: newText,
          },
          [MatrixConstants.RELATES_TO]: {
            rel_type: RelationType.Replace,
            event_id: messageId,
          },
        })
      );
    });

    it('deletes messages correctly', async () => {
      const roomId = 'room-id';
      const messageId = 'message-id';

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.deleteMessageByRoomId(roomId, messageId);

      expect(mockMatrix.redactEvent).toHaveBeenCalledWith(roomId, messageId);
    });
  });

  describe('file handling', () => {
    it('uploads files correctly', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      const result = await matrixClient.uploadFile(file);

      expect(mockMatrix.uploadContent).toHaveBeenCalledWith(file, {
        name: 'test.txt',
        type: 'text/plain',
        includeFilename: false,
      });

      expect(result).toBe('mxc://test-url');
    });

    it('handles encrypted file upload in encrypted rooms', async () => {
      const roomId = 'encrypted-room-id';
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const optimisticId = 'optimistic-id';

      // Mock the room to be encrypted
      mockMatrix.getRoom.mockImplementationOnce(() =>
        createMockRoom({
          roomId,
          hasEncryptionStateEvent: vi.fn().mockReturnValue(true),
        })
      );

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.uploadFileMessage(roomId, file, '', optimisticId);

      // Should have uploaded encrypted content
      expect(mockMatrix.uploadContent).toHaveBeenCalled();
      expect(mockMatrix.sendMessage).toHaveBeenCalledWith(
        roomId,
        expect.objectContaining({
          msgtype: MsgType.Image,
          file: expect.objectContaining({
            url: 'mxc://test-url',
          }),
          info: expect.objectContaining({
            mimetype: 'image/jpeg',
            width: 800,
            height: 600,
            'xyz.amorgan.blurhash': 'blurhash-string',
          }),
        })
      );
    });

    it('downloads files from matrix server with authentication', async () => {
      const fileUrl = 'mxc://example.com/file-id';
      const blobUrl = 'blob:1234';

      // Mock successful fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['test content'])),
      });

      // Mock URL.createObjectURL
      global.URL.createObjectURL.mockReturnValueOnce(blobUrl);

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      const result = await matrixClient.downloadFile(fileUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://example.com/file-id',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-access-token' },
        })
      );

      expect(result).toBe(blobUrl);
    });

    it('returns original URL for non-matrix files', async () => {
      const fileUrl = 'https://example.com/file.jpg';

      // Reset fetch mock before this test
      global.fetch.mockReset();

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      const result = await matrixClient.downloadFile(fileUrl);

      expect(result).toBe(fileUrl);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('room management', () => {
    it('marks a room as read correctly', async () => {
      const roomId = 'room-id';
      const latestEvent = {
        event: { event_id: 'latest-event-id' },
        getId: vi.fn().mockReturnValue('latest-event-id'),
      };

      // Mock room with events
      mockMatrix.getRoom.mockImplementationOnce(() =>
        createMockRoom({
          roomId,
          getLiveTimeline: vi.fn().mockReturnValue({
            getEvents: vi.fn().mockReturnValue([latestEvent]),
          }),
        })
      );

      // Set up localStorage for read receipt preference
      localStorageMock.getItem.mockReturnValueOnce(ReadReceiptPreferenceType.Private);

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.markRoomAsRead(roomId);

      expect(mockMatrix.sendReadReceipt).toHaveBeenCalledWith(latestEvent, ReceiptType.ReadPrivate);
      expect(mockMatrix.setRoomReadMarkers).toHaveBeenCalledWith(roomId, 'latest-event-id');
    });

    it('gets room alias correctly', async () => {
      const roomId = 'room-id';

      mockMatrix.getLocalAliases.mockResolvedValueOnce({
        aliases: ['#test-room:matrix.org'],
      });

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      const alias = await matrixClient.getAliasForRoomId(roomId);

      expect(mockMatrix.getLocalAliases).toHaveBeenCalledWith(roomId);
      expect(alias).toBe('test-room');
    });

    it('sends typing notifications correctly', async () => {
      const roomId = 'room-id';

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.sendTypingEvent(roomId, true);

      expect(mockMatrix.sendTyping).toHaveBeenCalledWith(roomId, true, 5000);
    });

    it('handles reaction events correctly', async () => {
      const roomId = 'room-id';
      const messageId = 'message-id';
      const emoji = '👍';

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.sendEmojiReactionEvent(roomId, messageId, emoji);

      expect(mockMatrix.sendEvent).toHaveBeenCalledWith(roomId, MatrixConstants.REACTION, {
        'm.relates_to': {
          rel_type: MatrixConstants.ANNOTATION,
          event_id: messageId,
          key: emoji,
        },
      });
    });

    it('handles room tagging correctly', async () => {
      const roomId = 'room-id';
      const label = 'favorite';

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.addRoomToLabel(roomId, label);

      expect(mockMatrix.setRoomTag).toHaveBeenCalledWith(roomId, label);

      await matrixClient.removeRoomFromLabel(roomId, label);

      expect(mockMatrix.deleteRoomTag).toHaveBeenCalledWith(roomId, label);
    });
  });

  describe('user profile management', () => {
    it('edits profile information correctly', async () => {
      const profileInfo = {
        displayName: 'New Name',
        avatarUrl: 'mxc://new-avatar',
      };

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.editProfile(profileInfo);

      expect(mockMatrix.setDisplayName).toHaveBeenCalledWith('New Name');
      expect(mockMatrix.setAvatarUrl).toHaveBeenCalledWith('mxc://new-avatar');
    });

    it('gets profile information correctly', async () => {
      const userId = '@other:matrix.org';

      await matrixClient.connect('@test:matrix.org', 'test-access-token');
      await matrixClient.getProfileInfo(userId);

      expect(mockMatrix.getProfileInfo).toHaveBeenCalledWith(userId);
    });
  });

  describe('event handlers', () => {
    beforeEach(async () => {
      await matrixClient.connect('@test:matrix.org', 'test-access-token');
    });

    it('processes message events correctly', () => {
      const messageEvent = {
        type: EventType.RoomMessage,
        content: { body: 'Test message', msgtype: MsgType.Text },
        room_id: 'room-id',
        event_id: 'message-id',
        sender: '@user:matrix.org',
      };

      matrixClient.processMessageEvent(messageEvent);

      expect(events.receiveNewMessage).toHaveBeenCalledWith('room-id', expect.any(Object));
    });

    it('processes post events correctly', () => {
      const postEvent = {
        type: CustomEventType.ROOM_POST,
        content: { body: 'Test post', msgtype: MsgType.Text },
        room_id: 'room-id',
        event_id: 'post-id',
        sender: '@user:matrix.org',
      };

      matrixClient.processMessageEvent(postEvent);

      expect(events.receiveNewMessage).toHaveBeenCalledWith('room-id', expect.any(Object));
    });

    it('handles room membership changes', async () => {
      const memberEvent = {
        type: EventType.RoomMember,
        content: { membership: 'join' },
        state_key: '@other:matrix.org',
        room_id: 'room-id',
      };

      await matrixClient.publishMembershipChange(memberEvent);

      expect(events.onOtherUserJoinedChannel).toHaveBeenCalledWith('room-id', '@other:matrix.org');
    });
  });
});
