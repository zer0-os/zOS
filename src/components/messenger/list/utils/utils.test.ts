import { isUserAdmin, lastSeenText, sortMembers } from './utils';
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

describe('lastSeenText', () => {
  it('returns "Online" if the user is currently online', () => {
    const user = { isOnline: true };
    expect(lastSeenText(user)).toEqual('Online');
  });

  it('returns an empty string if lastSeenAt is more than 6 months ago', () => {
    const user = { isOnline: false, lastSeenAt: new Date('2020-01-01') };
    expect(lastSeenText(user)).toEqual('');
  });

  it('returns an empty string if lastSeenAt is null', () => {
    const user = { isOnline: false, lastSeenAt: null };
    expect(lastSeenText(user)).toEqual('');
  });
});
