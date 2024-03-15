import { ConversationStatus } from '../channels';
import { toLocalChannel } from './utils';

describe(toLocalChannel, () => {
  it('maps the direct fields', async function () {
    const apiResponse = {
      id: 'channel-id',
      name: 'channel-name',
      icon: 'channel-icon',
      category: 'channel-category',
      unreadCount: 'unread-count',
      hasJoined: 'has-joined',
      createdAt: 1000003,
    };

    const channel = toLocalChannel(apiResponse);

    expect(channel).toMatchObject(apiResponse);
  });

  it('sets coversationStatus to created', async function () {
    const apiResponse = {};

    const channel = toLocalChannel(apiResponse);

    expect(channel.conversationStatus).toEqual(ConversationStatus.CREATED);
  });

  describe('lastMessage', () => {
    it('maps directly if exists from api', async function () {
      const apiResponse = { lastMessage: { id: 'message' } };

      const channel = toLocalChannel(apiResponse);

      expect(channel.lastMessage).toEqual({ id: 'message' });
    });

    it('is null if it does NOT exist from api', async function () {
      const apiResponse = {};

      const channel = toLocalChannel(apiResponse);

      expect(channel.lastMessage).toEqual(null);
    });
  });

  describe('groupChannelType', () => {
    it('maps directly if exists from api', async function () {
      const apiResponse = { groupChannelType: 'private' };

      const channel = toLocalChannel(apiResponse);

      expect(channel.groupChannelType).toEqual('private');
    });

    it('defaults to empty if it does NOT exist from api', async function () {
      const apiResponse = {};

      const channel = toLocalChannel(apiResponse);

      expect(channel.groupChannelType).toEqual('');
    });
  });
});
