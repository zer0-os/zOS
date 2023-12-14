import { createChatConnection } from './bus';

describe('chat bus', () => {
  it('emits user joined channel event', async () => {
    const receivedEvents = [];
    function trackEvents(action) {
      receivedEvents.push(action);
    }

    const { chatConnection, activate } = createChatConnection('user-id', 'token', stubClient as any);
    chatConnection.take(trackEvents);
    await activate();

    await stubClient.handlers.onOtherUserJoinedChannel('channel-id', 'user-id');

    expect(receivedEvents.map((e) => e.type)).toEqual(['chat/channel/otherUserJoined']);
  });

  it('delays events until system is prepared to receive them', async () => {
    const receivedEvents = [];
    function trackEvents(action) {
      receivedEvents.push(action);
    }

    const { chatConnection, activate } = createChatConnection('user-id', 'token', stubClient as any);
    chatConnection.take(trackEvents);

    stubClient.handlers.onOtherUserJoinedChannel('channel-id', 'user-id');
    expect(receivedEvents.map((e) => e.type)).toEqual([]);

    await activate();
    expect(receivedEvents.map((e) => e.type)).toEqual(['chat/channel/otherUserJoined']);
  });
});

const stubClient = {
  handlers: null,
  initChat(handlers) {
    this.handlers = handlers;
  },
  connect: jest.fn(),
  disconnect: jest.fn(),
};
