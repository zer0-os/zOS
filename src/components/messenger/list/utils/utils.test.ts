import { isUserAdmin, sortMembers } from './utils';
import { User } from '../../../../store/channels';

describe('sortMembers', () => {
  it('sorts members correctly with current user first, admins next, then online status and alphabetically', () => {
    const members: Partial<User>[] = [
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam', isOnline: false },
      { userId: 'currentUser', matrixId: 'matrix-id-current', firstName: 'Zara', isOnline: true },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie', isOnline: true },
      { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Brenda', isOnline: true },
    ];
    const adminIds = ['matrix-id-2', 'matrix-id-3'];
    const currentUserId = 'currentUser';

    const sortedMembers = sortMembers(members, adminIds, currentUserId);

    const expectedOrder: Partial<User>[] = [
      { userId: 'currentUser', matrixId: 'matrix-id-current', firstName: 'Zara', isOnline: true },
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
