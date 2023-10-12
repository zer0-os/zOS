export interface ChatSession {
  deviceId: string;
  accessToken: string;
  userId: string;
}

export class SessionStorage {
  constructor(private storage = localStorage) {}

  set(session: ChatSession) {
    this.storage.setItem('mxz_device_id', session.deviceId);
    this.storage.setItem(`mxz_access_token_${session.deviceId}`, session.accessToken);
    this.storage.setItem('mxz_user_id', session.userId);
  }

  get(): ChatSession {
    const deviceId = this.storage.getItem('mxz_device_id');

    if (!deviceId) return null;

    return {
      deviceId,
      accessToken: this.storage.getItem(`mxz_access_token_${deviceId}`),
      userId: this.storage.getItem('mxz_user_id'),
    };
  }
}
