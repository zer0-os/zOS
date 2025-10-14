import { MatrixClient as SDKMatrixClient } from 'matrix-js-sdk/lib/matrix';

type PresenceState = 'online' | 'unavailable';

const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const HEARTBEAT_THRESHOLD_MS = 30 * 1000;

class PresenceControllerImpl {
  private client: SDKMatrixClient | null = null;
  private heartbeatTimer: number | null = null;
  private boundVisibilityHandler = this.onVisibilityChange.bind(this);

  async start(client: SDKMatrixClient) {
    this.client = client;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    await this.publish('online');

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.boundVisibilityHandler);
    }

    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
    }
    this.heartbeatTimer = window.setInterval(() => {
      void this.runHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    if (typeof document !== 'undefined' && !document.hidden) {
      void this.runHeartbeat();
    }
  }

  stop() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    }
    this.client = null;
  }

  private async runHeartbeat(): Promise<void> {
    if (!this.client) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const userId = this.client.getUserId();
      if (!userId) return;
      const presence: any = await this.client.getPresence(userId);
      const lastActiveAgo = presence?.last_active_ago;
      if (typeof lastActiveAgo !== 'number') return;
      if (lastActiveAgo > HEARTBEAT_THRESHOLD_MS) {
        await this.publish('online');
      }
    } catch {}
  }

  private onVisibilityChange() {
    if (typeof document === 'undefined') return;
    if (!document.hidden) {
      void this.runHeartbeat();
    }
  }

  private async publish(state: PresenceState) {
    if (!this.client) return;
    try {
      await this.client.setPresence({ presence: state });
    } catch {}
  }
}

export const PresenceController = new PresenceControllerImpl();
