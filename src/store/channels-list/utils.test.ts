import { ConversationStatus } from '../channels';
import { toLocalChannel } from './utils';

describe(toLocalChannel, () => {
  it('maps the direct fields', async function () {
    const apiResponse = {
      id: 'channel-id',
      name: 'channel-name',
      icon: 'channel-icon',
      unreadCount: { total: 1, highlight: 0 },
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
});
