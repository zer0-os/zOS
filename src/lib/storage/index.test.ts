import { resolveFromLocalStorageAsBoolean } from './';

describe('storage', () => {
  describe('resolveFromLocalStorage', () => {
    it('should use the key to get the data', () => {
      const storageKey = 'key-store';

      resolveFromLocalStorageAsBoolean(storageKey);
      expect(global.localStorage.getItem).toHaveBeenCalledWith(storageKey);
    });

    it('returns false in case no data is saved', () => {
      const value = resolveFromLocalStorageAsBoolean('key');
      expect(value).toEqual(false);
    });

    it('returns false', () => {
      global.localStorage.getItem = jest.fn().mockReturnValue('data hjere');

      const value = resolveFromLocalStorageAsBoolean('key');
      expect(value).toEqual(false);
    });

    it('returns true', () => {
      global.localStorage.getItem = jest.fn().mockReturnValue('true');

      const value = resolveFromLocalStorageAsBoolean('key');
      expect(value).toEqual(true);
    });
  });
});
