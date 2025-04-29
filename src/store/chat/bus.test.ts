import { createChatConnection, Events } from './bus';

describe('chat bus', () => {
  it('emits user joined channel event', async () => {
    const receivedEvents: any[] = [];
    function trackEvents(action) {
      receivedEvents.push(action);
    }

    // Set up the chat connection fully
    const { chatConnection, activate } = createChatConnection('user-id', 'token', stubClient as any);
    await chatConnection.take(trackEvents);
    await activate();
    // Consume the ChatConnectionComplete event
    await chatConnection.take(trackEvents);
    receivedEvents.pop();

    await stubClient.handlers.onOtherUserJoinedChannel('channel-id', 'user-id');
    await chatConnection.take(trackEvents);

    expect(receivedEvents.map((e) => e.type)).toEqual(['chat/channel/otherUserJoined']);
  });

  it('delays events until system is prepared to receive them', async () => {
    const receivedEvents: { type: Events; payload: any }[] = [];
    function trackEvents(action) {
      receivedEvents.push(action);
    }

    const { chatConnection, activate } = createChatConnection('user-id', 'token', stubClient as any);
    await chatConnection.take(trackEvents);

    stubClient.handlers.onOtherUserJoinedChannel('channel-id', 'user-id');
    expect(receivedEvents.map((e) => e.type)).toEqual([]);

    await activate();
    expect(receivedEvents.map((e) => e.type)).toEqual(['chat/channel/otherUserJoined']);
  });
});

const stubClient: {
  handlers: Record<string, any>;
  initChat: (handlers: Record<string, any>) => void;
  connect: jest.Mock;
  disconnect: jest.Mock;
} = {
  handlers: {},
  initChat(handlers: Record<string, any>) {
    this.handlers = handlers;
  },
  connect: jest.fn(),
  disconnect: jest.fn(),
};
