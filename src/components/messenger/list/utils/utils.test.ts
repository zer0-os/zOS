import { getTagForUser, isUserAdmin, isUserModerator, lastSeenText, sortMembers } from './utils';
import { User } from '../../../../store/channels';

describe('sortMembers', () => {
  it('sorts members correctly with admins first, then moderators, then online status and alphabetically', () => {
    const members = [
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam', isOnline: false },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie', isOnline: true },
      { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Brenda', isOnline: true },
      { userId: 'otherMember4', matrixId: 'matrix-id-4', firstName: 'David', isOnline: false },
      { userId: 'otherMember5', matrixId: 'matrix-id-5', firstName: 'Eve', isOnline: true },
      { userId: 'otherMember6', matrixId: 'matrix-id-6', firstName: 'Frank', isOnline: false },
      { userId: 'otherMember7', matrixId: 'matrix-id-7', firstName: 'Craig', isOnline: false },
    ] as any;
    const adminIds = ['matrix-id-2', 'matrix-id-3'];
    const moderatorIds = ['otherMember5', 'otherMember6'];

    const sortedMembers = sortMembers(members, adminIds, moderatorIds);
    const expectedOrder = [
      { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Brenda', isOnline: true },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie', isOnline: true },
      { userId: 'otherMember5', matrixId: 'matrix-id-5', firstName: 'Eve', isOnline: true },
      { userId: 'otherMember6', matrixId: 'matrix-id-6', firstName: 'Frank', isOnline: false },
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam', isOnline: false },
      { userId: 'otherMember7', matrixId: 'matrix-id-7', firstName: 'Craig', isOnline: false },
      { userId: 'otherMember4', matrixId: 'matrix-id-4', firstName: 'David', isOnline: false },
    ];

    expect(sortedMembers).toStrictEqual(expectedOrder);
  });

  it('sorts alphabetically by firstName', () => {
    const members = [
      { firstName: 'Zeb' },
      { firstName: '' },
      { firstName: 'Charlie' },
      { firstName: null },
      { firstName: 'Adam' },
    ] as any;

    const sortedMembers = sortMembers(members, [], []);
    const expectedOrder = [
      { firstName: '' },
      { firstName: null },
      { firstName: 'Adam' },
      { firstName: 'Charlie' },
      { firstName: 'Zeb' },
    ];

    expect(sortedMembers).toStrictEqual(expectedOrder);
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

describe(isUserModerator, () => {
  it('returns true if the user is a moderator', () => {
    const user = { userId: 'user1' } as User;
    const moderatorIds = ['user1', 'user2'];

    expect(isUserModerator(user, moderatorIds)).toBe(true);
  });

  it('returns false if the user is not a moderator', () => {
    const user = { userId: 'user3' } as User;
    const moderatorIds = ['user1', 'user2'];

    expect(isUserModerator(user, moderatorIds)).toBe(false);
  });

  it('handles empty moderatorIds array', () => {
    const user = { userId: 'user1' } as User;
    const moderatorIds: string[] = [];

    expect(isUserModerator(user, moderatorIds)).toBe(false);
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

describe(getTagForUser, () => {
  it('returns "Admin" if the user is an admin', () => {
    const user = { userId: 'user1', matrixId: 'matrix-id-1' } as User;
    const adminIds = ['matrix-id-1', 'matrix-id-2'];

    expect(getTagForUser(user, adminIds)).toBe('Admin');
  });

  it('returns "Mod" if the user is a moderator', () => {
    const user = { userId: 'user1' } as User;
    const moderatorIds = ['user1', 'user2'];

    expect(getTagForUser(user, [], moderatorIds)).toBe('Mod');
  });

  it('returns null if the user is not an admin or moderator', () => {
    const user = { userId: 'user2', matrixId: 'matrix-id-3' } as User;
    const adminIds = ['matrix-id-1', 'matrix-id-2'];

    expect(getTagForUser(user, adminIds)).toBe(null);
  });
});
