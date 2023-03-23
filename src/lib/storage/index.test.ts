import { when } from 'jest-when';

import { resolveFromLocalStorageAsBoolean } from './';

describe('storage', () => {
  describe('resolveFromLocalStorage', () => {
    it('returns defaultValue when no data exists', () => {
      stubLocalStorageValue('key', null);

      let value = resolveFromLocalStorageAsBoolean('key', true);
      expect(value).toBeTrue();

      value = resolveFromLocalStorageAsBoolean('key', false);
      expect(value).toBeFalse();
    });

    it('returns defaultValue if data is bad', () => {
      stubLocalStorageValue('key', 'garbage');

      let value = resolveFromLocalStorageAsBoolean('key', true);
      expect(value).toBeTrue();

      value = resolveFromLocalStorageAsBoolean('key', false);
      expect(value).toBeFalse();
    });

    it('returns true if value is "true"', () => {
      stubLocalStorageValue('key', 'true');

      const value = resolveFromLocalStorageAsBoolean('key', true);
      expect(value).toBeTrue();
    });

    it('returns false if value is "false"', () => {
      stubLocalStorageValue('key', 'false');

      const value = resolveFromLocalStorageAsBoolean('key', true);
      expect(value).toBeFalse();
    });
  });
});

function stubLocalStorageValue(key: string, value: string | null) {
  global.localStorage.getItem = jest.fn();
  when(global.localStorage.getItem).calledWith(key).mockReturnValue(value);
}
