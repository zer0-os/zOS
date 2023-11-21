import { uniqNormalizedList } from './utils';

describe(uniqNormalizedList, () => {
  it('uniqifies list with mix of ids and objects', async () => {
    const list = ['a', { id: 'a' }];

    const result = uniqNormalizedList(list, false);

    expect(result).toEqual(['a']);
  });

  it('uniqifies list favoring the first entry', async () => {
    const list = [
      { id: 'b', other: '1' },
      { id: 'b', other: '2' },
    ];

    const result = uniqNormalizedList(list, false);

    expect(result).toEqual([{ id: 'b', other: '1' }]);
  });

  it('uniqifies list favoring the last entry', async () => {
    const list = [
      { id: 'b', other: '1' },
      { id: 'b', other: '2' },
      { id: 'b', other: '3' },
    ];

    const result = uniqNormalizedList(list, true);

    expect(result).toEqual([{ id: 'b', other: '3' }]);
  });
});
