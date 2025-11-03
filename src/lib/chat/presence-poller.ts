import { IStatusResponse, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk/lib/matrix';

type PresenceInfo = { isOnline: boolean; lastSeenAt: string | null; ts: number };

const TTL_MS = 60 * 1000;
// mark the user as online if they have been active within the last 2 minutes
const RECENT_ACTIVITY_WINDOW_MS = 120 * 1000;
const MAX_CONCURRENCY = 10;
const MAX_TARGETS = 500; // cap to avoid large fanout

class PresencePollerImpl {
  private client: SDKMatrixClient | null = null;
  private onUpdate: ((matrixId: string, isOnline: boolean, lastSeenAt: string | null) => void) | null = null;
  private cache = new Map<string, PresenceInfo>();
  private targets: string[] = [];

  start(
    client: SDKMatrixClient,
    onUpdate: (matrixId: string, isOnline: boolean, lastSeenAt: string | null) => void
  ): void {
    this.client = client;
    this.onUpdate = onUpdate;
    this.setTargets([]);
  }

  stop(): void {
    this.cache.clear();
    this.targets = [];
  }

  /**
   * Sets the list of matrix IDs to poll for presence.
   * Replaces the entire target list.
   */
  setTargets(matrixIds: string[]): void {
    const deduped = Array.from(new Set(matrixIds)).slice(0, MAX_TARGETS);
    this.targets = deduped;
  }

  /**
   * Fetches presence for new matrix IDs that aren't in cache or are stale.
   * Called periodically (every 30s) to check for new/stale members.
   */
  async tick(): Promise<void> {
    if (!this.client || !this.onUpdate) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const now = Date.now();
    const stale = this.targets.filter((id) => {
      const info = this.cache.get(id);
      return !info || now - info.ts > TTL_MS;
    });
    if (stale.length === 0) return;

    // limit concurrent requests
    const batch = stale.slice(0, MAX_CONCURRENCY);
    await this.fetchPresenceFor(batch);
  }

  /**
   * Immediately fetches presence for specific matrix IDs, bypassing cache.
   * Used when new members are added to eligible channels.
   */
  async fetchForNewMembers(matrixIds: string[]): Promise<void> {
    if (!this.client || !this.onUpdate) return;
    const ids = Array.from(new Set(matrixIds)).slice(0, MAX_TARGETS);
    await this.fetchPresenceFor(ids);
  }

  private async fetchPresenceFor(matrixIds: string[]): Promise<void> {
    if (!this.client || !this.onUpdate) return;
    const now = Date.now();
    const ids = Array.from(new Set(matrixIds)).slice(0, MAX_TARGETS);
    for (let i = 0; i < ids.length; i += MAX_CONCURRENCY) {
      const batch = ids.slice(i, i + MAX_CONCURRENCY);
      await Promise.all(
        batch.map(async (matrixId) => {
          try {
            const res = await this.client.getPresence(matrixId);
            const lastActiveAgo = typeof res?.last_active_ago === 'number' ? res.last_active_ago : null;
            const lastSeenAt = lastActiveAgo !== null ? new Date(Date.now() - lastActiveAgo).toISOString() : null;
            const isOnline = this.isOnline(res);

            const prev = this.cache.get(matrixId);
            this.cache.set(matrixId, { isOnline, lastSeenAt, ts: now });
            if (!prev || prev.isOnline !== isOnline || prev.lastSeenAt !== lastSeenAt) {
              this.onUpdate(matrixId, isOnline, lastSeenAt);
            }
          } catch {}
        })
      );
    }
  }

  private isOnline(presence: IStatusResponse): boolean {
    if (presence?.presence === 'online') {
      return true;
    }

    const lastActiveAgo = typeof presence?.last_active_ago === 'number' ? presence.last_active_ago : null;
    if (lastActiveAgo === null) {
      return false;
    }

    return lastActiveAgo < RECENT_ACTIVITY_WINDOW_MS;
  }
}

export const PresencePoller = new PresencePollerImpl();
