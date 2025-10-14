import { MatrixClient as SDKMatrixClient } from 'matrix-js-sdk/lib/matrix';

type PresenceInfo = { isOnline: boolean; lastSeenAt: string | null; ts: number };

const POLL_INTERVAL_MS = 30 * 1000;
const TTL_MS = 60 * 1000;
const MAX_CONCURRENCY = 10;
const MAX_TARGETS = 500; // cap to avoid large fanout

class PresencePollerImpl {
  private client: SDKMatrixClient | null = null;
  private onUpdate: ((matrixId: string, isOnline: boolean, lastSeenAt: string | null) => void) | null = null;
  private intervalId: number | null = null;
  private cache = new Map<string, PresenceInfo>();
  private targets: string[] = [];
  private baseTargets: string[] = [];
  private activeTargets: string[] = [];

  start(
    client: SDKMatrixClient,
    onUpdate: (matrixId: string, isOnline: boolean, lastSeenAt: string | null) => void
  ): void {
    this.client = client;
    this.onUpdate = onUpdate;
    this.stop();
    if (typeof window === 'undefined') return;
    this.intervalId = window.setInterval(() => this.tick(), POLL_INTERVAL_MS);
    this.combineTargets();
  }

  stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.cache.clear();
    this.targets = [];
  }

  private setTargets(matrixIds: string[]): void {
    const deduped = Array.from(new Set(matrixIds)).slice(0, MAX_TARGETS);
    this.targets = deduped;
  }

  setBaseTargets(matrixIds: string[]): void {
    this.baseTargets = Array.from(new Set(matrixIds));
    this.combineTargets();
    void this.fetchPresenceFor(matrixIds);
  }

  setActiveRoomMembers(matrixIds: string[]): void {
    this.activeTargets = Array.from(new Set(matrixIds));
    this.combineTargets();
    void this.fetchPresenceFor(matrixIds);
  }

  addBaseTarget(matrixId: string): void {
    if (this.baseTargets.includes(matrixId)) return;
    this.baseTargets = Array.from(new Set([...this.baseTargets, matrixId]));
    this.combineTargets();
    void this.fetchPresenceFor([matrixId]);
  }

  private combineTargets(): void {
    this.setTargets([...this.baseTargets, ...this.activeTargets]);
  }

  private async tick(): Promise<void> {
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

  private async fetchPresenceFor(matrixIds: string[]): Promise<void> {
    if (!this.client || !this.onUpdate) return;
    const now = Date.now();
    const ids = Array.from(new Set(matrixIds)).slice(0, MAX_TARGETS);
    for (let i = 0; i < ids.length; i += MAX_CONCURRENCY) {
      const batch = ids.slice(i, i + MAX_CONCURRENCY);
      await Promise.all(
        batch.map(async (matrixId) => {
          try {
            const res: any = await (this.client as any).getPresence(matrixId);
            const isOnline = res?.presence === 'online';
            const lastSeenAt = res?.last_active_ago ? new Date(Date.now() - res.last_active_ago).toISOString() : null;

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
}

export const PresencePoller = new PresencePollerImpl();
