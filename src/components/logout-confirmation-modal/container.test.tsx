import { StoreBuilder } from '../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('when a backup exists', () => {
      const state = new StoreBuilder().withoutBackup();

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ backupExists: false, backupRestored: false })
      );
    });

    test('when a backup exists but is unrestored', () => {
      const state = new StoreBuilder().withUnrestoredBackup();

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ backupExists: true, backupRestored: false })
      );
    });

    test('when restored backup exists', () => {
      const state = new StoreBuilder().withRestoredBackup();

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ backupExists: true, backupRestored: true })
      );
    });
  });
});
