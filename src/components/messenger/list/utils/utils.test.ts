import { getUserHandle, isUserAdmin, sortMembers } from './utils';
import { User } from '../../../../store/channels';

describe('sortMembers', () => {
  it('sorts members correctly with admins first, then online status and alphabetically', () => {
    const members = [
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam', isOnline: false },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie', isOnline: true },
      { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Brenda', isOnline: true },
    ] as any;
    const adminIds = ['matrix-id-2', 'matrix-id-3'];

    const sortedMembers = sortMembers(members, adminIds);

    const expectedOrder = [
      { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Brenda', isOnline: true },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie', isOnline: true },
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam', isOnline: false },
    ];

    expect(sortedMembers).toEqual(expectedOrder);
  });
});

describe('isUserAdmin', () => {
  it('returns true if the user is an admin', () => {
    const user = { userId: 'user1', matrixId: 'matrix-id-1' } as User;
    const adminIds = ['matrix-id-1', 'matrix-id-2'];

    expect(isUserAdmin(user, adminIds)).toBe(true);
  });

  it('returns false if the user is not an admin', () => {
    const user = { userId: 'user2', matrixId: 'matrix-id-3' } as User;
    const adminIds = ['matrix-id-1', 'matrix-id-2'];

    expect(isUserAdmin(user, adminIds)).toBe(false);
  });

  it('handles empty adminIds array', () => {
    const user = { userId: 'user1', matrixId: 'matrix-id-1' } as User;
    const adminIds: string[] = [];

    expect(isUserAdmin(user, adminIds)).toBe(false);
  });
});

describe('getUserHandle', () => {
  it('returns primaryZID when it is present', () => {
    const user = { primaryZID: 'zid123', wallets: [{ id: 'wallet-id-1', publicAddress: 'address456' }] };
    expect(getUserHandle(user.primaryZID, user.wallets)).toEqual('zid123');
  });

  it('returns truncated publicAddress from the first wallet when primaryZID is absent', () => {
    const user = { primaryZID: null, wallets: [{ id: 'wallet-id-1', publicAddress: '0x123456789' }] };
    expect(getUserHandle(user.primaryZID, user.wallets)).toEqual('0x1234...6789');
  });

  it('returns empty string when both primaryZID and wallets are absent', () => {
    const user = { primaryZID: null, wallets: [] };
    expect(getUserHandle(user.primaryZID, user.wallets)).toEqual('');
  });
});
