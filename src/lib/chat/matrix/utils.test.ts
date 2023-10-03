// Import your function and any necessary dependencies
import { getFilteredMembersForAutoComplete } from './utils';

// Example room members data
const roomMembers: any[] = [
  {
    userId: '@domw:zero-synapse-development.zer0.io',
    matrixId: '@domw:zero-synapse-development.zer0.io',
    firstName: 'domw',
    profileImage: '',
  },
  {
    userId: '6fec1869-4608-4f7e-ab32-e50376b58e30',
    matrixId: '@dale.fukami:zero-synapse-development.zer0.io',
    firstName: 'dale.fukami',
    lastName: '',
    profileId: 'a9d1b1a5-dc43-4860-93b6-fb63ee3ca911',
    profileImage: '',
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
        id: '6fec1869-4608-4f7e-ab32-e50376b58e30',
        displayName: 'dale.fukami ',
        profileImage: '',
      },
    ]);
  });

  it('should return case-insensitive results', async () => {
    const filter = 'dOmW'; // Case-insensitive filter
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect members with 'ratik21' in display name
    expect(result).toEqual([
      {
        id: '@domw:zero-synapse-development.zer0.io',
        displayName: 'domw ',
        profileImage: '',
      },
    ]);
  });

  it('should return all members if filter is empty', async () => {
    const filter = ''; // Empty filter
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect all members
    expect(result).toEqual([
      {
        id: '@domw:zero-synapse-development.zer0.io',
        displayName: 'domw ',
        profileImage: '',
      },
      {
        id: '6fec1869-4608-4f7e-ab32-e50376b58e30',
        displayName: 'dale.fukami ',
        profileImage: '',
      },
    ]);
  });
});
