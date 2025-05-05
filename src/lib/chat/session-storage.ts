export interface ChatSession {
  deviceId: string;
  userId: string;
}

export class SessionStorage {
  constructor(private storage = localStorage) {}

  clear() {
    const allKeys = Object.keys(this.storage);
    const filterKeys = allKeys.filter((key) => key.includes('mxjssdk_memory_filter') || key.includes('mxz_'));
    filterKeys.forEach((key) => this.storage.removeItem(key));
  }

  set(session: ChatSession) {
    this.storage.setItem('mxz_device_id', session.deviceId);
    this.storage.setItem('mxz_user_id', session.userId);
  }

  get(): ChatSession {
    const deviceId = this.storage.getItem('mxz_device_id');

    if (!deviceId) return null;

    return {
      deviceId,
      userId: this.storage.getItem('mxz_user_id'),
    };
  }
}
