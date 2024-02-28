import { StoreBuilder } from '../../store/test/store';
import { Container } from './container';

describe(Container, () => {
  describe('mapState', () => {
    test('when a backup exists', () => {
      const state = new StoreBuilder().withoutBackup();

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ backupExists: false, backupVerified: false })
      );
    });

    test('when a backup exists but is unverified', () => {
      const state = new StoreBuilder().withUnrestoredBackup();

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ backupExists: true, backupVerified: false })
      );
    });

    test('when verified backup exists', () => {
      const state = new StoreBuilder().withRestoredBackup();

      expect(Container.mapState(state.build())).toEqual(
        expect.objectContaining({ backupExists: true, backupVerified: true })
      );
    });
  });
});
