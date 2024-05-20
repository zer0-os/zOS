import { StoreBuilder } from '../../store/test/store';
import { Container } from './container';
import { deleteMessage } from '../../store/messages';

describe(Container, () => {
  describe('mapState', () => {
    test('channelId', () => {
      const state = new StoreBuilder().withOtherState({
        dialogs: {
          deleteMessageId: 123,
        },
        chat: {
          activeConversationId: 'channel-1',
        },
      });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({
          channelId: 'channel-1',
        })
      );
    });

    test('deleteMessageId', () => {
      const state = new StoreBuilder().withOtherState({
        dialogs: {
          deleteMessageId: 123,
        },
        chat: {
          activeConversationId: 'channel-1',
        },
      });

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({
          deleteMessageId: 123,
        })
      );
    });
  });

  describe('mapActions', () => {
    test('deleteMessage', () => {
      const props = Container.mapActions({} as any);

      expect(props).toEqual(
        expect.objectContaining({
          deleteMessage,
        })
      );
    });
  });
});
