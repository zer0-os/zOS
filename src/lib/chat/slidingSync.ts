import { type MatrixClient, ClientEvent, EventType, type Room } from 'matrix-js-sdk/lib/matrix';
import {
  type MSC3575List,
  type MSC3575SlidingSyncResponse,
  MSC3575_STATE_KEY_LAZY,
  MSC3575_STATE_KEY_ME,
  MSC3575_WILDCARD,
  SlidingSync,
  SlidingSyncEvent,
  SlidingSyncState,
} from 'matrix-js-sdk/lib/sliding-sync';
import { defer, sleep } from 'matrix-js-sdk/lib/utils';

// Heroku has a hard limit of 30 seconds requests.
// So we set a 19 second timeout for a /sync request and then
// SlidingSync will add another 10 second buffer to this
const SLIDING_SYNC_TIMEOUT_MS = 19_000;

const REQUIRED_STATE_LIST = [
  [EventType.RoomJoinRules, ''],
  [EventType.RoomAvatar, ''],
  [EventType.RoomTombstone, ''],
  [EventType.RoomEncryption, ''],
  [EventType.RoomCreate, ''],
  [EventType.RoomMember, MSC3575_STATE_KEY_ME],
];

// the things to fetch when a user clicks on a room
const DEFAULT_ROOM_SUBSCRIPTION_INFO = {
  timeline_limit: 35,
  include_old_rooms: {
    timeline_limit: 0,
    required_state: REQUIRED_STATE_LIST,
  },
};

const UNENCRYPTED_SUBSCRIPTION_NAME = 'unencrypted';
const UNENCRYPTED_SUBSCRIPTION = {
  required_state: [
    [EventType.RoomMember, MSC3575_STATE_KEY_ME],
    [EventType.RoomMember, MSC3575_STATE_KEY_LAZY],
  ],
  ...DEFAULT_ROOM_SUBSCRIPTION_INFO,
};

const ENCRYPTED_SUBSCRIPTION = {
  required_state: [
    [MSC3575_WILDCARD, MSC3575_WILDCARD],
  ],
  ...DEFAULT_ROOM_SUBSCRIPTION_INFO,
};

const sssLists: Record<string, MSC3575List> = {
  invites: {
    ranges: [[0, 20]],
    timeline_limit: 1,
    required_state: REQUIRED_STATE_LIST,
    include_old_rooms: {
      timeline_limit: 0,
      required_state: REQUIRED_STATE_LIST,
    },
    filters: {
      is_invite: true,
    },
  },
  favorites: {
    ranges: [[0, 20]],
    timeline_limit: 10,
    sort: ['by_recency'],
    required_state: REQUIRED_STATE_LIST,
    include_old_rooms: {
      timeline_limit: 0,
      required_state: REQUIRED_STATE_LIST,
    },
    filters: {
      tags: ['m.favorite'],
    },
  },
  dms: {
    ranges: [[0, 20]],
    timeline_limit: 10,
    sort: ['by_recency'],
    required_state: REQUIRED_STATE_LIST,
    include_old_rooms: {
      timeline_limit: 0,
      required_state: REQUIRED_STATE_LIST,
    },
    filters: {
      is_dm: true,
      is_invite: false,
    },
  },
  untagged: {
    ranges: [[0, 20]],
    timeline_limit: 10,
    sort: ['by_recency'],
    required_state: REQUIRED_STATE_LIST,
    include_old_rooms: {
      timeline_limit: 0,
      required_state: REQUIRED_STATE_LIST,
    },
  },
};

export class SlidingSyncManager {
  private static readonly internalInstance = new SlidingSyncManager();

  public slidingSync?: SlidingSync;
  private client?: MatrixClient;
  private configureDefer = defer<void>();

  public static get instance(): SlidingSyncManager {
    return SlidingSyncManager.internalInstance;
  }

  private configure(client: MatrixClient, proxyUrl: string): SlidingSync {
    this.client = client;
    const lists = new Map();
    for (const listName in sssLists) {
      lists.set(listName, sssLists[listName]);
    }
    this.slidingSync = new SlidingSync(proxyUrl, lists, ENCRYPTED_SUBSCRIPTION, client, SLIDING_SYNC_TIMEOUT_MS);
    this.slidingSync.addCustomSubscription(UNENCRYPTED_SUBSCRIPTION_NAME, UNENCRYPTED_SUBSCRIPTION);
    this.configureDefer.resolve();
    return this.slidingSync;
  }

  /**
   * Sets up the room subscription and lazy loads the room if needed.
   * @param roomId The room
   */
  public async addRoomToSync(roomId: string): Promise<void> {
    await this.configureDefer.promise;
    if (!this.slidingSync) return;

    const subscriptions = this.slidingSync.getRoomSubscriptions();
    if (subscriptions.has(roomId)) return;

    subscriptions.add(roomId);

    const room = this.client?.getRoom(roomId);
    let shouldLazyLoad = false;
    if (room) {
      // do not lazy load encrypted rooms as we need the entire member list.
      shouldLazyLoad = !(await this.client?.getCrypto()?.isEncryptionEnabledInRoom(roomId));
    }
    if (shouldLazyLoad) {
      // Setup data to sync for this room
      this.slidingSync.useCustomSubscription(roomId, UNENCRYPTED_SUBSCRIPTION_NAME);
    }
    this.slidingSync.modifyRoomSubscriptions(subscriptions);
    if (room) {
      return;
    }

    return new Promise((resolve) => {
      const waitForRoom = (r: Room): void => {
        if (r.roomId === roomId) {
          this.client?.off(ClientEvent.Room, waitForRoom);
          resolve();
        }
      };
      this.client?.on(ClientEvent.Room, waitForRoom);
    });
  }

  /**
   * Batch fetch all of the user's rooms.
   * @param batchSize
   * @param gapBetweenRequestsMs
   */
  private async startRoomCrawl(
    slidingSync: SlidingSync,
    batchSize: number,
    gapBetweenRequestsMs: number
  ): Promise<void> {
    const listToUpperBound = new Map(
      Object.keys(sssLists).map((listName) => {
        return [listName, sssLists[listName].ranges[0][1]];
      })
    );

    const lifecycle = async (
      state: SlidingSyncState,
      _: MSC3575SlidingSyncResponse | null,
      err?: Error
    ): Promise<void> => {
      if (state !== SlidingSyncState.Complete) {
        return;
      }
      await sleep(gapBetweenRequestsMs);
      if (err) {
        return;
      }

      // for all lists with total counts > range => increase the range
      let hasSetRanges = false;
      listToUpperBound.forEach((currentUpperBound, listName) => {
        const totalCount = slidingSync.getListData(listName)?.joinedCount || 0;
        if (currentUpperBound < totalCount) {
          // increment the upper bound
          const newUpperBound = currentUpperBound + batchSize;
          listToUpperBound.set(listName, newUpperBound);
          slidingSync.setListRanges(listName, [[0, newUpperBound]]);
          hasSetRanges = true;
        }
      });
      if (!hasSetRanges) {
        // finish crawling
        slidingSync.off(SlidingSyncEvent.Lifecycle, lifecycle);
      }
    };
    slidingSync.on(SlidingSyncEvent.Lifecycle, lifecycle);
  }

  /**
   * Set up the Sliding Sync instance and crawl the user's rooms.
   * @param client MatrixClient instance
   * @returns SlidingSync instance
   */
  public async setup(client: MatrixClient): Promise<SlidingSync | undefined> {
    const slidingSync = this.configure(client, client.baseUrl);
    this.startRoomCrawl(slidingSync, 50, 50);
    return slidingSync;
  }
}
