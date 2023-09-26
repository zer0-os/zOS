// Import your function and any necessary dependencies
import { getFilteredMembersForAutoComplete } from './utils';

// Example room members data
const roomMembers = {
  '@ratik21:zero-synapse-development.zer0.io': {
    avatar_url: null,
    display_name: 'ratik21',
  },
  '@dale.fukami:zero-synapse-development.zer0.io': {
    avatar_url: null,
    display_name: 'dale.fukami',
  },
};

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

  it('should return filtered members based on matrix ID if display name is NOT set', async () => {
    const filter = 'ratik21';
    const result = await getFilteredMembersForAutoComplete(
      {
        ...roomMembers,
        '@ratik21:zero-synapse-development.zer0.io': {
          avatar_url: null,
          display_name: '',
        },
      },
      filter
    );

    // Expect members with 'ratik21' in matrix ID
    expect(result).toEqual([
      {
        matrixId: '@ratik21:zero-synapse-development.zer0.io',
        displayName: 'ratik21',
        avatar_url: '',
      },
    ]);
  });

  it('should return case-insensitive results', async () => {
    const filter = 'RaTiK21'; // Case-insensitive filter
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect members with 'ratik21' in display name
    expect(result).toEqual([
      {
        matrixId: '@ratik21:zero-synapse-development.zer0.io',
        displayName: 'ratik21',
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
        matrixId: '@ratik21:zero-synapse-development.zer0.io',
        displayName: 'ratik21',
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
