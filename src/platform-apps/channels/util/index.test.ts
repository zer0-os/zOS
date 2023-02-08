import { otherMembersToString } from './index';

describe('otherMembersToString', () => {
  it('maps user names', async function () {
    const otherMembers = [
      {
        firstName: 'first-name',
        lastName: 'last-name',
      },
      {
        firstName: 'first-name-with-last-name-as-empty-string',
        lastName: '',
      },
      {
        firstName: '',
        lastName: 'last-name-with-first-name-as-empty',
      },
    ];

    const result = otherMembersToString(otherMembers as any);

    expect(result).toEqual(
      'first-name last-name, first-name-with-last-name-as-empty-string, last-name-with-first-name-as-empty'
    );
  });
});
