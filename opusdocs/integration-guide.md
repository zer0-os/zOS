# Matrix Chat Integration Guide for zOS

## Overview

This guide documents how Matrix chat integration works in zOS, providing practical examples and patterns that are particularly useful for Haven Protocol's creator communities. Matrix serves as the real-time communication backbone, enabling encrypted messaging, room management, and event streaming.

## Core Architecture

### Matrix Client Structure

The Matrix integration follows a layered architecture:

```
┌─────────────────┐
│   React UI      │ ← Components consume chat state
├─────────────────┤
│   Redux Store   │ ← Manages chat state via sagas
├─────────────────┤
│   Chat Layer    │ ← Abstracts Matrix complexity
├─────────────────┤
│  Matrix Client  │ ← Direct SDK integration
└─────────────────┘
```

**Key Files:**
- `/src/lib/chat/matrix-client.ts` - Core Matrix SDK wrapper
- `/src/lib/chat/index.ts` - High-level chat API
- `/src/store/matrix/saga.ts` - State management
- `/src/lib/chat/matrix/matrix-adapter.ts` - Data transformation

## Setting up Matrix Integration

### Basic Client Initialization

```typescript
import { MatrixClient } from './lib/chat/matrix-client';
import { featureFlags } from './lib/feature-flags';

// Initialize the Matrix client
const client = new MatrixClient();

// Connect with user credentials
await client.connect(userId, accessToken);

// Wait for sync completion
await client.waitForConnection();
```

### Event Handler Setup

```typescript
// Define event handlers for real-time updates
const realtimeEvents = {
  receiveNewMessage: (channelId: string, message: Message) => {
    // Handle incoming messages
    console.log(`New message in ${channelId}:`, message);
  },
  
  receiveUnreadCount: (channelId: string, unreadCount: UnreadCount) => {
    // Update UI badges and notifications
    updateChannelBadge(channelId, unreadCount);
  },
  
  onUserJoinedChannel: (channelId: string) => {
    // Handle user joining
    refreshChannelMembers(channelId);
  },
  
  roomMemberTyping: (roomId: string, userIds: string[]) => {
    // Show typing indicators
    showTypingIndicators(roomId, userIds);
  }
};

// Initialize event handling
client.init(realtimeEvents);
```

## Sending Messages

### Text Messages

```typescript
// Send a basic text message
async function sendTextMessage(channelId: string, message: string) {
  const result = await client.sendMessagesByChannelId(
    channelId,
    message,
    [], // mentionedUserIds
    null, // parentMessage (for replies)
    null, // file attachment
    generateOptimisticId(), // for immediate UI updates
    false // isSocialChannel
  );
  
  return result;
}

// Example usage for creator announcements
await sendTextMessage(
  'roomId123', 
  'New artwork drop this Friday! Get ready for "Digital Dreams" collection 🎨'
);
```

### Reply Messages

```typescript
// Reply to a message (useful for community discussions)
async function replyToMessage(
  channelId: string, 
  replyText: string, 
  originalMessage: Message
) {
  const parentMessage = {
    messageId: originalMessage.id,
    senderId: originalMessage.senderId,
    message: originalMessage.message
  };
  
  const result = await client.sendMessagesByChannelId(
    channelId,
    replyText,
    [], // mentions
    parentMessage,
    null, // file
    generateOptimisticId()
  );
  
  return result;
}
```

### File Attachments

```typescript
// Upload and send media (perfect for artwork sharing)
async function sendMediaMessage(channelId: string, file: File) {
  try {
    // Upload file with encryption support
    const result = await client.uploadFileMessage(
      channelId,
      file,
      '', // rootMessageId
      generateOptimisticId(),
      false // isPost
    );
    
    return result;
  } catch (error) {
    console.error('Failed to upload media:', error);
    throw error;
  }
}

// Example: Artist sharing work-in-progress
const artworkFile = document.getElementById('artwork-input').files[0];
await sendMediaMessage('art-critique-room', artworkFile);
```

## Room Management

### Creating Rooms

```typescript
// Create an encrypted conversation (for private artist collaborations)
async function createPrivateRoom(users: User[], name: string, coverImage?: File) {
  const chatInstance = chat.get();
  
  const room = await chatInstance.createConversation(
    users,
    name,
    coverImage
  );
  
  return room;
}

// Create unencrypted room (for public galleries/showcases)
async function createPublicRoom(
  users: User[], 
  name: string, 
  coverImage?: File, 
  groupType?: string
) {
  const chatInstance = chat.get();
  
  const room = await chatInstance.createUnencryptedConversation(
    users,
    name,
    coverImage,
    groupType // 'social' for community rooms
  );
  
  return room;
}

// Example: Create artist collaboration room
const collaborators = await searchUsers('artist');
const room = await createPrivateRoom(
  collaborators,
  'Digital Art Collab - Q4 2024',
  artworkCoverImage
);
```

### Room Administration

```typescript
// Set user as moderator (for community management)
async function promoteToModerator(roomId: string, userId: string) {
  await client.setUserAsModerator(roomId, userId);
}

// Remove moderator privileges
async function demoteModerator(roomId: string, userId: string) {
  await client.removeUserAsModerator(roomId, userId);
}

// Add members to existing room
async function addArtistsToGallery(roomId: string, artists: User[]) {
  await client.addMembersToRoom(roomId, artists);
}

// Update room details
async function updateGalleryInfo(roomId: string, name: string, iconUrl: string) {
  await client.editRoomNameAndIcon(roomId, name, iconUrl);
}
```

## Event Handling Patterns

### Real-time Message Processing

```typescript
// Process incoming messages with sender mapping
function* processIncomingMessage(action) {
  const { channelId, message } = action.payload;
  
  // Map Matrix user to zOS user profile
  const enrichedMessage = yield call(mapMessageSenders, [message]);
  
  // Update UI state
  yield put(addMessageToChannel(channelId, enrichedMessage[0]));
  
  // Handle notifications for Haven creators
  if (isCreatorMention(message)) {
    yield call(notifyCreator, message);
  }
}

// Custom event types for Haven Protocol
enum HavenEventType {
  ARTWORK_DROP = 'haven.artwork.drop',
  AUCTION_START = 'haven.auction.start',
  CREATOR_ANNOUNCEMENT = 'haven.creator.announcement'
}
```

### Typing Indicators

```typescript
// Send typing indicators (enhances community feel)
async function startTyping(roomId: string) {
  await client.sendTypingEvent(roomId, true);
  
  // Auto-stop after timeout
  setTimeout(() => {
    client.sendTypingEvent(roomId, false);
  }, 5000);
}

// Handle incoming typing events
function handleTypingIndicator(roomId: string, userIds: string[]) {
  const typingUsers = userIds.filter(id => id !== currentUserId);
  
  if (typingUsers.length > 0) {
    showTypingIndicator(roomId, typingUsers);
  } else {
    hideTypingIndicator(roomId);
  }
}
```

## Media Handling

### Image Processing with Blurhash

```typescript
// Enhanced image upload with preview generation
async function uploadArtworkWithPreview(roomId: string, imageFile: File) {
  const room = client.getRoom(roomId);
  const isEncrypted = room?.hasEncryptionStateEvent();
  
  // Generate dimensions and blurhash for smooth loading
  const dimensions = await getImageDimensions(imageFile);
  const blurhash = await generateBlurhash(imageFile);
  
  let uploadUrl;
  if (isEncrypted) {
    const encryptedFile = await encryptFile(imageFile);
    uploadUrl = await client.uploadFile(encryptedFile.file);
  } else {
    uploadUrl = await client.uploadFile(imageFile);
  }
  
  // Send with rich metadata
  const result = await client.uploadFileMessage(
    roomId,
    imageFile,
    '', // rootMessageId
    generateOptimisticId()
  );
  
  return result;
}
```

### Batch File Downloads

```typescript
// Efficiently download multiple artworks for gallery view
async function loadGalleryImages(imageUrls: string[]) {
  const downloadedImages = await client.batchDownloadFiles(
    imageUrls,
    true, // generate thumbnails
    10    // batch size for performance
  );
  
  return downloadedImages;
}
```

## Reactions and Engagement

### Custom Reactions (MEOW System)

```typescript
// Send MEOW reaction (zOS's custom appreciation system)
async function sendMeowReaction(
  roomId: string, 
  messageId: string, 
  ownerId: string, 
  amount: number
) {
  await client.sendMeowReactionEvent(roomId, messageId, ownerId, amount);
}

// Send emoji reactions
async function reactWithEmoji(roomId: string, messageId: string, emoji: string) {
  await client.sendEmojiReactionEvent(roomId, messageId, emoji);
}

// Get all reactions for a message
async function getMessageReactions(roomId: string) {
  const reactions = await client.getMessageEmojiReactions(roomId);
  return reactions.reduce((acc, reaction) => {
    if (!acc[reaction.eventId]) acc[reaction.eventId] = [];
    acc[reaction.eventId].push(reaction);
    return acc;
  }, {});
}
```

### Post-style Messages

```typescript
// Send posts (different from regular messages, good for announcements)
async function createArtistPost(channelId: string, content: string) {
  const result = await client.sendPostsByChannelId(
    channelId,
    content,
    generateOptimisticId()
  );
  
  return result;
}

// Get post-specific reactions with amounts
async function getPostReactions(roomId: string) {
  return await client.getPostMessageReactions(roomId);
}
```

## Read Receipts and Presence

### Managing Read Status

```typescript
// Mark room as read (important for community management)
async function markGalleryAsRead(roomId: string) {
  await client.markRoomAsRead(roomId);
}

// Set read receipt preferences
async function setReadReceiptPrivacy(isPrivate: boolean) {
  const preference = isPrivate ? 'private' : 'public';
  await client.setReadReceiptPreference(preference);
}

// Get who has read a specific message
async function getMessageReadBy(roomId: string, messageId: string) {
  const receipts = await client.getMessageReadReceipts(roomId, messageId);
  return receipts.map(receipt => ({
    userId: receipt.userId,
    timestamp: receipt.ts
  }));
}
```

## Room Discovery and Management

### Room Aliases and Labels

```typescript
// Create friendly room aliases (e.g., #digital-art-gallery)
async function createRoomAlias(roomId: string, alias: string) {
  // Note: Alias creation requires homeserver admin privileges
  // This is typically done through room creation options
  const room = await client.createRoom({
    room_alias_name: alias,
    // ... other options
  });
  return room;
}

// Find room by alias
async function findRoomByAlias(alias: string) {
  const roomId = await client.getRoomIdForAlias(`#${alias}:${homeServerDomain}`);
  return roomId;
}

// Organize rooms with labels (tags)
async function tagRoom(roomId: string, category: string) {
  await client.addRoomToLabel(roomId, category);
}

// Remove room from category
async function untagRoom(roomId: string, category: string) {
  await client.removeRoomFromLabel(roomId, category);
}
```

## Encryption and Security

### Secure Backup Management

```typescript
// Generate secure backup for encryption keys
async function createSecureBackup() {
  const recoveryKey = await client.generateSecureBackup();
  
  // Store recovery key securely (user responsibility)
  return recoveryKey.encodedPrivateKey;
}

// Save backup to homeserver
async function saveBackupToServer(recoveryKey: string) {
  await client.saveSecureBackup(recoveryKey);
}

// Restore from backup
async function restoreFromBackup(
  recoveryKey: string, 
  onProgress?: (progress: ImportRoomKeyProgressData) => void
) {
  await client.restoreSecureBackup(recoveryKey, onProgress);
}

// Check backup status
async function getBackupStatus() {
  const backup = await client.getSecureBackup();
  
  return {
    exists: !!backup?.trustInfo,
    trusted: backup?.trustInfo?.trusted || false,
    crossSigning: backup?.crossSigning || false
  };
}
```

## Error Handling and Debugging

### Connection Management

```typescript
// Robust connection handling
class MatrixConnectionManager {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  async connectWithRetry(userId: string, accessToken: string) {
    try {
      await client.connect(userId, accessToken);
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('Matrix connection failed:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
        
        setTimeout(() => {
          this.connectWithRetry(userId, accessToken);
        }, delay);
      } else {
        throw new Error('Max reconnection attempts exceeded');
      }
    }
  }
  
  async handleConnectionLoss() {
    // Implement graceful degradation
    // Queue messages while offline
    // Sync when reconnected
  }
}
```

### Message Validation

```typescript
// Validate messages before sending
function validateMessage(message: string, channelId: string): boolean {
  if (!message.trim()) {
    throw new Error('Empty message not allowed');
  }
  
  if (message.length > 65536) {
    throw new Error('Message too long');
  }
  
  if (!channelId) {
    throw new Error('Channel ID required');
  }
  
  return true;
}

// Handle send failures gracefully
async function sendMessageWithRetry(
  channelId: string, 
  message: string, 
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      validateMessage(message, channelId);
      return await client.sendMessagesByChannelId(channelId, message, []);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## Haven Protocol Integration Patterns

### Creator Community Rooms

```typescript
// Setup for Haven Protocol creator communities
async function createCreatorCommunity(
  creatorProfile: CreatorProfile,
  initialMembers: User[]
) {
  // Create main community room
  const communityRoom = await createUnencryptedConversation(
    initialMembers,
    `${creatorProfile.name} Community`,
    creatorProfile.coverImage,
    'social'
  );
  
  // Create private creator workspace
  const workspaceRoom = await createPrivateRoom(
    [creatorProfile.user, ...creatorProfile.collaborators],
    `${creatorProfile.name} - Workspace`
  );
  
  // Tag rooms for organization
  await tagRoom(communityRoom.id, 'haven:community');
  await tagRoom(workspaceRoom.id, 'haven:workspace');
  
  return {
    community: communityRoom,
    workspace: workspaceRoom
  };
}
```

### Artwork Drop Events

```typescript
// Custom event for artwork drops
async function announceArtworkDrop(
  roomId: string,
  artwork: ArtworkInfo,
  dropTime: Date
) {
  const announcement = `
🎨 New Artwork Drop Alert! 

"${artwork.title}" by ${artwork.artist}
Drop Time: ${dropTime.toLocaleString()}
Preview: ${artwork.previewUrl}

Get ready collectors! #ArtDrop #DigitalArt
  `;
  
  // Send as post for better visibility
  const result = await client.sendPostsByChannelId(
    roomId,
    announcement,
    generateOptimisticId()
  );
  
  // Schedule reminder if needed
  scheduleDropReminder(roomId, artwork, dropTime);
  
  return result;
}
```

## Performance Optimization

### Message Pagination

```typescript
// Efficient message loading with pagination
async function loadChannelHistory(
  channelId: string, 
  lastTimestamp?: number, 
  limit = 50
) {
  const response = await client.getMessagesByChannelId(
    channelId,
    lastTimestamp
  );
  
  return {
    messages: response.messages.slice(0, limit),
    hasMore: response.hasMore,
    nextTimestamp: response.messages[response.messages.length - 1]?.createdAt
  };
}

// Infinite scroll implementation
class InfiniteMessageLoader {
  private loading = false;
  private hasMore = true;
  
  async loadMore(channelId: string, currentMessages: Message[]) {
    if (this.loading || !this.hasMore) return currentMessages;
    
    this.loading = true;
    try {
      const lastMessage = currentMessages[0];
      const olderMessages = await loadChannelHistory(
        channelId,
        lastMessage?.createdAt
      );
      
      this.hasMore = olderMessages.hasMore;
      return [...olderMessages.messages, ...currentMessages];
    } finally {
      this.loading = false;
    }
  }
}
```

### Sliding Sync Integration

```typescript
// Efficient room sync using Matrix Sliding Sync
class RoomSyncManager {
  async addRoomToSync(roomId: string) {
    await SlidingSyncManager.instance.addRoomToSync(roomId);
  }
  
  async removeRoomFromSync(roomId: string) {
    await SlidingSyncManager.instance.removeRoomFromSync(roomId);
  }
  
  // Optimize sync for active conversations
  async optimizeForActiveRooms(activeRoomIds: string[]) {
    const allRooms = client.getRooms();
    
    for (const room of allRooms) {
      if (activeRoomIds.includes(room.roomId)) {
        await this.addRoomToSync(room.roomId);
      } else {
        await this.removeRoomFromSync(room.roomId);
      }
    }
  }
}
```

## Testing Strategies

### Mock Matrix Client

```typescript
// Mock for testing without Matrix homeserver
class MockMatrixClient {
  private messages: Map<string, Message[]> = new Map();
  private rooms: Map<string, Room> = new Map();
  
  async sendMessagesByChannelId(
    channelId: string,
    message: string
  ): Promise<{ id: string; optimisticId: string }> {
    const messageId = `msg_${Date.now()}`;
    const mockMessage: Message = {
      id: messageId,
      message,
      createdAt: Date.now(),
      senderId: 'test-user',
      // ... other required fields
    };
    
    const channelMessages = this.messages.get(channelId) || [];
    channelMessages.push(mockMessage);
    this.messages.set(channelId, channelMessages);
    
    return { id: messageId, optimisticId: 'test-optimistic' };
  }
  
  async getMessagesByChannelId(channelId: string) {
    return {
      messages: this.messages.get(channelId) || [],
      hasMore: false
    };
  }
}
```

### Integration Tests

```typescript
// Test Matrix integration with real scenarios
describe('Matrix Integration', () => {
  let client: MatrixClient;
  
  beforeEach(async () => {
    client = new MatrixClient();
    await client.connect('test-user', 'test-token');
  });
  
  it('should send and receive messages', async () => {
    const roomId = 'test-room';
    const testMessage = 'Hello, Haven Protocol!';
    
    const sent = await client.sendMessagesByChannelId(roomId, testMessage, []);
    expect(sent.id).toBeTruthy();
    
    const messages = await client.getMessagesByChannelId(roomId);
    expect(messages.messages.some(m => m.id === sent.id)).toBeTruthy();
  });
  
  it('should handle file uploads', async () => {
    const file = createTestImageFile();
    const roomId = 'test-room';
    
    const result = await client.uploadFileMessage(roomId, file);
    expect(result.id).toBeTruthy();
  });
});
```

## Common Pitfalls and Solutions

### 1. Message Ordering Issues

**Problem**: Messages appearing out of order due to async operations.

**Solution**: Use origin_server_ts for consistent ordering:

```typescript
// Sort messages by server timestamp, not client timestamp
const sortedMessages = messages.sort((a, b) => a.createdAt - b.createdAt);
```

### 2. Memory Leaks with Event Listeners

**Problem**: Event listeners not properly cleaned up.

**Solution**: Always clean up listeners:

```typescript
class MatrixManager {
  private eventHandlers = new Map();
  
  addEventHandler(eventType: string, handler: Function) {
    this.eventHandlers.set(eventType, handler);
    client.on(eventType, handler);
  }
  
  cleanup() {
    for (const [eventType, handler] of this.eventHandlers) {
      client.removeListener(eventType, handler);
    }
    this.eventHandlers.clear();
  }
}
```

### 3. Encryption Key Management

**Problem**: Lost encryption keys make message history unreadable.

**Solution**: Implement robust backup strategies:

```typescript
// Check encryption status before sensitive operations
async function ensureEncryptionReadiness(roomId: string) {
  const room = client.getRoom(roomId);
  if (room?.hasEncryptionStateEvent()) {
    const backup = await client.getSecureBackup();
    if (!backup || !backup.trustInfo.trusted) {
      throw new Error('Encryption backup required for this room');
    }
  }
}
```

### 4. Rate Limiting

**Problem**: Hitting Matrix homeserver rate limits.

**Solution**: Implement rate limiting and queuing:

```typescript
class MessageQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastSend = 0;
  private minInterval = 100; // 100ms between sends
  
  async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastSend = now - this.lastSend;
      
      if (timeSinceLastSend < this.minInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minInterval - timeSinceLastSend)
        );
      }
      
      const operation = this.queue.shift();
      await operation();
      this.lastSend = Date.now();
    }
    
    this.processing = false;
  }
}
```

## Conclusion

This Matrix integration guide provides the foundation for building rich, real-time communication features in zOS. The patterns shown here are particularly well-suited for Haven Protocol's creator communities, enabling:

- **Real-time collaboration** between artists and collectors
- **Rich media sharing** for artwork and creative processes  
- **Community management** tools for creator spaces
- **Secure, encrypted** conversations for sensitive collaborations
- **Custom events and reactions** for engagement

The event-driven architecture and comprehensive error handling ensure reliable performance at scale, while the modular design allows for easy customization and extension for specific use cases.

For Haven Protocol implementers, focus on the room management patterns, custom event types, and media handling capabilities to create compelling creator community experiences.