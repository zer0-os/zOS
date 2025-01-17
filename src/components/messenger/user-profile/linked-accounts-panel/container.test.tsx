import { Container } from './container';
import { Channel } from '../../../../store/channels';
import { config } from '../../../../config';

describe('Container', () => {
  describe('onTelegramBot', () => {
    it('opens existing conversation when one exists', () => {
      const openConversation = jest.fn();
      const createConversation = jest.fn();

      const container = new Container({
        existingConversations: [
          {
            id: 'existing-convo',
            isOneOnOne: true,
            otherMembers: [{ userId: config.telegramBotUserId }],
          } as Channel,
        ],
        telegramBotUserId: config.telegramBotUserId,
        openConversation,
        createConversation,
        onClose: () => {},
      });

      container.onTelegramBot();

      expect(openConversation).toHaveBeenCalledWith({ conversationId: 'existing-convo' });
      expect(createConversation).not.toHaveBeenCalled();
    });

    it('creates new conversation when none exists', () => {
      const openConversation = jest.fn();
      const createConversation = jest.fn();

      const container = new Container({
        existingConversations: [],
        telegramBotUserId: config.telegramBotUserId,
        openConversation,
        createConversation,
        onClose: () => {},
      });

      container.onTelegramBot();

      expect(createConversation).toHaveBeenCalledWith({
        userIds: [config.telegramBotUserId],
      });
      expect(openConversation).not.toHaveBeenCalled();
    });
  });
});
