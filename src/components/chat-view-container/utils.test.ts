import { groupMessages } from './utils';

/* This mock should contain all edge cases */
const MOCK_MESSAGES = [
  {
    createdAt: 1688556805208,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688556805275,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688556805735,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688556806146,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688556807460,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688557375867,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688557378744,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688557647212,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688557756566,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688559653164,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688559656068,
    sender: {
      userId: '09bec71a-2fa8-464f-9031-cc03e327d91d',
    },
  },
  {
    createdAt: 1688559881529,
    sender: {
      userId: '099984b0-898a-430d-b874-1c3990497ef4',
    },
  },
  {
    createdAt: 1688559884355,
    sender: {
      userId: '099984b0-898a-430d-b874-1c3990497ef4',
    },
  },
  {
    createdAt: 1688559894907,
    sender: {
      userId: '099984b0-898a-430d-b874-1c3990497ef4',
    },
  },
  {
    createdAt: 1688560560404,
    sender: {
      userId: '099984b0-898a-430d-b874-1c3990497ef4',
    },
  },
  {
    createdAt: 1688609568838,
    sender: {
      userId: '099984b0-898a-430d-b874-1c3990497ef4',
    },
  },
  {
    createdAt: 1688609583908,
    sender: {
      userId: '099984b0-898a-430d-b874-1c3990497ef4',
    },
  },
  {
    createdAt: 1688609591620,
    sender: {
      userId: '099984b0-898a-430d-b874-1c3990497ef4',
    },
  },
];

describe('assignGroupsToMessages', () => {
  it('should group correctly', () => {
    // @ts-ignore
    const messages = groupMessages(MOCK_MESSAGES);
    const groupings = messages.map((message) => message.groupPosition);

    expect(groupings).toEqual([
      0,
      1,
      1,
      1,
      2,
      0,
      1,
      1,
      2,
      0,
      2,
      0,
      1,
      2,
      3,
      0,
      1,
      2,
    ]);
  });
});
