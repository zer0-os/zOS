import { displayName, getUserSubHandle } from './user';

import { User } from '../store/channels';

describe('User Lib', () => {
  describe(displayName, () => {
    it('returns first and last name concatenated', () => {
      expect(displayName({ firstName: 'John', lastName: 'Doe' } as User)).toEqual('John Doe');
    });

    it('returns just first name', () => {
      expect(displayName({ firstName: 'John' } as User)).toEqual('John');
    });

    it('returns just last name', () => {
      expect(displayName({ lastName: 'Doe' } as User)).toEqual('Doe');
    });

    it('returns "Unknown" if neither is known', () => {
      expect(displayName({} as User)).toEqual('Unknown');
    });

    it('returns "Unknown" if user is not found', () => {
      expect(displayName(null)).toEqual('Unknown');
    });
  });

  describe(getUserSubHandle, () => {
    it('returns primaryZID when it is present', () => {
      const user = { primaryZID: 'zid123', primaryWallet: { id: 'wallet-id-1', publicAddress: 'address456' } };
      expect(getUserSubHandle(user.primaryZID, user.primaryWallet.publicAddress)).toEqual('zid123');
    });

    it('returns truncated publicAddress from the first wallet when primaryZID is absent', () => {
      const user = { primaryZID: null, primaryWallet: { id: 'wallet-id-1', publicAddress: '0x123456789' } };
      expect(getUserSubHandle(user.primaryZID, user.primaryWallet.publicAddress)).toEqual('0x1234...6789');
    });

    it('returns empty string when both primaryZID and wallets are absent', () => {
      const user = { primaryZID: null, primaryWallet: null };
      expect(getUserSubHandle(user.primaryZID, user.primaryWallet)).toEqual('');
    });
  });
});
