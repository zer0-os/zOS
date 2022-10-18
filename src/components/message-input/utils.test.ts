import React from 'react';
import { User } from '../../store/channels';
import { getUsersForMentions } from './utils';

describe('getUsersForMentions', () => {
  const users: User[] = [
    {
      id: 'first-id',
      firstName: 'first-name',
      lastName: 'first-lname',
      profileId: 'pid',
      isOnline: false,
      profileImage: 'pimage',
      lastSeenAt: '12-09-22 10:22',
    },
    {
      id: 'second-id',
      firstName: 'second-name',
      lastName: 'second-lname',
      profileId: 'pid',
      isOnline: false,
      profileImage: 'pimage',
      lastSeenAt: '10-09-22 10:22',
    },
  ];
  it('return the correct UserForMention', () => {
    const search = 'first';

    expect(getUsersForMentions(search, users)).toStrictEqual([
      {
        display: 'first-name first-lname',
        id: 'first-id',
      },
    ]);
  });

  it('should return all users', () => {
    const search = '';

    expect(getUsersForMentions(search, users)).toStrictEqual([
      {
        display: 'first-name first-lname',
        id: 'first-id',
      },
      {
        display: 'second-name second-lname',
        id: 'second-id',
      },
    ]);
  });

  it('should return empty array', () => {
    const search = '';

    expect(getUsersForMentions(search, [])).toStrictEqual([]);
  });
});
