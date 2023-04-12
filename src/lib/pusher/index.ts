import Pusher from 'pusher-js';
// import * as PusherTypes from 'pusher-js';

import { config } from '../../config';

export default class PusherClient {
  pusher: any;

  constructor() {
    const {
      pusher: { key, cluster },
    } = config;

    const url = [
      config.ZERO_API_URL,
      '/authentication/pusher',
    ].join('');
    console.log('ctor', url);
    this.pusher = null;

    Pusher.Runtime.createXHR = function () {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      return xhr;
    };

    this.pusher = new Pusher(key, {
      cluster: cluster,
      userAuthentication: {
        endpoint: [
          config.ZERO_API_URL,
          '/authentication/pusher',
        ].join(''),
        transport: 'ajax',
        headers: {
          'X-APP-PLATFORM': 'zos',
        },
      },
      channelAuthorization: {
        endpoint: [
          config.ZERO_API_URL,
          '/authentication/pusher',
        ].join(''),
        transport: 'ajax',
        headers: {
          'X-APP-PLATFORM': 'zos',
        },
      },
    });

    Pusher.logToConsole = true;
  }

  init(userId, events) {
    this.pusher.subscribe('presence-channel');

    const channel = this.pusher.subscribe(`notifications-${userId}`);

    for (const [
      key,
      callback,
    ] of Object.entries(events)) {
      channel.bind(key, (data) => {
        (callback as any)(data);
      });
    }
  }
}
