## ZOS Authentication & Matrix Connection Guide

Complete flow example from login to reading messages (taking reference from our ZOS implementation)

```
async function initializeChat() {
  // 1. Get ZERO access token
  const accessToken = await authenticateWithZero();

  // 2. Get Matrix SSO token
  const ssoToken = await getSSOToken(accessToken);

  // 3. Initialize Matrix client
  const client = new MatrixClient(MATRIX_CONFIG);
  await client.connect(userId, ssoToken);

  // 4. Wait for sync
  await waitForSync(client);

  // 5. Get rooms and messages
  const rooms = await client.getJoinedRooms();
  const messages = await client.getMessagesByChannelId(rooms[0]);

  // 6. Listen for new messages
  client.on('Room.timeline', handleNewMessage);
}
```

### 1. Authenticate with ZERO Account

There are two authentication methods available. Both authentication methods eventually provide the same type of access token for subsequent API calls. Once authenticated you'll get:

`accessToken`: Used for API authorization. Contains user ID and permissions. Set as cookie and returned in response.

`identityToken`: User profile information including, `id`: User ID, `matrixId`: Matrix user identifier, `wallets`: Array of connected wallet addresses, `profileSummary`: User profile details - etc etc.

`expiresIn`: Token expiration timestamp.

---

**Web3 Authentication Flow**

_1. Get signed token:_

Reference: [src/store/web3/saga.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/store/web3/saga.ts#L37):

```
export function* getSignedToken(address = null) {
  const wagmiConfig = yield call(getWagmiConfig);
  const walletClient: WalletClient = yield call(getWalletClient, wagmiConfig);

  if (!address) {
    address = walletClient.account.address;
  }

  try {
    const token = yield call(personalSignToken, walletClient, address);
    return { success: true, token };
  } catch (error) {
    return { success: false, error: 'Wallet connection failed. Please try again.' };
  }
}
```

_2. Call authentication endpoint:_

Endpoint: `POST /authentication/nonceOrAuthorize`

Purpose: Get either a nonce for new users or authorization tokens for existing users

Headers: `Authorization: Web3 ${signedToken}`

Response:

- For existing users: `{ accessToken: string }`
- For new users: `{ nonceToken: string }`

Reference: [src/store/authentication/api.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/store/authentication/saga.ts#L22):

```
export async function nonceOrAuthorize(signedWeb3Token: string): Promise<AuthorizationResponse> {
  const response = await post('/authentication/nonceOrAuthorize').set('Authorization', `Web3 ${signedWeb3Token}`);

  return response.body;
}

export async function nonce(signedWeb3Token?: string): Promise<AuthorizationResponse> {
  if (signedWeb3Token) {
    const response = await post('/authentication/nonce').set('Authorization', `Web3 ${signedWeb3Token}`);

    return response.body;
  }

  const response = await post('/authentication/nonce');

  return response.body;
}
```

---

**Email Authentication Flow**

_1. Call login endpoint:_

Endpoint: `POST /api/v2/accounts/login`

Body: `{ email: string, password: string }`

Response:

- Returns `success: true` with response body for successful login
- Returns `success: false` with error code for failed login

```
// Example
{
  success: boolean,
  response: {
    accessToken: string
  }
}
```

Reference: [src/store/authentication/api.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/store/authentication/api.ts#L45):

```
export async function emailLogin({ email, password }: { email: string; password: string }) {
  try {
    const response = await post('/api/v2/accounts/login').send({ email, password });
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
      };
    }
    throw error;
  }
}
```

Note: This does not return a nonce token for new users. For new email users, there's a separate registration flow.

---

### 2: Get SSO Token

After successful authentication (either Web3 or email), you need to get a Matrix-specific SSO token:

Endpoint: `GET /accounts/ssoToken`

Purpose: Gets Matrix-specific SSO token

Headers: `{ Authorization: Bearer ${accessToken} }`

Response: `{ "token": "matrix_sso_token" }`

Reference: [src/store/authentication/api.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/store/authentication/api.ts#L39):

```
export async function getSSOToken(): Promise<{ token: string }> {
  const { body } = await get('/accounts/ssoToken');

  return body;
}
```

Important Notes:

- This token is different from your ZERO access token
- The token will be stored in the User object as matrixAccessToken reference: [src/store/authentication/types.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/store/authentication/types.ts#L38).
- This token will be used for all subsequent Matrix operations
- The token is automatically handled by the Matrix client after initialization

---

### 3. Matrix Connection

_1: Initialize Matrix Client_

Using the SSO token from above, create client instance with configuration:

```
// Example
const client = new MatrixClient({
  baseUrl: MATRIX_HOME_SERVER_URL,
  userId: matrixUserId,
  deviceId: deviceId,
  accessToken: ssoToken
});
```

Connect and initialize:

```
await client.connect(userId, accessToken);
```

During connection, you should expect to:

- Initialize the SDK client
- Set up crypto capabilities
- Initialize event handlers
- Start the client
- Wait for initial sync

As well as Session Management:

- Checks for existing session
- Creates new session if none exists
- Saves session details (deviceId, accessToken, userId)

Reference: [src/lib/chat/matrix-client.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/lib/chat/matrix-client.ts#L88):

```
 private async initializeClient(userId: string, ssoToken: string) {
    if (!this.matrix) {
      const opts: any = {
        baseUrl: config.matrix.homeServerUrl,
        cryptoCallbacks: { getSecretStorageKey: this.getSecretStorageKey },
        ...(await this.getCredentials(userId, ssoToken)),
      };

      this.matrix = this.sdk.createClient(opts);

      await this.matrix.initCrypto();

      this.matrix.setGlobalErrorOnUnknownDevices(false);

      await this.matrix.startClient();

      await this.waitForSync();

      return opts.userId;
    }
  }

  async connect(userId: string, accessToken: string) {
    this.setConnectionStatus(ConnectionStatus.Connecting);
    this.userId = await this.initializeClient(userId, this.accessToken || accessToken);
    await this.initializeEventHandlers();

    this.setConnectionStatus(ConnectionStatus.Connected);
    return this.userId;
  }
```

_2: Wait for Sync_

Before performing any operations, you must wait for the initial sync to complete - as seen in the initializeClient function above:

```
await new Promise<void>((resolve) => {
  matrixClient.on('sync', (state) => {
    if (state === 'PREPARED') resolve();
  });
});
```

Reference: [src/lib/chat/matrix-client.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/lib/chat/matrix-client.ts#L1452C2-L1462C1):

```
  private async waitForSync() {
    await new Promise<void>((resolve) => {
      this.matrix.on('sync' as any, (state, _prevState) => {
        if (state === 'PREPARED') {
          this.initializationTimestamp = Date.now();
          resolve();
        }
      });
    });
  }
```

---

### 3. Room Operations

_1: Getting room lists_

```
const roomIds = await matrixClient.getJoinedRooms();
const rooms = await matrixClient.getRooms();
```

Reference: [src/lib/chat/matrix-client.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/lib/chat/matrix-client.ts#L140):

```
  private async getRoomsUserIsIn() {
    await this.waitForConnection();
    const allUserRooms = this.matrix.getRooms() || [];
    return allUserRooms.filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()));
  }

  async isRoomMember(userId: string, roomId: string) {
    if (!userId || !roomId) {
      return false;
    }

    const roomIds = (await this.matrix.getJoinedRooms()).joined_rooms;
    return roomIds.includes(roomId);
  }

  async getConversations() {
    await this.waitForConnection();
    const rooms = await this.getRoomsUserIsIn();

    const failedToJoin = [];
    for (const room of rooms) {
      await room.decryptAllEvents();
      await room.loadMembersIfNeeded();
      const membership = room.getMyMembership();

      this.initializeRoomEventHandlers(room);

      if (membership === MembershipStateType.Invite) {
        if (!(await this.autoJoinRoom(room.roomId))) {
          failedToJoin.push(room.roomId);
        }
      }
    }

    const filteredRooms = rooms.filter((r) => !failedToJoin.includes(r.roomId));

    await this.lowerMinimumInviteAndKickLevels(filteredRooms);
    const result = await Promise.all(filteredRooms.map((r) => this.mapConversation(r)));
    return result;
  }

```

_2: Getting room details_

```
const roomName = await matrixClient.getRoomNameById(roomId);
const roomAvatar = await matrixClient.getRoomAvatarById(roomId);
const groupType = await matrixClient.getRoomGroupTypeById(roomId);
```

Reference: [src/lib/chat/matrix-client.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/lib/chat/matrix-client.ts#L110):

```
// Examples
  async getRoomNameById(roomId: string) {
    await this.waitForConnection();

    const room = this.matrix.getRoom(roomId);
    return this.getRoomName(room);
  }

  async getRoomAvatarById(roomId: string) {
    await this.waitForConnection();

    const room = this.matrix.getRoom(roomId);
    return this.getRoomAvatar(room);
  }

  async getRoomGroupTypeById(roomId: string) {
    await this.waitForConnection();

    const room = this.matrix.getRoom(roomId);
    return this.getRoomGroupType(room);
  }
```

_3: Sending/Receiving Messages_

You can search the `src/lib/chat/matrix-client.ts` for `this.matrix.sendMessage` for references to the send message matrix sdk function.

Send message matrix sdk function:

```
await matrixClient.sendMessage(roomId, {
  msgtype: "m.text",
  body: "Hello World"
});
```

Listen for message events:

```
matrixClient.on("Room.timeline", (event, room) => {
  if (event.getType() === "m.room.message") {
    // here you would perform/process actions to handle the event data
  }
});
```

You will need to initialize Event Handlers. The client automatically sets up handlers for different types of events, some examples:

```
// Message events
matrixClient.on(RoomEvent.Timeline, (event) => {
  if (event.getType() === EventType.RoomMessage) {
    // Handle new message
    this.processMessageEvent(event);
  }
});

// Decryption events
matrixClient.on(MatrixEventEvent.Decrypted, (event) => {
  if (event.getType() === EventType.RoomMessage) {
    // Handle decrypted message
    this.processMessageEvent(event);
  }
});
```

Reference: [src/lib/chat/matrix-client.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/lib/chat/matrix-client.ts#L1312):

```
 private async initializeEventHandlers() {
    this.matrix.on('event' as any, async ({ event }) => {
      this.debug('event: ', event);
      if (event.type === EventType.RoomEncryption) {
        this.debug('encryped message: ', event);
      }
      if (event.type === EventType.RoomMember) {
        await this.publishMembershipChange(event);
      }
      if (event.type === EventType.RoomAvatar) {
        this.publishRoomAvatarChange(event);
      }

      if (event.type === CustomEventType.GROUP_TYPE) {
        this.publishGroupTypeChange(event);
      }

      if (event.type === EventType.RoomRedaction) {
        this.receiveDeleteMessage(event);
      }

      if (event.type === MatrixConstants.REACTION) {
        this.publishReactionChange(event);
      }

      this.processMessageEvent(event);
    });

    this.matrix.on(RoomMemberEvent.Membership, async (_event, member) => {
      if (member.membership === MembershipStateType.Invite && member.userId === this.userId) {
        await this.autoJoinRoom(member.roomId);
      }
    });

    this.matrix.on(MatrixEventEvent.Decrypted, async (decryptedEvent: MatrixEvent) => {
      const event = decryptedEvent.getEffectiveEvent();
      if (event.type === EventType.RoomMessage) {
        this.processMessageEvent(event);
      }
    });

    this.matrix.on(RoomEvent.Name, this.publishRoomNameChange);
    this.matrix.on(RoomMemberEvent.Typing, this.publishRoomMemberTyping);
    this.matrix.on(RoomMemberEvent.PowerLevel, this.publishRoomMemberPowerLevelsChanged);
    this.matrix.on(RoomEvent.Timeline, this.processRoomTimelineEvent.bind(this));
  }
```

---

### 4. Message Encryption/Decryption

You can search the `src/lib/chat/matrix-client.ts` for the encryption and decryption matrix sdk functions/functionality. For example reference for secret storage can be found [here](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/lib/chat/matrix-client.ts#L1739).

_1: Handling Encrypted Messages - Message Decryption Flow_

Messages are automatically decrypted by the Matrix SDK when received. The client listens for decryption events.

You should listen for the event (message event as shown in section above), and process the event data how you wish.

```
   this.matrix.on(MatrixEventEvent.Decrypted, async (decryptedEvent: MatrixEvent) => {
      const event = decryptedEvent.getEffectiveEvent();
      if (event.type === EventType.RoomMessage) {
        this.processMessageEvent(event);
      }
    });
```

This can be found in the initializeEventHandlers, also referenced above - [src/lib/chat/matrix-client.ts](https://github.com/zer0-os/zOS/blob/fe45d3756b48e8a062713ed9692a4ef86d5657ba/src/lib/chat/matrix-client.ts#L1346).

For encrypted files, a separate decryption process is used:

```
export async function decryptFile(encryptedFile, mimetype): Promise<Blob> {
  // Determine if the file is encrypted by checking for encryption-related fields
  const isEncrypted = !!(encryptedFile.key && encryptedFile.iv && encryptedFile.hashes?.sha256);

  const url = encryptedFile.url;
  let response;

  if (isFileUploadedToMatrix(url)) {
    response = await fetch(mxcUrlToHttp(url), {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
  } else {
    const signedUrl = await getAttachmentUrl({ key: encryptedFile.url });
    response = await fetch(signedUrl);
  }

  if (!response.ok) {
    throw new Error(`Error occurred while downloading file ${encryptedFile.url}: ${await response.text()}`);
  }
  const responseData: ArrayBuffer = await response.arrayBuffer();

  if (isEncrypted) {
    try {
      // Decrypt the array buffer using the information taken from the event content
      const dataArray = await encrypt.decryptAttachment(responseData, encryptedFile);
      // Turn the array into a Blob and give it the correct MIME-type
      return new Blob([dataArray], { type: mimetype });
    } catch (e) {
      throw new Error(`Error occurred while decrypting file ${encryptedFile.url}: ${e}`);
    }
  } else {
    // For non-encrypted files, directly create a Blob from the downloaded data
    return new Blob([responseData], { type: mimetype });
  }
}
```
