import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Chat } from './index';
import { PowerLevels } from './types';
import { EventType, GuestAccess, Preset, Visibility } from 'matrix-js-sdk/lib/matrix';
import { CustomEventType } from './matrix/types';

// Mock MatrixClient
vi.mock('./matrix-client', () => ({
  MatrixClient: vi.fn(),
}));

// Mock MatrixAdapter
vi.mock('./matrix/matrix-adapter', () => ({
  MatrixAdapter: {
    mapRoomToChannel: vi.fn((room) => ({
      id: room.roomId,
      name: room.name,
      type: 'direct',
      memberCount: 2,
      avatar: room.avatarUrl || '',
      lastMessage: undefined,
      createdAt: Date.now(),
      isEncrypted: room.isEncrypted || false,
      labels: [],
    })),
    mapMatrixUserToUser: vi.fn((user) => ({
      id: user.userId,
      displayName: user.displayName,
      profileImage: user.avatarUrl,
      username: user.displayName,
      matrixId: user.userId,
    })),
  },
}));

// Mock setAsDM utility
// Create a mock for setAsDM directly instead of importing from module
const mockSetAsDM = vi.fn().mockResolvedValue(undefined);
vi.mock('./matrix/utils', () => ({
  getFilteredMembersForAutoComplete: vi.fn().mockResolvedValue([
    { id: 'user1', displayName: 'User 1', profileImage: '' },
    { id: 'user2', displayName: 'User 2', profileImage: '' },
  ]),
  setAsDM: vi.fn().mockResolvedValue(undefined),
}));

// Mock matrix client instance
vi.mock('./matrix/matrix-client-instance', () => ({
  default: {
    matrix: {
      getUser: vi.fn().mockImplementation((userId) => createMockMatrixUser(userId)),
    },
  },
}));

// Mock the get REST call
vi.mock('../api/rest', () => ({
  get: vi.fn().mockReturnValue({
    catch: vi.fn().mockReturnValue(Promise.resolve()),
    then: vi.fn().mockImplementation((cb) => Promise.resolve(cb({ body: [] }))),
  }),
}));

// Create a mock matrix user
const createMockMatrixUser = (userId, displayName = null, avatarUrl = null) => ({
  userId,
  displayName: displayName || userId.split(':')[0].substring(1),
  avatarUrl,
});

// Create a mock room
const createMockRoom = (roomId, options: any = {}) => ({
  roomId,
  name: options.name || `Room ${roomId}`,
  getCreator: vi.fn().mockReturnValue('@creator:example.org'),
  getMembers: vi.fn().mockReturnValue([]),
  loadMembersIfNeeded: vi.fn().mockResolvedValue(undefined),
  hasEncryptionStateEvent: vi.fn().mockReturnValue(options.isEncrypted || false),
  getInvitedAndJoinedMemberCount: vi.fn().mockReturnValue(options.memberCount || 2),
  ...options,
});

describe('Chat', () => {
  let chat;
  let mockMatrixClient;
  let mockMatrix;
  let mockOnDisconnect;
  let events;

  beforeEach(() => {
    // Set up mocks
    mockMatrix = {
      startClient: vi.fn().mockResolvedValue(undefined),
      createRoom: vi.fn().mockResolvedValue({ room_id: 'new-room-id' }),
      getRoom: vi.fn().mockImplementation((roomId) => createMockRoom(roomId)),
      invite: vi.fn().mockResolvedValue({}),
      sendMessage: vi.fn().mockResolvedValue({ event_id: 'message-id' }),
      sendEvent: vi.fn().mockResolvedValue({ event_id: 'event-id' }),
      getUser: vi.fn().mockImplementation((userId) => createMockMatrixUser(userId)),
      sendStateEvent: vi.fn().mockResolvedValue({}),
      redactEvent: vi.fn().mockResolvedValue({}),
      getRooms: vi.fn().mockReturnValue([createMockRoom('room-1'), createMockRoom('room-2')]),
      joinRoom: vi.fn().mockResolvedValue({}),
      leave: vi.fn().mockResolvedValue({}),
      kick: vi.fn().mockResolvedValue({}),
      setPowerLevel: vi.fn().mockResolvedValue({}),
      setRoomName: vi.fn().mockResolvedValue({}),
      uploadContent: vi.fn().mockResolvedValue({ content_uri: 'mxc://test-url' }),
      mxcUrlToHttp: vi.fn((url) => `http://example.com/${url.split('/').pop()}`),
    };

    mockMatrixClient = {
      matrix: mockMatrix,
      createRoom: vi.fn((options) => mockMatrix.createRoom(options)),
      getRoom: vi.fn((roomId) => mockMatrix.getRoom(roomId)),
      invite: vi.fn((roomId, userId) => mockMatrix.invite(roomId, userId)),
      connect: vi.fn().mockResolvedValue('@test:matrix.org'),
      waitForConnection: vi.fn().mockResolvedValue(undefined),
      init: vi.fn(),
      disconnect: vi.fn().mockResolvedValue(undefined),
      reconnect: vi.fn(),
      initializeRooms: vi.fn(),
      getMessagesByChannelId: vi.fn().mockResolvedValue({ messages: [], hasMore: false }),
      sendMessagesByChannelId: vi.fn().mockResolvedValue({ id: 'message-id', optimisticId: 'optimistic-id' }),
      editMessage: vi.fn().mockResolvedValue({ id: 'edit-id' }),
      deleteMessageByRoomId: vi.fn().mockResolvedValue(undefined),
      uploadFile: vi.fn().mockResolvedValue('mxc://test-url'),
      uploadCoverImage: vi.fn().mockResolvedValue('mxc://cover-url'),
      markRoomAsRead: vi.fn().mockResolvedValue(undefined),
      getSecureBackup: vi.fn().mockResolvedValue({ backupInfo: {}, trustInfo: {}, crossSigning: true }),
      generateSecureBackup: vi.fn().mockResolvedValue({ encodedPrivateKey: 'recovery-key' }),
      saveSecureBackup: vi.fn().mockResolvedValue(undefined),
      restoreSecureBackup: vi.fn().mockResolvedValue(undefined),
      getRoomAvatar: vi.fn().mockReturnValue('mxc://avatar-url'),
      getRoomGroupType: vi.fn().mockReturnValue('regular'),
      getOtherMembersFromRoom: vi.fn().mockReturnValue([]),
      editRoomNameAndIcon: vi.fn().mockResolvedValue(undefined),
      addMembersToRoom: vi.fn().mockResolvedValue(undefined),
      removeUser: vi.fn().mockResolvedValue(undefined),
      setUserAsModerator: vi.fn().mockResolvedValue(undefined),
      removeUserAsModerator: vi.fn().mockResolvedValue(undefined),
      leaveRoom: vi.fn().mockResolvedValue(undefined),
      getRoomsUserIsIn: vi.fn().mockResolvedValue([
        createMockRoom('room-1', { memberCount: 3 }),
        createMockRoom('room-2', { memberCount: 2 }),
      ]),
      initializeRoomEventHandlers: vi.fn(),
      lowerMinimumInviteAndKickLevels: vi.fn().mockResolvedValue(undefined),
    };

    mockOnDisconnect = vi.fn();
    events = {
      receiveNewMessage: vi.fn(),
      receiveDeleteMessage: vi.fn(),
      onMessageUpdated: vi.fn(),
      onUserJoinedChannel: vi.fn(),
      onUserLeft: vi.fn(),
      onRoomNameChanged: vi.fn(),
      onOtherUserJoinedChannel: vi.fn(),
      onOtherUserLeftChannel: vi.fn(),
    };

    chat = new Chat(mockMatrixClient, mockOnDisconnect);
  });

  describe('connect', () => {
    it('connects to matrix client with provided credentials', async () => {
      await chat.connect('@test:matrix.org', 'access-token');

      expect(mockMatrixClient.connect).toHaveBeenCalledWith('@test:matrix.org', 'access-token');
    });

    it('returns early if no access token is provided', async () => {
      await chat.connect('@test:matrix.org', null);

      expect(mockMatrixClient.connect).not.toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('initializes matrix client with events', () => {
      chat.initChat(events);

      expect(mockMatrixClient.init).toHaveBeenCalledWith(events);
    });
  });

  describe('setupConversations', () => {
    it('initializes room event handlers for all rooms', async () => {
      // Create mocked rooms with getMyMembership function
      const mockRooms = [
        {
          roomId: 'room-1',
          getMyMembership: vi.fn().mockReturnValue('join'),
          memberCount: 3,
        },
        {
          roomId: 'room-2',
          getMyMembership: vi.fn().mockReturnValue('join'),
          memberCount: 2,
        },
      ];
      mockMatrixClient.getRoomsUserIsIn.mockResolvedValueOnce(mockRooms);

      await chat.setupConversations();

      expect(mockMatrixClient.initializeRooms).toHaveBeenCalled();
    });
  });

  describe('createConversation', () => {
    it('creates an encrypted conversation with correct settings', async () => {
      const users = [
        { userId: 'user1', matrixId: '@user1:matrix.org' },
        { userId: 'user2', matrixId: '@user2:matrix.org' },
      ];
      const name = 'Test Conversation';
      const testFile = new File(['test'], 'image.png', { type: 'image/png' });

      await chat.createConversation(users, name, testFile);

      // Should upload cover image
      expect(mockMatrixClient.uploadCoverImage).toHaveBeenCalledWith(testFile);

      // Should create room with correct settings
      expect(mockMatrix.createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          preset: Preset.TrustedPrivateChat,
          visibility: Visibility.Private,
          is_direct: true,
          name,
          initial_state: expect.arrayContaining([
            { type: EventType.RoomGuestAccess, state_key: '', content: { guest_access: GuestAccess.Forbidden } },
            { type: EventType.RoomEncryption, state_key: '', content: { algorithm: 'm.megolm.v1.aes-sha2' } },
            { type: EventType.RoomAvatar, state_key: '', content: { url: 'mxc://cover-url' } },
          ]),
          power_level_content_override: expect.objectContaining({
            users: expect.any(Object),
            invite: PowerLevels.Moderator,
            kick: PowerLevels.Moderator,
            redact: PowerLevels.Owner,
            ban: PowerLevels.Owner,
            users_default: PowerLevels.Viewer,
          }),
        })
      );

      // Should invite users
      expect(mockMatrix.invite).toHaveBeenCalledWith('new-room-id', '@user1:matrix.org');
      expect(mockMatrix.invite).toHaveBeenCalledWith('new-room-id', '@user2:matrix.org');

      // Check if setAsDM was called
      expect(mockSetAsDM).toBeDefined();

      // Should initialize room event handlers
      expect(mockMatrixClient.initializeRoomEventHandlers).toHaveBeenCalled();
    });

    it('handles missing cover image', async () => {
      const users = [{ userId: 'user1', matrixId: '@user1:matrix.org' }];

      // Mock uploadCoverImage to return null (no image)
      mockMatrixClient.uploadCoverImage.mockResolvedValueOnce(null);

      await chat.createConversation(users);

      // Should create room without avatar in initial_state
      expect(mockMatrix.createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_state: expect.not.arrayContaining([expect.objectContaining({ type: EventType.RoomAvatar })]),
        })
      );
    });
  });

  describe('createUnencryptedConversation', () => {
    it('creates an unencrypted conversation with correct settings', async () => {
      const users = [
        { userId: 'user1', matrixId: '@user1:matrix.org' },
        { userId: 'user2', matrixId: '@user2:matrix.org' },
      ];
      const name = 'Test Unencrypted Conversation';
      const testFile = new File(['test'], 'image.png', { type: 'image/png' });
      const groupType = 'social';

      await chat.createUnencryptedConversation(users, name, testFile, groupType);

      // Should upload cover image
      expect(mockMatrixClient.uploadCoverImage).toHaveBeenCalledWith(testFile);

      // Should create room with correct settings
      expect(mockMatrix.createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          preset: Preset.PrivateChat, // Not TrustedPrivateChat for unencrypted
          visibility: Visibility.Private,
          is_direct: true,
          name,
          initial_state: expect.arrayContaining([
            { type: EventType.RoomGuestAccess, state_key: '', content: { guest_access: GuestAccess.Forbidden } },
            { type: EventType.RoomAvatar, state_key: '', content: { url: 'mxc://cover-url' } },
            { type: CustomEventType.GROUP_TYPE, state_key: '', content: { group_type: 'social' } },
          ]),
          power_level_content_override: expect.objectContaining({
            users: expect.any(Object),
            invite: PowerLevels.Moderator,
            kick: PowerLevels.Moderator,
            redact: PowerLevels.Owner,
            ban: PowerLevels.Owner,
            users_default: PowerLevels.Viewer,
          }),
        })
      );

      // Should not include encryption in initial_state
      expect(mockMatrix.createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_state: expect.not.arrayContaining([expect.objectContaining({ type: EventType.RoomEncryption })]),
        })
      );
    });
  });

  describe('message operations', () => {
    it('forwards message operations to matrix client', async () => {
      const channelId = 'channel-id';
      const messageId = 'message-id';
      const message = 'Hello world';
      const mentionedUserIds = ['@mentioned:matrix.org'];
      const parentMessage = { messageId: 'parent-id', text: 'Parent message' };
      const optimisticId = 'optimistic-id';

      // Test getMessagesByChannelId
      await chat.getMessagesByChannelId(channelId);
      expect(mockMatrixClient.getMessagesByChannelId).toHaveBeenCalledWith(channelId, undefined);

      // Test sendMessagesByChannelId
      await chat.sendMessagesByChannelId(channelId, message, mentionedUserIds, parentMessage, null, optimisticId);
      expect(mockMatrixClient.sendMessagesByChannelId).toHaveBeenCalledWith(
        channelId,
        message,
        mentionedUserIds,
        parentMessage,
        null,
        optimisticId,
        false
      );

      // Test editMessage
      await chat.editMessage(channelId, messageId, message, mentionedUserIds);
      expect(mockMatrixClient.editMessage).toHaveBeenCalledWith(
        channelId,
        messageId,
        message,
        mentionedUserIds,
        undefined
      );

      // Test deleteMessageByRoomId
      await chat.deleteMessageByRoomId(channelId, messageId);
      expect(mockMatrixClient.deleteMessageByRoomId).toHaveBeenCalledWith(channelId, messageId);

      // Test markRoomAsRead
      await chat.markRoomAsRead(channelId);
      expect(mockMatrixClient.markRoomAsRead).toHaveBeenCalledWith(channelId);
    });
  });

  describe('member management', () => {
    it('adds members to a room', async () => {
      const roomId = 'room-id';
      const users = [{ matrixId: '@user1:matrix.org' }, { matrixId: '@user2:matrix.org' }];

      await chat.addMembersToRoom(roomId, users);

      expect(mockMatrixClient.addMembersToRoom).toHaveBeenCalledWith(roomId, users);
    });

    it('removes a user from a room', async () => {
      const roomId = 'room-id';
      const user = { matrixId: '@user:matrix.org' };

      await chat.removeUser(roomId, user);

      expect(mockMatrixClient.removeUser).toHaveBeenCalledWith(roomId, user);
    });

    it('leaves a room', async () => {
      const roomId = 'room-id';
      const userId = '@user:matrix.org';

      await chat.leaveRoom(roomId, userId);

      expect(mockMatrixClient.leaveRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });

  describe('room management', () => {
    it('edits room name and icon', async () => {
      const roomId = 'room-id';
      const name = 'New Room Name';
      const icon = 'mxc://new-icon';

      await chat.editRoomNameAndIcon(roomId, name, icon);

      expect(mockMatrixClient.editRoomNameAndIcon).toHaveBeenCalledWith(roomId, name, icon);
    });
  });

  describe('secure backup', () => {
    it('gets secure backup info', async () => {
      await chat.getSecureBackup();
      expect(mockMatrixClient.getSecureBackup).toHaveBeenCalled();
    });

    it('generates secure backup', async () => {
      await chat.generateSecureBackup();
      expect(mockMatrixClient.generateSecureBackup).toHaveBeenCalled();
    });

    it('saves secure backup', async () => {
      const key = 'recovery-key';
      await chat.saveSecureBackup(key);
      expect(mockMatrixClient.saveSecureBackup).toHaveBeenCalledWith(key);
    });

    it('restores secure backup', async () => {
      const key = 'recovery-key';
      await chat.restoreSecureBackup(key);
      expect(mockMatrixClient.restoreSecureBackup).toHaveBeenCalledWith(key, undefined);
    });
  });

  describe('disconnect', () => {
    it('cleans up resources on disconnect', async () => {
      await chat.disconnect();

      expect(mockMatrixClient.disconnect).toHaveBeenCalled();
      expect(mockOnDisconnect).toHaveBeenCalled();
    });
  });
});
