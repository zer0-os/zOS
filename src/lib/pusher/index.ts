import Pusher, { UserAuthenticationOptions } from 'pusher-js';
import { config } from '../../config';

export default class PusherClient {
  pusher: Pusher;

  constructor() {
    const {
      pusher: { key, cluster },
    } = config;

    Pusher.Runtime.createXHR = function () {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true; // Permits our cookie to be passed along
      return xhr;
    };

    const sharedAuthenticationOptions = {
      endpoint: [
        config.ZERO_API_URL,
        '/authentication/pusher',
      ].join(''),
      headers: { 'X-APP-PLATFORM': 'zos' },
      transport: 'ajax',
    } as UserAuthenticationOptions;

    this.pusher = new Pusher(key, {
      cluster,
      userAuthentication: sharedAuthenticationOptions,
      channelAuthorization: sharedAuthenticationOptions,
    });
  }

  init(userId, events) {
    this.pusher.subscribe('presence-channel');

    const channel = this.pusher.subscribe(`notifications-${userId}`);

    events.forEach((event) => {
      channel.bind(event.key, (data) => {
        event.callback(data);
      });
    });
  }

  disconnect() {
    this.pusher.disconnect();
    this.pusher = null;
  }
}
