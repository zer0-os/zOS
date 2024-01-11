import { isUserAdmin, sortMembers } from './utils';
import { User } from '../../../../store/channels';

describe('sortMembers', () => {
  it('sorts members with admins first and others alphabetically', () => {
    const members = [
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
      { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Brenda' },
    ] as User[];
    const adminIds = ['matrix-id-2'];

    const sortedMembers = sortMembers(members, adminIds);

    const expectedOrder = [
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
      { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Brenda' },
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
