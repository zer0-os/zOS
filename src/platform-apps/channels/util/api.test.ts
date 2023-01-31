import { searchMentionableUsersForChannel } from './api';

describe('userMentionSearch', () => {
  it('maps to user mentions format', async function () {
    const user1 = { id: 'd-1', name: 'dale' };
    const apiSearch = jest.fn().mockResolvedValue([user1]);

    const searchResults = await searchMentionableUsersForChannel(null, null, [user1] as any, apiSearch);

    expect(searchResults).toEqual([{ id: 'd-1', display: 'dale' }]);
  });

  it('includes only results in the allowedIds', async function () {
    const user1 = { id: 'd-1', name: 'dale' };
    const user2 = { id: 'd-2', name: '2-dale' };
    const user3 = { id: 'd-3', name: '3-dale' };
    const stubbedResponse = Promise.resolve([
      user1,
      user2,
      user3,
    ]);
    const apiSearch = mockForArguments('channel-id', 'da', stubbedResponse);
    const validUsers = [
      user1,
      user3,
    ] as any;

    const searchResults = await searchMentionableUsersForChannel('channel-id', 'da', validUsers, apiSearch);

    expect(searchResults.map((u) => u.id)).toEqual([
      'd-1',
      'd-3',
    ]);
  });
});

function mockForArguments(...mockArgs) {
  const result = mockArgs.pop();
  return jest.fn((...actualArgs) => {
    if (actualArgs.every((element, index) => element === mockArgs[index])) {
      return result;
    }
  });
}
