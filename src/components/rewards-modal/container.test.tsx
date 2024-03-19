import { StoreBuilder } from '../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('gets TODO', () => {
      const state = new StoreBuilder().withActiveConversation({ id: 'conversation-id' });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ something: 'TODO' }));
    });
  });
});
