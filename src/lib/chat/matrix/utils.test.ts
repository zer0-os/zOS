// Import your function and any necessary dependencies
import { getFilteredMembersForAutoComplete } from './utils';

// Example room members data
const roomMembers = [
  {
    userId: '@domw:zero-synapse-development.zer0.io',
    matrixId: '@domw:zero-synapse-development.zer0.io',
    firstName: 'domw',
    lastName: '',
    profileId: '',
    isOnline: false,
    profileImage: '',
    lastSeenAt: '',
  },
  {
    userId: '@dale.fukami:zero-synapse-development.zer0.io',
    matrixId: '@dale.fukami:zero-synapse-development.zer0.io',
    firstName: 'dale.fukami',
    lastName: '',
    profileId: '',
    isOnline: false,
    profileImage: '',
    lastSeenAt: '',
  },
];

describe('getFilteredMembersForAutoComplete', () => {
  it('should return empty array if no matching members', async () => {
    const filter = 'xyz'; // No matching members
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    expect(result).toEqual([]);
  });

  it('should return filtered members based on display name', async () => {
    const filter = 'da';
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect members with 'da' in display name
    expect(result).toEqual([
      {
        matrixId: '@dale.fukami:zero-synapse-development.zer0.io',
        displayName: 'dale.fukami',
        avatar_url: '',
      },
    ]);
  });

  it('should return case-insensitive results', async () => {
    const filter = 'dOmW'; // Case-insensitive filter
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect members with 'ratik21' in display name
    expect(result).toEqual([
      {
        matrixId: '@domw:zero-synapse-development.zer0.io',
        displayName: 'domw',
        avatar_url: '',
      },
    ]);
  });

  it('should return all members if filter is empty', async () => {
    const filter = ''; // Empty filter
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect all members
    expect(result).toEqual([
      {
        matrixId: '@domw:zero-synapse-development.zer0.io',
        displayName: 'domw',
        avatar_url: '',
      },
      {
        matrixId: '@dale.fukami:zero-synapse-development.zer0.io',
        displayName: 'dale.fukami',
        avatar_url: '',
      },
    ]);
  });
});
