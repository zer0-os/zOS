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

  describe('isChannel', () => {
    it('is false when api is undefined', async function () {
      const apiResponse = { isChannel: undefined };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isChannel).toBe(true);
    });

    it('is false when api is null', async function () {
      const apiResponse = { isChannel: null };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isChannel).toBe(true);
    });

    it('isChannel true from Authenticated view', async function () {
      const apiResponse = { isChannel: true };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isChannel).toBe(true);
    });

    it('isChannel false from Authenticated view', async function () {
      const apiResponse = { isChannel: false };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isChannel).toBe(false);
    });
  });

  describe('isOneOnOne', () => {
    it('is true if it is a conversation and isDistinct and has a single other member', async function () {
      const apiResponse = { isChannel: false, isDistinct: true, otherMembers: [{ id: 'other' }] };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isOneOnOne).toBe(true);
    });

    it('is false if it is NOT a conversation', async function () {
      const apiResponse = { isChannel: true, isDistinct: true, otherMembers: [{ id: 'other' }] };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isOneOnOne).toBe(false);
    });

    it('is false if it is NOT isDistcint', async function () {
      const apiResponse = { isChannel: false, isDistinct: false, otherMembers: [{ id: 'other' }] };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isOneOnOne).toBe(false);
    });

    it('is false if there is more than one othe member', async function () {
      const apiResponse = {
        isChannel: false,
        isDistinct: true,
        otherMembers: [
          { id: 'other' },
          { id: 'second' },
        ],
      };

      const channel = toLocalChannel(apiResponse);

      expect(channel.isOneOnOne).toBe(false);
    });
  });
});
