import moment from 'moment';

import { AdminMessageType, Message as MessageModel } from '../../store/messages';
import {
  createMessageGroups,
  getMessageRenderProps,
  filterAdminMessages,
  mapMessagesById,
  mapMessagesByRootId,
  linkParentMessage,
  linkMediaMessage,
} from './utils';

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

describe(mapMessagesById, () => {
  it('maps messages by their ID and optimistic ID', () => {
    const messages = [
      { id: '1', optimisticId: 'opt-1', message: 'message 1' },
      { id: '2', optimisticId: 'opt-2', message: 'message 2' },
    ];
    const result = mapMessagesById(messages);

    expect(result).toEqual({
      '1': messages[0],
      'opt-1': messages[0],
      '2': messages[1],
      'opt-2': messages[1],
    });
  });
});

describe(mapMessagesByRootId, () => {
  it('maps messages by their root ID', () => {
    const messages = [
      { id: '1', rootMessageId: 'root-1', message: 'message 1' },
      { id: '2', rootMessageId: 'root-2', message: 'message 2' },
    ];
    const result = mapMessagesByRootId(messages);

    expect(result).toEqual({
      'root-1': messages[0],
      'root-2': messages[1],
    });
  });
});

describe(linkParentMessage, () => {
  it('links a message to its parent and sets parent message text and media', () => {
    const messages = [
      { id: '1', parentMessageId: '2', message: 'child message' },
      { id: '2', message: 'parent message', media: 'media' },
    ];
    const messagesById = mapMessagesById(messages);
    const messagesByRootId = mapMessagesByRootId(messages);

    linkParentMessage(messages[0], messagesById, messagesByRootId);

    expect(messages[0]).toEqual({
      id: '1',
      parentMessageId: '2',
      message: 'child message',
      parentMessage: { id: '2', message: 'parent message', media: 'media' },
      parentMessageText: 'parent message',
      parentMessageMedia: 'media',
    });
  });
});

describe(linkMediaMessage, () => {
  it('links a media message to its root message', () => {
    const messages = [
      { id: '1', rootMessageId: 'root-1', message: 'media message', media: { media: 'media' } },
      { id: 'root-1', message: 'root message' },
    ];
    const messagesById = mapMessagesById(messages);
    const mediaMessages = [];
    const result = [];

    linkMediaMessage(messages[0], messagesById, mediaMessages, result);

    expect(messagesById['root-1'].media).toEqual({ id: '1', media: 'media' });
    expect(mediaMessages).toEqual([messages[0]]);
    expect(result).toEqual([]);
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
