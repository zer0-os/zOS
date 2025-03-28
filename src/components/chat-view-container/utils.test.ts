import moment from 'moment';

import { AdminMessageType, Message as MessageModel, MediaType } from '../../store/messages';
import { createMessageGroups, getMessageRenderProps, filterAdminMessages, processMessages } from './utils';

describe(createMessageGroups, () => {
  it('returns an empty group list when input is empty', () => {
    const groups = createMessageGroups([]);

    expect(groups).toEqual([]);
  });

  it('creates separate groups for admin messages', () => {
    const firstTime = moment();
    const firstMessage = stubMessage({ isAdmin: true, createdAt: firstTime.valueOf() });
    const secondMessage = stubMessage({ isAdmin: true, createdAt: firstTime.add(1, 'minute').valueOf() });

    const groups = createMessageGroups([
      firstMessage,
      secondMessage,
    ]);

    expect(groups).toEqual([
      [firstMessage],
      [secondMessage],
    ]);
  });

  it('creates separate groups for separate senders', () => {
    const firstTime = moment();
    const firstMessage = stubMessage({ sender: stubUser({ userId: '1' }), createdAt: firstTime.valueOf() });
    const secondMessage = stubMessage({
      sender: stubUser({ userId: '2' }),
      createdAt: firstTime.add(1, 'minute').valueOf(),
    });

    const groups = createMessageGroups([
      firstMessage,
      secondMessage,
    ]);

    expect(groups).toEqual([
      [firstMessage],
      [secondMessage],
    ]);
  });

  it('groups messages within 5 minutes from the same sender', () => {
    const firstTime = moment();
    const sender = stubUser();
    const first = stubMessage({ sender, createdAt: firstTime.valueOf() });
    const second = stubMessage({ sender, createdAt: firstTime.add(1, 'minute').valueOf() });
    const third = stubMessage({ sender, createdAt: firstTime.add(7, 'minute').valueOf() });

    const groups = createMessageGroups([
      first,
      second,
      third,
    ]);

    expect(groups).toEqual([
      [
        first,
        second,
      ],
      [third],
    ]);
  });
});

describe(getMessageRenderProps, () => {
  describe('showTimestamp', () => {
    it('is true if the message is the last in the group', () => {
      const index = 4;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showTimestamp).toEqual(true);
    });

    it('is false if the message is _not_ the last in the group', () => {
      const index = 2;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showTimestamp).toEqual(false);
    });
  });

  describe('showAuthorName', () => {
    it('is true if the message is the first in the group', () => {
      const index = 0;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showAuthorName).toEqual(true);
    });

    it('is false if the message is _not_ the first in the group', () => {
      const index = 2;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showAuthorName).toEqual(false);
    });

    it('is false if the message is in a one on one chat', () => {
      const index = 0;
      const groupLength = 5;

      const props = getProps({ index, groupLength, isOneOnOne: true });

      expect(props.showAuthorName).toEqual(false);
    });

    it('is false if the current owner is the sender', () => {
      const index = 0;
      const groupLength = 5;

      const props = getProps({ index, groupLength, isOwner: true });

      expect(props.showAuthorName).toEqual(false);
    });
  });

  describe('position', () => {
    it('is "only" if there is only one message', () => {
      const index = 0;
      const groupLength = 1;

      const props = getProps({ index, groupLength });

      expect(props.position).toEqual('only');
    });

    it('is "first" if it is the first in the group', () => {
      const index = 0;
      const groupLength = 2;

      const props = getProps({ index, groupLength });

      expect(props.position).toEqual('first');
    });

    it('is "last" if it is the last in the group', () => {
      const index = 3;
      const groupLength = 4;

      const props = getProps({ index, groupLength });

      expect(props.position).toEqual('last');
    });

    it('is empty if it is in the middle', () => {
      const index = 2;
      const groupLength = 4;

      const props = getProps({ index, groupLength });

      expect(props.position).toEqual('');
    });
  });

  function getProps({
    index,
    groupLength,
    isOneOnOne = false,
    isOwner = false,
  }: {
    index: number;
    groupLength: number;
    isOneOnOne?: boolean;
    isOwner?: boolean;
  }) {
    return getMessageRenderProps(index, groupLength, isOneOnOne, isOwner);
  }
});

describe(filterAdminMessages, () => {
  it('does not filter out normal messages when no admin messages are present', () => {
    const messagesByDay = {
      '2023-01-01': [stubMessage(), stubMessage()],
      '2023-01-02': [stubMessage()],
    };

    const filteredMessages = filterAdminMessages(messagesByDay);

    expect(filteredMessages['2023-01-01']).toHaveLength(2);
    expect(filteredMessages['2023-01-02']).toHaveLength(1);
  });

  it('does not filter out CONVERSATION_STARTED if no JOINED_ZERO message is present', () => {
    const messagesByDay = {
      '2023-01-01': [stubMessage({ isAdmin: true, admin: { type: AdminMessageType.CONVERSATION_STARTED } })],
      '2023-01-02': [stubMessage()],
    };

    const filteredMessages = filterAdminMessages(messagesByDay);

    expect(filteredMessages['2023-01-01']).toHaveLength(1);
    expect(filteredMessages['2023-01-02']).toHaveLength(1);
  });

  it('retains JOINED_ZERO admin messages', () => {
    const messagesByDay = {
      '2023-01-01': [stubMessage({ isAdmin: true, admin: { type: AdminMessageType.JOINED_ZERO } })],
      '2023-01-02': [stubMessage()],
    };

    const filteredMessages = filterAdminMessages(messagesByDay);

    expect(filteredMessages['2023-01-01']).toHaveLength(1);
    expect(filteredMessages['2023-01-02']).toHaveLength(1);
  });

  it('filters out CONVERSATION_STARTED if JOINED_ZERO is present', () => {
    const messagesByDay = {
      '2023-01-01': [stubMessage({ isAdmin: true, admin: { type: AdminMessageType.JOINED_ZERO } })],
      '2023-01-02': [stubMessage({ isAdmin: true, admin: { type: AdminMessageType.CONVERSATION_STARTED } })],
      '2023-01-03': [stubMessage()],
    };
    const filteredMessages = filterAdminMessages(messagesByDay);

    expect(filteredMessages['2023-01-01']).toHaveLength(1);
    expect(filteredMessages['2023-01-02']).toHaveLength(0);
    expect(filteredMessages['2023-01-03']).toHaveLength(1);
  });
});

describe(processMessages, () => {
  it('processes messages with parent relationships', () => {
    const messages = [
      stubMessage({ id: '1', parentMessageId: '2', message: 'child message' }),
      stubMessage({
        id: '2',
        message: 'parent message',
        media: { url: 'url', type: MediaType.Image, width: 100, height: 100, name: 'image' },
      }),
    ];

    const { messages: processed } = processMessages(messages);

    expect(processed[0]).toEqual({
      ...messages[0],
      parentMessage: messages[1],
      parentMessageText: 'parent message',
      parentMessageMedia: { url: 'url', type: MediaType.Image, width: 100, height: 100, name: 'image' },
    });
    expect(processed[1]).toBe(messages[1]);
  });

  it('processes messages with root relationships', () => {
    const messages = [
      stubMessage({
        id: '1',
        rootMessageId: 'root-1',
        message: 'media message',
        media: { url: 'url', type: MediaType.Image, width: 100, height: 100, name: 'image' },
      }),
      stubMessage({ id: 'root-1', message: 'root message' }),
    ];

    const { messages: processed, mediaMessages } = processMessages(messages);

    expect(mediaMessages.get(processed[1].id)).toEqual(messages[0]);
  });

  it('handles optimistic IDs correctly', () => {
    const messages = [
      stubMessage({ id: '1', optimisticId: 'opt-1', message: 'message 1' }),
      stubMessage({ id: '2', optimisticId: 'opt-2', message: 'message 2' }),
    ];

    const { messages: processed } = processMessages(messages);

    expect(processed).toEqual(messages);
  });

  it('preserves message references', () => {
    const messages = [
      stubMessage({ id: '1', message: 'message 1' }),
      stubMessage({ id: '2', message: 'message 2' }),
    ];

    const { messages: processed } = processMessages(messages);

    expect(processed[0]).toBe(messages[0]);
    expect(processed[1]).toBe(messages[1]);
  });
});

function stubMessage(attrs: Partial<MessageModel> = {}) {
  return {
    id: 1,
    isAdmin: false,
    admin: null,
    ...attrs,
  } as MessageModel;
}

function stubUser(attrs = {}) {
  return {
    userId: 'stub-user-id',
    ...attrs,
  } as MessageModel['sender'];
}
