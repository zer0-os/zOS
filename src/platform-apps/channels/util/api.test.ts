import { searchMentionableUsersForChannel } from './api';

describe('userMentionSearch', () => {
  it('maps to user mentions format', async function () {
    const user1 = { id: 'd-1', name: 'dale', profileImage: 'http://example.com' };
    const apiSearch = jest.fn().mockResolvedValue([user1]);

    const searchResults = await searchMentionableUsersForChannel(null, null, apiSearch);

    expect(searchResults).toEqual([{ id: 'd-1', display: 'dale', profileImage: 'http://example.com' }]);
  });
});
