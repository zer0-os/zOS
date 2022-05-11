import window from 'global/window';

export class Client {
  constructor(private connection) { }

  connect(address: string) {
    this.connection.init(address);
  }
}

const startServer = (ipc) => new Promise((resolve) => {
  console.log('starting server');
  ipc.once('ZChainServerStarted', resolve);
  ipc.send('startZChainServer');
});

class IpcTransport {
  static SEND_CHANNEL = 'zchain-ipc-transport-main';
  static RECEIVE_CHANNEL = 'zchain-ipc-transport-renderer';

  get sendChannel() {
    return IpcTransport.SEND_CHANNEL;
  }

  get receiveChannel() {
    return IpcTransport.RECEIVE_CHANNEL;
  }

  constructor(private ipc) { }

  init(address: string) {
    this.send('init', { address });
  }

  private send(method, payload) {
    this.ipc.send(this.sendChannel, JSON.stringify({
      method,
      payload,
    }));
  }
}

export const client = {
  get: async () => {
    await startServer(window.ipc);

    console.log('started - returning client');

    return new Client(new IpcTransport(window.ipc));
  },
};
